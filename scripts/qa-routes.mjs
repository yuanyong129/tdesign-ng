// 文档站全路由布局巡检：逐条打开 DOCS_NAV 里的路由，检查标题、示例数量、
// 右侧锚点导航、横向滚动与 console 异常。
//
// 前置：headless Edge 以 --remote-debugging-port=9341 启动（见 HANDOFF §6），
// 文档站 dev server 已就绪（默认 http://localhost:4280）。
//
// 用法：
//   node scripts/qa-routes.mjs                        # 全部路由 @1400
//   node scripts/qa-routes.mjs --width=390            # 移动端宽度
//   node scripts/qa-routes.mjs --routes=/button,/table
//   PAGE_BASE=http://127.0.0.1:4200 node scripts/qa-routes.mjs
import { readFileSync } from 'node:fs';

const BASE = process.env.PAGE_BASE ?? 'http://localhost:4280';
const CDP = process.env.CDP_ENDPOINT ?? 'http://127.0.0.1:9341';

const navSrc = readFileSync('packages/docs/src/app/docs/nav.ts', 'utf8');
const allRoutes = [...navSrc.matchAll(/path:\s*'(\/[^']+)'/g)].map((m) => m[1]);
const argRoutes = process.argv.find((a) => a.startsWith('--routes='));
const routes = argRoutes ? argRoutes.slice(9).split(',').filter(Boolean) : allRoutes;
const widthArg = process.argv.find((a) => a.startsWith('--width='));
const width = Number(widthArg ? widthArg.slice(8) : 1400);

let list;
try {
  list = await (await fetch(`${CDP}/json/list`)).json();
} catch {
  console.error(`无法连接 CDP（${CDP}）：请先启动 headless Edge，见 HANDOFF §6。`);
  process.exit(1);
}
const target = list.find((t) => t.type === 'page');
if (!target) {
  console.error('CDP 没有可用的 page target。');
  process.exit(1);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});
let seq = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    return;
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push((msg.params.exceptionDetails.exception?.description ?? '').slice(0, 160));
  }
});
const send = (method, params = {}) => {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
};
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });

const results = [];
for (const route of routes) {
  errors.length = 0;
  await send('Page.navigate', { url: BASE + route });
  await new Promise((r) => setTimeout(r, 1300));
  try {
    const info = await evaluate(`(() => {
      const page = document.querySelector('.docs-page');
      const stages = [...document.querySelectorAll('.demo__stage')];
      const overflow = [...document.querySelectorAll('body *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2) && getComputedStyle(el).position !== 'fixed';
      }).slice(0, 5).map((el) => el.className || el.tagName);
      return JSON.stringify({
        title: page?.querySelector('.docs-page__title')?.textContent?.trim() ?? null,
        demos: document.querySelectorAll('.demo').length,
        toc: document.querySelectorAll('.docs-toc__link').length,
        docW: document.documentElement.scrollWidth,
        inner: window.innerWidth,
        hScroll: (() => {
          const de = document.documentElement;
          const before = de.scrollLeft;
          de.scrollLeft = 9999;
          const moved = de.scrollLeft;
          de.scrollLeft = before;
          return moved > 0;
        })(),
        widest: Math.max(0, ...stages.map((s) => s.scrollWidth)),
        overflow,
      });
    })()`);
    results.push({ route, ...JSON.parse(info), errors: [...new Set(errors)] });
  } catch (error) {
    results.push({ route, evaluateError: String(error).slice(0, 200) });
  }
}

const bad = results.filter(
  (r) =>
    !r.title ||
    r.hScroll ||
    (r.toc === 0 && r.demos > 0) ||
    r.evaluateError ||
    r.errors?.length,
);
console.log(JSON.stringify({ base: BASE, width, total: results.length, badCount: bad.length, bad, sample: results.slice(0, 3) }, null, 2));
ws.close();
