/**
 * 缓存清理的共享工具（headless-edge / clean-cache 共用）。
 *
 * 背景：每次 CDP 实拍都会新建一个 Edge `--user-data-dir`，Edge 会往里写 Cache / Code Cache /
 * GPUCache / Service Worker，单个 80~570 MB。历史上不做清理时，一个仓库一周就涨到 5 GB。
 * 所以「启动前剪枝 + 收工清理」必须做成默认行为，而不是靠人记得。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** 目录大小（MB），用于汇报「释放了多少」。 */
export function dirSizeMb(dir) {
  let total = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        try {
          total += statSync(full).size;
        } catch {
          /* 文件可能正被占用，忽略 */
        }
      }
    }
  }
  return Math.round(total / 1024 / 1024);
}

/** 目录里最新的修改时间（毫秒）；空目录回退到目录自身 mtime。 */
export function newestMtime(dir) {
  let newest = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      try {
        const stat = statSync(full);
        if (stat.mtimeMs > newest) newest = stat.mtimeMs;
        if (entry.isDirectory()) stack.push(full);
      } catch {
        /* 忽略 */
      }
    }
  }
  if (!newest) {
    try {
      newest = statSync(dir).mtimeMs;
    } catch {
      newest = 0;
    }
  }
  return newest;
}

/** 当前正在被 msedge 使用的 `--user-data-dir` 集合（小写、反斜杠归一）。 */
export function inUseProfiles() {
  const used = new Set();
  try {
    const out = execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        "Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Select-Object -ExpandProperty CommandLine",
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    for (const match of out.matchAll(/--user-data-dir=(?:"([^"]+)"|([^\s]+))/g)) {
      const raw = (match[1] || match[2] || '').trim();
      if (raw) used.add(normalize(raw));
    }
  } catch {
    /* 拿不到进程列表时按「都不在用」处理，由调用方决定是否保守跳过 */
  }
  return used;
}

function normalize(path) {
  return resolve(path).replace(/\\/g, '/').toLowerCase();
}

/**
 * 剪枝陈旧 Edge profile。
 *
 * @param {object} options
 * @param {string} options.cacheDir `.local-cache` 的绝对路径
 * @param {string} [options.keep] 本次要用的 profile（绝不删）
 * @param {number} options.olderThanMs 多久没活动算陈旧（0 表示不看时间，只跳过在用的）
 * @param {boolean} [options.dryRun]
 * @returns {{ removed: Array<{ name: string, mb: number }>, freedMb: number, skippedInUse: string[] }}
 */
export function pruneEdgeProfiles({ cacheDir, keep, olderThanMs, dryRun = false }) {
  const removed = [];
  const skippedInUse = [];
  const keepPath = keep ? normalize(keep) : '';
  const cutoff = olderThanMs > 0 ? Date.now() - olderThanMs : Number.POSITIVE_INFINITY;
  const used = inUseProfiles();

  let entries = [];
  try {
    entries = readdirSync(cacheDir, { withFileTypes: true });
  } catch {
    return { removed, freedMb: 0, skippedInUse };
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('edge-')) continue;
    const full = join(cacheDir, entry.name);
    const key = normalize(full);
    if (key === keepPath) continue;
    if (used.has(key)) {
      skippedInUse.push(entry.name);
      continue;
    }
    if (newestMtime(full) >= cutoff) continue;
    const mb = dirSizeMb(full);
    if (!dryRun) {
      rmSync(full, { recursive: true, force: true, maxRetries: 2, retryDelay: 200 });
    }
    removed.push({ name: entry.name, mb });
  }

  return { removed, freedMb: removed.reduce((sum, item) => sum + item.mb, 0), skippedInUse };
}

/** 删除一个路径并返回释放的 MB（不存在则返回 0）。 */
export function removePath(path, { dryRun = false } = {}) {
  if (!existsSync(path)) return 0;
  const mb = dirSizeMb(path);
  if (!dryRun) rmSync(path, { recursive: true, force: true, maxRetries: 2, retryDelay: 200 });
  return mb;
}
