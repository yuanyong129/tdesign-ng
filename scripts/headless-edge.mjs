#!/usr/bin/env node
/**
 * 启动 / 清理专用 headless Edge（给 CDP 探针用）。
 *
 * 为什么需要：多个会话并行时都会起 dev server + 探针，如果共用 9341 端口和同一个 profile 会互相抢。
 * 每个会话用自己的 CDP_PORT 与 profile 目录即可并存。
 *
 * 启动前会**自动剪枝**：删除 `.local-cache/edge-*` 里超过 PRUNE_HOURS（默认 12）小时没活动的 profile，
 * 正在被 msedge 占用的跳过，本次要用的 profile 也跳过。这样「一个会话一个 profile」不会把磁盘撑大
 * （历史上不剪枝时，一周积累到 4.4 GB）。
 *
 * 用法：
 *   node scripts/headless-edge.mjs start          # 默认 CDP_PORT=9341，profile=.local-cache/edge-<port>
 *   CDP_PORT=9411 node scripts/headless-edge.mjs start
 *   CDP_PORT=9411 PRUNE_HOURS=0 node scripts/headless-edge.mjs start   # 本次不剪枝
 *   node scripts/headless-edge.mjs kill           # 只杀 profile 目录在 .local-cache/edge-* 的实例
 *   node scripts/headless-edge.mjs clean          # 只剪枝（PRUNE_HOURS 默认 24），不启浏览器
 *
 * 注意：
 * - 绝不 `Stop-Process msedge`（会杀掉用户自己的浏览器）；只按 CommandLine 里 `edge-` 的 profile 匹配。
 * - 参数必须带 --disable-background-timer-throttling 等三项，否则后台页 rAF 被节流，Angular 变更检测不跑。
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pruneEdgeProfiles } from './lib/cache.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CDP_PORT = process.env.CDP_PORT || '9341';
const profile = resolve(ROOT, process.env.PROFILE_DIR || `.local-cache/edge-${CDP_PORT}`);
const action = process.argv[2] || 'start';

const EDGE_CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

function edgePath() {
  const found = EDGE_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error('找不到 msedge.exe，请手动设置 EDGE_PATH');
  return process.env.EDGE_PATH || found;
}

/**
 * 剪枝陈旧 profile；返回释放的 MB。
 * PRUNE_HOURS=0 时跳过（并行会话想复用旧 profile 时用得上）。
 */
function prune(hours, keepPath) {
  if (!(hours > 0)) return 0;
  const cacheDir = join(ROOT, '.local-cache');
  const result = pruneEdgeProfiles({
    cacheDir,
    keep: keepPath,
    olderThanMs: hours * 3600 * 1000,
  });
  if (result.removed.length) {
    console.log(`剪枝陈旧 profile ${result.removed.length} 个，释放 ${result.freedMb} MB`);
  }
  if (result.skippedInUse.length) {
    console.log(`跳过使用中的 profile：${result.skippedInUse.join('、')}`);
  }
  return result.freedMb;
}

if (action === 'start') {
  prune(Number(process.env.PRUNE_HOURS ?? 12), profile);
  mkdirSync(profile, { recursive: true });
  const args = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    'about:blank',
  ];
  const child = spawn(edgePath(), args, { stdio: 'ignore', detached: true });
  child.unref();
  console.log(`headless Edge 已启动：CDP 端口 ${CDP_PORT}，profile ${profile}`);
  console.log(`验证：curl http://127.0.0.1:${CDP_PORT}/json/version`);
} else if (action === 'kill') {
  const ps = spawn(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -match 'local-cache[\\\\/]+edge-' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null }",
    ],
    { stdio: 'inherit' },
  );
  ps.on('exit', (code) => console.log(`清理完成（exit ${code}）`));
} else if (action === 'clean') {
  const freed = prune(Number(process.env.PRUNE_HOURS ?? 24), '');
  console.log(`剪枝完成，释放约 ${freed} MB`);
} else {
  console.error('用法：node scripts/headless-edge.mjs start|kill|clean');
  process.exit(1);
}
