#!/usr/bin/env node
/** 组件完善交互回归（第 1 轮及第 2 轮首批）。前置：开发文档站 + scripts/headless-edge.mjs。
 * PORT=4307 CDP_PORT=9477 node scripts/qa-component-completion.mjs
 * 在独立 CDP 页面运行；剪贴板 mock 只影响此测试页面，不读写用户剪贴板。
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
  } else if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    failures.push(`${message.params.response.status} ${message.params.response.url}`);
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
async function page(route, selector) {
  await send('Page.navigate', { url: base + route });
  await send('Page.bringToFront');
  for (let retry = 0; retry < 100; retry++) {
    try {
      if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}) && window.ng)`)) return;
    } catch { /* navigation may replace the execution context */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Page not ready: ${route}`);
}
const settle = 'await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));';

try {
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.enable');
  await page('/textarea', 'demo-textarea-validate textarea');
  const textarea = await evaluate(`(async () => {
    const root = document.querySelector('demo-textarea-validate');
    const [input, limited] = root.querySelectorAll('textarea');
    const component = ng.getComponent(root.querySelector('t-textarea'));
    const events = [];
    const subscription = component.validate.subscribe(event => events.push(event.error ?? 'valid'));
    const changeEvents = [];
    const changes = component.valueChange.subscribe(value => changeEvents.push(value));
    const edit = async value => { input.value = value; input.dispatchEvent(new Event('input', {bubbles: true})); ${settle} };
    await edit('1234567'); await edit('12345678'); await edit('123');
    input.dispatchEvent(new KeyboardEvent('keypress', {key:'a', bubbles:true})); ${settle}
    const keyCount = ng.getComponent(root).keys();
    input.dispatchEvent(new CompositionEvent('compositionstart', {bubbles:true}));
    input.value = '中文'; input.dispatchEvent(new InputEvent('input', {bubbles:true, isComposing:true})); ${settle}
    const beforeCompositionEnd = changeEvents.length;
    input.dispatchEvent(new CompositionEvent('compositionend', {bubbles:true}));
    input.dispatchEvent(new InputEvent('input', {bubbles:true})); ${settle}
    const compositionChanges = changeEvents.length - beforeCompositionEnd;
    limited.value = '中文测试'; limited.dispatchEvent(new Event('input', {bubbles:true})); ${settle}
    component.writeValue('123456789'); ng.applyChanges(component); ${settle}
    component.writeValue(''); ng.applyChanges(component); ${settle}
    subscription.unsubscribe(); changes.unsubscribe();
    return {events, keyCount, compositionChanges, limited: limited.value, nativeMax: input.getAttribute('maxlength')};
  })()`);
  assert.deepEqual(textarea.events, ['exceed-maximum', 'valid', 'exceed-maximum', 'valid']);
  assert.equal(textarea.keyCount, 1);
  assert.equal(textarea.compositionChanges, 1);
  assert.equal(textarea.limited, '中文测');
  assert.equal(textarea.nativeMax, null);
  console.log('PASS Textarea: overflow/recovery, programmatic values, weighted limit, IME, keypress once');

  await page('/tabs', 'demo-tabs-action .t-tabs__nav-action');
  const tabs = await evaluate(`(async () => {
    const root = document.querySelector('demo-tabs-action');
    const before = root.querySelector('.t-is-active.t-tabs__nav-item').textContent.trim();
    root.querySelector('.t-tabs__nav-action button').click(); ${settle}
    const tabs = ng.getComponent(root.querySelector('t-tabs'));
    tabs.scrollNav('next'); ${settle}
    tabs.scrollNav('next'); ${settle}
    await new Promise(resolve => setTimeout(resolve, 400));
    const items = root.querySelectorAll('t-tabs:first-of-type .t-tabs__nav-item');
    const lastRight = items[items.length - 1].getBoundingClientRect().right;
    const actionLeft = root.querySelector('.t-tabs__operations--right').getBoundingClientRect().left;
    return {count: ng.getComponent(root).refreshes(), before,
      after: root.querySelector('.t-is-active.t-tabs__nav-item').textContent.trim(),
      actions: root.querySelectorAll('.t-tabs__nav-action').length,
      addButton: Boolean(root.querySelector('.t-tabs__add-btn')), lastVisible: lastRight <= actionLeft + 2};
  })()`);
  assert.equal(tabs.count, 1); assert.equal(tabs.before, tabs.after);
  assert.equal(tabs.actions, 2); assert.equal(tabs.addButton, true);
  assert.equal(tabs.lastVisible, true, 'Last tab must not be hidden behind the action area');
  console.log('PASS Tabs: template/string actions, action click preserves selection, add button coexists');

  await page('/rate', 'demo-rate-icon .t-rate__item');
  const rate = await evaluate(`(async () => {
    const root = document.querySelector('demo-rate-icon');
    const demo = ng.getComponent(root);
    const items = root.querySelectorAll('t-rate:first-of-type .t-rate__item');
    const item = items[3]; item.scrollIntoView();
    const click = async () => { const rect = item.getBoundingClientRect();
      item.dispatchEvent(new MouseEvent('click', {bubbles:true, clientX:rect.left + rect.width/4})); ${settle} };
    await click(); const half = demo.value(); await click();
    const disabled = root.querySelectorAll('t-rate')[1];
    disabled.querySelector('.t-rate__item').dispatchEvent(new MouseEvent('click', {bubbles:true})); ${settle}
    return {half, cleared:demo.value(), disabled: disabled.querySelectorAll('.t-rate__item--full').length,
      icons: root.querySelectorAll('t-rate:first-of-type svg').length};
  })()`);
  assert.equal(rate.half, 3.5); assert.equal(rate.cleared, 0); assert.equal(rate.disabled, 3); assert.equal(rate.icons, 10);
  console.log('PASS Rate: custom template/string, half rating, clear, disabled');

  await page('/descriptions', 'demo-descriptions-content .t-descriptions__content');
  const descriptions = await evaluate(`(async () => {
    const root = document.querySelector('demo-descriptions-content');
    root.querySelector('.t-descriptions__content button').click(); ${settle}
    return {count:root.querySelector('.t-descriptions__content strong')?.textContent,
      content:root.textContent, buttons:root.querySelectorAll('.t-descriptions__content button').length};
  })()`);
  assert.equal(descriptions.count, '1'); assert.equal(descriptions.buttons, 1);
  assert.ok(descriptions.content.includes('显示此内容'));
  assert.ok(!descriptions.content.includes('不显示的投影'));
  assert.ok(descriptions.content.includes('默认投影也支持纯文本'));
  console.log('PASS Descriptions: projected component interaction, dynamic binding, explicit content precedence');

  await page('/typography', 'demo-typography-copyable button');
  const copy = await evaluate(`(async () => {
    const root = document.querySelector('demo-typography-copyable');
    const writes = [];
    Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText: async text => {writes.push(text);}}});
    const buttons = root.querySelectorAll('button');
    buttons[0].click(); ${settle}
    buttons[1].click(); ${settle}
    const copies = ng.getComponent(root).copies();
    const suffix = buttons[1].textContent.trim();
    const disabled = buttons[2].disabled; buttons[2].click(); ${settle}
    navigator.clipboard.writeText = async () => { throw new Error('denied'); };
    buttons[0].click(); ${settle}
    return {writes, copies, suffix, disabled, failed:root.textContent.includes('复制失败'), after:ng.getComponent(root).copies()};
  })()`);
  assert.equal(copy.writes.length, 2);
  assert.equal(copy.writes[0].trim(), '可复制的默认投影内容'); assert.equal(copy.writes[1], 'TD-2026');
  assert.equal(copy.copies, 1); assert.equal(copy.suffix, '完成'); assert.equal(copy.disabled, true);
  assert.equal(copy.failed, true); assert.equal(copy.after, 1);
  console.log('PASS Text: content/custom text, suffix state, success callback, disabled, clipboard rejection');
  await page('/check-tag', 'demo-check-tag-props t-check-tag');
  const checkTag = await evaluate(`(async () => {
    const root = document.querySelector('demo-check-tag-props');
    const demo = ng.getComponent(root);
    const [standalone, disabled, formTag] = root.querySelectorAll(':scope > t-check-tag');
    const initial = {checked:standalone.getAttribute('aria-checked'),
      theme:standalone.classList.contains('t-tag--success'),
      large:standalone.classList.contains('t-size-l'),
      round:standalone.classList.contains('t-tag--round'),
      color:standalone.style.color, title:standalone.querySelector('[title]')?.title,
      maxWidth:standalone.querySelector('span.t-tag--text')?.style.maxWidth};
    standalone.querySelector('.t-tag__icon-close').dispatchEvent(new MouseEvent('click', {bubbles:true})); ${settle}
    const closePreservesChecked = standalone.getAttribute('aria-checked');
    standalone.querySelector('.t-tag__icon-close').dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})); ${settle}
    standalone.click(); ${settle}
    const unchecked = {warning:standalone.classList.contains('t-tag--warning'),
      outline:standalone.classList.contains('t-tag--outline'), color:standalone.style.color,
      round:standalone.classList.contains('t-tag--round'), close:!!standalone.querySelector('.t-tag__icon-close')};
    standalone.dispatchEvent(new KeyboardEvent('keydown', {key:' ', bubbles:true})); ${settle}
    disabled.click(); formTag.click(); ${settle}
    const disabledStates = [disabled.getAttribute('aria-checked'), formTag.getAttribute('aria-checked')];
    demo.control.enable(); ${settle}
    formTag.click(); ${settle}
    const groupTags = root.querySelectorAll('t-check-tag-group t-check-tag');
    groupTags[1].click(); groupTags[2].click(); ${settle}
    const multiple = [...demo.value()];
    const groupTheme = groupTags[1].classList.contains('t-tag--success');
    const groupSize = groupTags[0].classList.contains('t-size-s') && groupTags[1].classList.contains('t-size-l');
    groupTags[0].dispatchEvent(new KeyboardEvent('keydown', {key:' ', bubbles:true})); ${settle}
    const keyboard = [...demo.value()];
    demo.multiple.set(false); demo.value.set([]); ng.applyChanges(demo); ${settle}
    groupTags[0].click(); ${settle} groupTags[1].click(); ${settle}
    return {initial, closePreservesChecked, closes:demo.closes(), unchecked,
      rechecked:standalone.getAttribute('aria-checked'), disabledStates, formValue:demo.control.value,
      multiple, keyboard, groupTheme, groupSize, single:[...demo.value()]};
  })()`);
  assert.equal(checkTag.initial.checked, 'true'); assert.equal(checkTag.initial.theme, true);
  assert.equal(checkTag.initial.large, true); assert.equal(checkTag.initial.round, true);
  assert.equal(checkTag.initial.color, 'rgb(0, 82, 217)'); assert.equal(checkTag.initial.title, '选中配置');
  assert.equal(checkTag.initial.maxWidth, '120px'); assert.equal(checkTag.closePreservesChecked, 'true');
  assert.equal(checkTag.closes, 2); assert.equal(checkTag.unchecked.warning, true);
  assert.equal(checkTag.unchecked.outline, true); assert.equal(checkTag.unchecked.color, '');
  assert.equal(checkTag.unchecked.round, false); assert.equal(checkTag.unchecked.close, false);
  assert.equal(checkTag.rechecked, 'true'); assert.deepEqual(checkTag.disabledStates, ['true', 'false']);
  assert.equal(checkTag.formValue, true); assert.deepEqual(checkTag.multiple, ['a', 'b']);
  assert.deepEqual(checkTag.keyboard, ['b']); assert.deepEqual(checkTag.single, ['b']);
  assert.equal(checkTag.groupTheme, true); assert.equal(checkTag.groupSize, true);
  console.log('PASS CheckTag/Group: appearance reset, explicit priority, close events, CVA disabled, single/multiple, keyboard');

  await page('/button', 'demo-button-loading-props button');
  const buttonLoading = await evaluate(`(async () => {
    const root = document.querySelector('demo-button-loading-props');
    const demo = ng.getComponent(root);
    demo.loading.set(true); ng.applyChanges(demo); ${settle}
    const buttons = root.querySelectorAll('button');
    const loaders = root.querySelectorAll('t-loading');
    const immediate = loaders[0].textContent.includes('提交中');
    const inherited = !!loaders[0].querySelector('.t-loading--inherit-color.t-size-s');
    const delayed = !loaders[1].querySelector('.t-loading');
    const delayedMargin = parseFloat(getComputedStyle(buttons[1].querySelector('.t-button__text')).marginLeft);
    buttons[0].dispatchEvent(new MouseEvent('click', {bubbles:true})); ${settle}
    const blocked = demo.clicks();
    await new Promise(resolve => setTimeout(resolve, 600)); ${settle}
    const delayedVisible = !!loaders[1].querySelector('.t-loading.t-size-l');
    const visibleMargin = parseFloat(getComputedStyle(buttons[1].querySelector('.t-button__text')).marginLeft);
    demo.loading.set(false); ng.applyChanges(demo); ${settle}
    buttons[0].click(); ${settle}
    return {immediate, inherited, delayed, delayedMargin, visibleMargin, blocked, delayedVisible,
      removed:root.querySelectorAll('t-loading').length, clicks:demo.clicks()};
  })()`);
  assert.equal(buttonLoading.immediate, true); assert.equal(buttonLoading.inherited, true);
  assert.equal(buttonLoading.delayed, true); assert.equal(buttonLoading.blocked, 0);
  assert.equal(buttonLoading.delayedVisible, true); assert.equal(buttonLoading.removed, 0);
  assert.equal(buttonLoading.delayedMargin, 0); assert.equal(buttonLoading.visibleMargin, 8);
  assert.equal(buttonLoading.clicks, 1);
  console.log('PASS Button.loadingProps: text/size/color, delay, click suppression, loading removal');

  await page('/card', 'demo-card-loading-props t-card button');
  const cardLoading = await evaluate(`(async () => {
    const root = document.querySelector('demo-card-loading-props');
    const demo = ng.getComponent(root);
    const card = root.querySelector('t-card');
    card.querySelector('button').click(); ${settle}
    demo.loading.set(true); ng.applyChanges(demo); ${settle}
    const hidden = card.querySelector('.t-card__body > div').style.display;
    const delayed = !card.querySelector('.t-loading');
    await new Promise(resolve => setTimeout(resolve, 600)); ${settle}
    const configured = !!card.querySelector('.t-loading.t-size-l.t-loading--inherit-color') && card.textContent.includes('读取中');
    demo.loading.set(false); ng.applyChanges(demo); ${settle}
    const preserved = card.querySelector('button').textContent.includes('1');
    const visible = card.querySelector('.t-card__body > div').style.display;
    demo.firstFullscreen.set(true); demo.secondFullscreen.set(true); ng.applyChanges(demo); ${settle}
    const lockedWithTwo = document.body.classList.contains('t-loading--lock');
    // 创建并销毁卡片内的行内 Loading，不应释放两层全屏 Loading 的锁。
    demo.loading.set(true); ng.applyChanges(demo); ${settle}
    demo.loading.set(false); demo.firstFullscreen.set(false); ng.applyChanges(demo); ${settle}
    const lockedWithOne = document.body.classList.contains('t-loading--lock');
    demo.secondFullscreen.set(false); ng.applyChanges(demo); ${settle}
    const released = !document.body.classList.contains('t-loading--lock');
    // 原本由外部持有的同名锁不应被 Loading 擅自删除。
    document.body.classList.add('t-loading--lock');
    demo.firstFullscreen.set(true); ng.applyChanges(demo); ${settle}
    demo.firstFullscreen.set(false); ng.applyChanges(demo); ${settle}
    const externalLockPreserved = document.body.classList.contains('t-loading--lock');
    document.body.classList.remove('t-loading--lock');
    await new Promise(resolve => setTimeout(resolve, 600)); ${settle}
    return {hidden, delayed, configured, preserved, visible, lockedWithTwo, lockedWithOne, released,
      externalLockPreserved, staleLoader:!!card.querySelector('.t-loading')};
  })()`);
  assert.equal(cardLoading.hidden, 'none'); assert.equal(cardLoading.delayed, true);
  assert.equal(cardLoading.configured, true); assert.equal(cardLoading.preserved, true);
  assert.equal(cardLoading.visible, ''); assert.equal(cardLoading.lockedWithTwo, true);
  assert.equal(cardLoading.lockedWithOne, true); assert.equal(cardLoading.released, true);
  assert.equal(cardLoading.externalLockPreserved, true); assert.equal(cardLoading.staleLoader, false);
  console.log('PASS Card.loadingProps/Loading: delay, retained content, cancelled timers, multiple/external scroll locks');

  await page('/sticky-tool', 'demo-sticky-tool-popup-props .t-sticky-item');
  const stickyPopup = await evaluate(`(async () => {
    const root = document.querySelector('demo-sticky-tool-popup-props');
    root.scrollIntoView(); ${settle}
    const items = root.querySelectorAll('.t-sticky-item');
    items[0].click(); ${settle}
    const panel = document.querySelector('.sticky-shared-panel.sticky-item-panel');
    const popup = ng.getComponent(root.querySelector('t-popup'));
    const opened = !!panel;
    const classes = !!panel?.querySelector('.t-sticky-tool-popup-content.sticky-shared-inner.sticky-item-inner');
    const arrow = !!panel?.querySelector('.t-popup__arrow');
    const zIndex = panel?.style.zIndex;
    const placement = popup.placement();
    const trigger = popup.trigger();
    items[0].click(); await new Promise(resolve => setTimeout(resolve, 180)); ${settle}
    const destroyed = !document.querySelector('.sticky-item-panel');
    items[1].click(); ${settle}
    const disabled = !document.querySelector('.sticky-shared-panel');
    return {opened, classes, arrow, zIndex, placement, trigger, destroyed, disabled,
      clicks:ng.getComponent(root).clicks()};
  })()`);
  assert.equal(stickyPopup.opened, true); assert.equal(stickyPopup.classes, true);
  assert.equal(stickyPopup.arrow, true); assert.equal(stickyPopup.zIndex, '2100');
  assert.equal(stickyPopup.placement, 'top'); assert.equal(stickyPopup.trigger, 'click');
  assert.equal(stickyPopup.destroyed, true); assert.equal(stickyPopup.disabled, true);
  assert.equal(stickyPopup.clicks, 3);
  console.log('PASS StickyTool.popupProps: shared/item precedence, explicit trigger, class merging, z-index, disabled/destroy');

  await page('/menu', 'demo-menu-popup-props t-submenu');
  const menuPopup = await evaluate(`(async () => {
    const root = document.querySelector('demo-menu-popup-props');
    root.scrollIntoView(); ${settle}
    const menus = root.querySelectorAll('t-menu');
    const submenus = menus[0].querySelectorAll('t-submenu');
    submenus[0].querySelector('.t-menu__item').click(); ${settle}
    const panel = document.querySelector('.menu-custom-panel');
    const opened = !!panel;
    const themed = panel?.classList.contains('t-menu--dark') && panel.classList.contains('t-is-head-menu');
    const inner = !!panel?.querySelector('.t-menu__popup.menu-custom-inner');
    const arrow = !!panel?.querySelector('.t-popup__arrow');
    const zIndex = panel?.style.zIndex;
    const placement = ng.getComponent(submenus[0].querySelector('t-popup')).placement();
    panel?.querySelector('.t-menu__item')?.click(); ${settle}
    const selected = ng.getComponent(root).selected();
    const destroyed = !document.querySelector('.menu-custom-panel');
    const disabledHeader = submenus[1].querySelector('.t-menu__item');
    disabledHeader.click();
    disabledHeader.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true})); ${settle}
    const disabled = disabledHeader.getAttribute('aria-expanded') === 'false';
    menus[1].querySelector('.t-menu__item').click(); ${settle}
    const inline = !menus[1].querySelector('ul.t-menu__sub').hidden;
    return {opened, themed, inner, arrow, zIndex, placement, selected, destroyed, disabled, inline};
  })()`);
  assert.equal(menuPopup.opened, true); assert.equal(menuPopup.themed, true); assert.equal(menuPopup.inner, true);
  assert.equal(menuPopup.arrow, true); assert.equal(menuPopup.zIndex, '2200');
  assert.equal(menuPopup.placement, 'bottom-left'); assert.equal(menuPopup.selected, 'first');
  assert.equal(menuPopup.destroyed, true); assert.equal(menuPopup.disabled, true); assert.equal(menuPopup.inline, true);
  console.log('PASS Submenu.popupProps: theme/class merging, menu placement, selection/close, explicit disabled, inline unaffected');
  assert.deepEqual(failures, [], 'Browser exceptions or failed resources');
  console.log('All component completion interaction checks passed.');
} finally {
  socket.close();
  await fetch(`${endpoint}/json/close/${created.id}`);
}
