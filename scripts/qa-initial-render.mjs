#!/usr/bin/env node
/** 共享初始渲染与 SPA 路由往返样式回归，覆盖全部示例状态与尺寸。
 * 前置：文档开发服务与 headless-edge；PORT=4307 CDP_PORT=9477 node scripts/qa-initial-render.mjs
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

// Include every demo/state/size on each page, including controls nested in Form/Card.
const routes = ['input', 'input-number', 'radio', 'select', 'tag-input', 'range-input',
  'checkbox', 'switch', 'textarea', 'select-input', 'auto-complete', 'cascader', 'tree-select',
  'date-picker', 'date-range-picker', 'time-picker', 'form', 'card', 'link', 'breadcrumb',
  'layout', 'slider', 'tag', 'check-tag', 'menu', 'back-top'];

try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base + '/button' });
  await send('Page.bringToFront');
  let ready = false;
  for (let retry = 0; retry < 100; retry++) {
    try { ready = await evaluate(`!!document.querySelector('button-docs')`); } catch { /* navigation */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Docs must load');
  // A full loop warms the lazy routes; a second loop covers cached component creation.
  for (let round = 0; round < 2; round++) {
    for (const route of routes) {
      const result = await evaluate(`(async () => {
        const route = ${JSON.stringify('/' + route)};
        const originalDocument = document;
        const animations = new Set();
        let samples = 0;
        const sample = () => {
          if (location.pathname !== route) return;
          for (const animation of document.getAnimations()) {
            const target = animation.effect?.target;
            if (!animation.transitionProperty || !target?.closest('docs-demo')) continue;
            animations.add(target.tagName + '.' + target.getAttribute('class') + ': ' + animation.transitionProperty);
          }
          samples++;
        };
        const observer = new MutationObserver(sample);
        observer.observe(document.body, { childList: true, subtree: true });
        document.querySelector('a[href="' + route + '"]').click();
        const deadline = performance.now() + 10000;
        while (location.pathname !== route || !document.querySelector(route.slice(1) + '-docs docs-demo')) {
          if (performance.now() > deadline) throw new Error('Route not ready: ' + route);
          await new Promise(requestAnimationFrame);
        }
        for (let frame = 0; frame < 24; frame++) { sample(); await new Promise(requestAnimationFrame); }
        observer.disconnect();
        return { animations: [...animations], samples, sameDocument: originalDocument === document,
          pending: document.querySelectorAll('[data-t-initial-render]').length };
      })()`);
      assert.ok(result.sameDocument, 'Use SPA navigation');
      assert.ok(result.samples >= 24, 'Must inspect each frame');
      assert.equal(result.pending, 0, `${route}: restore transitions after first render`);
      assert.deepEqual(result.animations, [], `${route}: no transitions from initial styles (round ${round + 1})`);
      console.log(`PASS ${route} round ${round + 1}: ${result.samples} samples, no initial transitions or remaining guards`);
    }
  }

  const interaction = await evaluate(`(async () => {
    const frame = () => new Promise(requestAnimationFrame);
    const visit = async route => {
      document.querySelector('a[href="/' + route + '"]').click();
      while (location.pathname !== '/' + route || !document.querySelector(route + '-docs')) await frame();
      await frame(); await frame();
    };
    await visit('radio');
    const group = document.querySelector('demo-radio-filled t-radio-group');
    const block = group.querySelector('.t-radio-group__bg-block');
    const before = block.getBoundingClientRect().left;
    group.querySelectorAll('label')[1].click();
    let slide = false;
    for (let i = 0; i < 8; i++) {
      await frame();
      slide ||= block.getAnimations().some(a => a.transitionProperty === 'transform');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const moved = block.getBoundingClientRect().left > before;
    await visit('switch');
    const control = document.querySelector('t-switch:not(.t-is-disabled)');
    control.click();
    let toggle = false;
    for (let i = 0; i < 8; i++) {
      await frame();
      toggle ||= control.getAnimations({ subtree: true }).some(a => a.transitionProperty === 'transform');
    }
    await visit('tag-input');
    const editor = document.querySelector('t-tag-input input');
    const node = editor.closest('.t-input');
    editor.focus({ preventScroll: true });
    let focus = false;
    for (let i = 0; i < 8; i++) {
      await frame();
      focus ||= node.getAnimations().some(a => a.transitionProperty === 'border-top-color');
    }
    // Real Loading spinners continue under an initialization guard, including inside other controls.
    await visit('loading');
    const loading = document.querySelector('demo-loading-basic t-loading');
    loading.setAttribute('data-t-initial-render', '');
    const keyframes = loading.getAnimations({ subtree: true }).some(a => a.animationName && a.playState === 'running');
    loading.removeAttribute('data-t-initial-render');
    return { slide, moved, toggle, focus, keyframes };
  })()`);
  for (const [key, value] of Object.entries(interaction)) assert.equal(value, true, `Normal interaction: ${key}`);
  console.log('PASS interaction transitions: Radio slide, Switch toggle, TagInput focus; keyframes preserved');
  assert.deepEqual(failures, [], 'No browser exceptions');
} finally {
  socket.close();
  await fetch(`${endpoint}/json/close/${created.id}`);
}
