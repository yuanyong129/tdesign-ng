#!/usr/bin/env node
/**
 * 清理本地缓存（避免仓库被 QA 产物撑大）。
 *
 * 为什么需要：headless Edge 的 profile 单个 80~570 MB，CDP 实拍一多，`.local-cache` 一周能涨到 5 GB；
 * `packages/dist` 里还可能有一次性 `ng new` 造的消费方测试工程（自带 node_modules，近 300 MB）。
 * 这些都在 .gitignore 里，删掉不影响仓库，但需要有人记得删——所以做成命令。
 *
 * 用法：
 *   node scripts/clean-cache.mjs                 # 默认：删 24 小时前的 edge-* + 临时工程 + 构建缓存
 *   node scripts/clean-cache.mjs --dry-run       # 只报告，不删
 *   node scripts/clean-cache.mjs --hours 6       # 改阈值（小时）
 *   node scripts/clean-cache.mjs --all           # 连今天的 profile 也删（正在被浏览器占用的仍跳过）
 *   node scripts/clean-cache.mjs --logs 3        # 顺带删 3 天前的 *.log / 探针截图（默认 7 天，0 = 不动）
 *
 * 安全边界：
 * - 只处理 `.local-cache/edge-*`、`.local-cache/*.log`、`.local-cache/*.png`、`packages/dist/.consumer-smoke`、
 *   `node_modules/.cache/ng-packagr` 这几类明确的弃置件；
 * - 正在被 msedge 使用的 profile 一律跳过（并行会话不会被打断）；
 * - 任何删除前都打印路径。
 */
import { readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pruneEdgeProfiles, removePath } from './lib/cache.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.local-cache');
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const all = argv.includes('--all');
const hours = all ? 0 : Number(argValue('--hours', 24));
const logDays = Number(argValue('--logs', 7));

function argValue(flag, fallback) {
  const index = argv.indexOf(flag);
  if (index === -1) return fallback;
  const value = Number(argv[index + 1]);
  return Number.isFinite(value) ? value : fallback;
}

const report = [];
let freed = 0;

// 1) 陈旧 Edge profile
const pruned = pruneEdgeProfiles({
  cacheDir: CACHE,
  olderThanMs: hours > 0 ? hours * 3600 * 1000 : 0,
  dryRun,
});
freed += pruned.freedMb;
report.push(
  `${dryRun ? '将删除' : '已删除'} Edge profile ${pruned.removed.length} 个（${pruned.freedMb} MB）` +
    (pruned.removed.length ? `：${pruned.removed.map((item) => `${item.name} ${item.mb}MB`).join('、')}` : ''),
);
if (pruned.skippedInUse.length) {
  report.push(`跳过使用中的 profile：${pruned.skippedInUse.join('、')}`);
}

// 2) dist 里的一次性消费方工程
for (const relative of ['packages/dist/.consumer-smoke', 'packages/dist/.smoke', 'node_modules/.cache/ng-packagr']) {
  const target = join(ROOT, relative);
  const mb = removePath(target, { dryRun });
  if (mb) {
    freed += mb;
    report.push(`${dryRun ? '将删除' : '已删除'} ${relative}（${mb} MB）`);
  }
}

// 3) 旧日志与探针截图（`--logs 0` 表示不动）
const logCutoff = Date.now() - logDays * 24 * 3600 * 1000;
let strayFiles = 0;
let strayMb = 0;
if (logDays > 0) {
  for (const entry of readdirSync(CACHE, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!/\.(log|png|jpg)$/i.test(entry.name)) continue;
    const full = join(CACHE, entry.name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.mtimeMs >= logCutoff) continue;
    if (!dryRun) rmSync(full, { force: true });
    strayFiles += 1;
    strayMb += Math.max(1, Math.round(stat.size / 1024 / 1024));
  }
}
if (strayFiles) {
  freed += strayMb;
  report.push(`${dryRun ? '将删除' : '已删除'} ${logDays} 天前的日志/截图 ${strayFiles} 个（${strayMb} MB）`);
}

console.log(report.join('\n'));
console.log(`${dryRun ? '预计可释放' : '共释放'}约 ${freed} MB${dryRun ? '（--dry-run，未真正删除）' : ''}`);
if (!dryRun) {
  console.log('提示：`pnpm verify` 会重新生成 packages/dist 与 node_modules/.cache，属正常现象。');
}
