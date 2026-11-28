#!/usr/bin/env node
/** Input / InputNumber 首次进入与 SPA 往返的首帧样式回归。
 * 前置：文档开发服务与 headless-edge；PORT=4307 CDP_PORT=9477 node scripts/qa-input-route-styles.mjs
 * 不禁用动画，不刷新页面；聚焦过渡也必须保留。
 */
import assert from 'node:assert/strict';

const base = process.env.PAGE_BASE || `http://localhost:${process.env.PORT || 4280}`;
const endpoint = `http://127.0.0.1:${process.env.CDP_PORT || 9341}`;
const created = await (await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' })).json();
const socket = new WebSocket(created.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let sequence = 0;
const pending = new Map();
const failures = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const task = pending.get(message.id);
    if (!task) return;
    pending.delete(message.id);
    clearTimeout(task.timer);
    message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
  } else if (message.method === 'Runtime.exceptionThrown') {
    failures.push(JSON.stringify(message.params.exceptionDetails));
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base + '/input' });
  await send('Page.bringToFront');
  let ready = false;
  for (let retry = 0; retry < 100; retry++) {
    try { ready = await evaluate(`!!document.querySelector('demo-input-basic .t-input')`); } catch { /* navigation */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Input page must load');
  const results = await evaluate(`(async () => {
    const selectors = {
      '/input': 'demo-input-basic .t-input',
      '/input-number': 'demo-input-number-basic .t-input',
      '/button': 't-button button',
    };
    const results = [];
    const documentAtStart = document;
    for (const route of ['/input', '/input-number', '/input', '/button', '/input', '/input-number', '/button', '/input-number']) {
      const samples = [];
      const sample = () => {
        if (location.pathname !== route) return;
        for (const element of document.querySelectorAll(selectors[route])) {
          if (route === '/button') continue;
          const style = getComputedStyle(element);
          samples.push({ border: style.borderTopWidth, height: element.getBoundingClientRect().height,
            animations: element.getAnimations().map(animation => animation.transitionProperty || animation.animationName) });
        }
      };
      // 记录 DOM 插入后与每一帧的样式，避免只检查动画结束后的最终截图。
      const observer = new MutationObserver(sample);
      observer.observe(document.body, { childList: true, subtree: true });
      if (location.pathname !== route) document.querySelector('a[href="' + route + '"]').click();
      const deadline = performance.now() + 10000;
      while (location.pathname !== route || !document.querySelector(selectors[route])) {
        if (performance.now() > deadline) throw new Error('Route not ready: ' + route);
        await new Promise(requestAnimationFrame);
      }
      for (let frame = 0; frame < 24; frame++) { sample(); await new Promise(requestAnimationFrame); }
      observer.disconnect();
      let focusAnimated = false;
      if (route !== '/button') {
        const element = document.querySelector(selectors[route]);
        element.querySelector('input').focus({ preventScroll: true });
        for (let frame = 0; frame < 5; frame++) {
          await new Promise(requestAnimationFrame);
          focusAnimated ||= element.getAnimations().some(animation => animation.transitionProperty === 'border-top-color');
        }
        element.querySelector('input').blur();
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      results.push({ route, samples, focusAnimated, sameDocument: document === documentAtStart });
    }
    return results;
  })()`);
  for (const result of results) {
    assert.ok(result.sameDocument, 'Navigation must remain within the SPA');
    if (result.route === '/button') continue;
    assert.ok(result.samples.length, `${result.route}: must sample inserted controls`);
    assert.ok(result.samples.every(sample => sample.border === '1px' && sample.height === 32),
      `${result.route}: first frame must already have its final border and height`);
    assert.ok(result.samples.every(sample => sample.animations.length === 0),
      `${result.route}: route entry must not animate from unstyled defaults`);
    assert.ok(result.focusAnimated, `${result.route}: normal focus transitions must remain enabled`);
    console.log(`PASS ${result.route}: ${result.samples.length} stable samples, focus animation preserved`);
  }
  assert.deepEqual(failures, [], 'No browser exceptions');
} finally {
  socket.close();
  await fetch(`${endpoint}/json/close/${created.id}`);
}
