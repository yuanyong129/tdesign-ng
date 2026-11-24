#!/usr/bin/env node
/**
 * 单页探针：用 CDP 打开文档站的若干页面，抓「标题 / demo / API 表 / 控制台报错 / 4xx / 指定选择器命中数」，可选截图。
 *
 * 为什么要入库：本地无法用 `ng build` 做视觉验证，CDP 是唯一能证明「页面真的渲染了」的手段。
 * 所有会话共用这一份，避免各自写一次性脚本。
 *
 * 用法：
 *   node scripts/cdp-page.mjs /button /table           # 探针 N 个页面
 *   CDP_PORT=9411 node scripts/cdp-page.mjs /table     # 指定 CDP 端口（默认 9341）
 *   PORT=4301 node scripts/cdp-page.mjs /table         # 指定文档站端口（默认 4200）
 *   PROBES=".t-table,.t-table__body" node scripts/cdp-page.mjs /table
 *   SHOT=1 SHOT_DIR=.local-cache/shots node scripts/cdp-page.mjs /table
 *
 * 前置：headless Edge 已用 `--remote-debugging-port=<CDP_PORT>` 启动（见 HANDOFF.md §6）。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.PAGE_BASE || `http://127.0.0.1:${process.env.PORT || 4280}`;
const CDP_PORT = process.env.CDP_PORT || '9341';
const SHOT_DIR = resolve(ROOT, process.env.SHOT_DIR || '.local-cache');
const paths = process.argv.slice(2);

if (!paths.length) {
  console.error('用法：node scripts/cdp-page.mjs <path> [<path> ...]');
  process.exit(1);
}

const PROBES = (process.env.PROBES || process.env.PAGE_PROBES || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
const target = list.find((t) => t.type === 'page');
if (!target) {
  console.error(`CDP 端口 ${CDP_PORT} 上没有 page target，确认 headless Edge 已启动`);
  process.exit(1);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, reject) => {
  ws.addEventListener('open', resolveOpen, { once: true });
  ws.addEventListener('error', reject, { once: true });
});

let seq = 0;
const pending = new Map();
let issues = [];
let failed = [];

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve: done, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : done(msg.result);
    return;
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    issues.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    const details = msg.params.exceptionDetails;
    issues.push('exc: ' + (details.exception?.description ?? details.text).slice(0, 200));
  }
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    issues.push('log: ' + msg.params.entry.text.slice(0, 200));
  }
  if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
    failed.push(msg.params.response.status + ' ' + msg.params.response.url.replace(BASE, ''));
  }
});

const send = (method, params = {}) => {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolveSend, reject) => pending.set(id, { resolve: resolveSend, reject }));
};

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r.result.value;
};

await send('Runtime.enable');
await send('Log.enable');
await send('Network.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1200, deviceScaleFactor: 1, mobile: false });

for (const path of paths) {
  issues = [];
  failed = [];
  await send('Page.navigate', { url: BASE + path });
  await new Promise((r) => setTimeout(r, 2500));
  const info = await evaluate(`(() => {
    const one = (s) => document.querySelector(s);
    const many = (s) => [...document.querySelectorAll(s)];
    return {
      title: one('.docs-page__title')?.textContent.trim() ?? null,
      demos: many('docs-demo').map((d) => d.id),
      apiTables: many('api-table').length,
      apiRows: many('.api-table tbody tr').length,
      hints: many('.demo-hint').map((h) => h.textContent.trim().slice(0, 40)),
      probes: ${JSON.stringify(PROBES)}.map((s) => [s, many(s).length]),
    };
  })()`);
  if (process.env.SHOT) {
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    mkdirSync(SHOT_DIR, { recursive: true });
    const file = resolve(SHOT_DIR, `page-${path.replace(/[^a-z0-9-]/gi, '_') || 'root'}.png`);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    info.shot = file;
  }
  console.log(
    JSON.stringify({ path, ...info, badResources: [...new Set(failed)], issues: [...new Set(issues)] }, null, 1),
  );
}

ws.close();
