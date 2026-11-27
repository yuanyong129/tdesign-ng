#!/usr/bin/env node
/** 组件完善交互回归。前置：开发文档站 + scripts/headless-edge.mjs。
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
let failAvatarFallback = false;
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
  } else if (message.method === 'Fetch.requestPaused') {
    // 返回 HTTP 200 的无效图片，触发真实解码失败；不制造应用 404 或外部网络依赖。
    const { requestId, request } = message.params;
    const broken = request.url.includes('avatar-broken=') || failAvatarFallback;
    const reply = broken
      ? send('Fetch.fulfillRequest', { requestId, responseCode: 200,
        responseHeaders: [{ name: 'Content-Type', value: 'image/svg+xml' }],
        body: Buffer.from('invalid image fixture').toString('base64') })
      : send('Fetch.continueRequest', { requestId });
    reply.catch(error => failures.push(error.message));
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

  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Fetch.enable', { patterns: [
    { urlPattern: '*favicon.svg?avatar-broken=*' },
    { urlPattern: '*favicon.svg?avatar-fallback*' },
  ] });
  await page('/avatar', 'demo-avatar-image-props t-avatar');
  const avatarImage = await evaluate(`(async () => {
    const root = document.querySelector('demo-avatar-image-props');
    const demo = ng.getComponent(root);
    const wait = async predicate => { for (let i=0;i<100;i++) {
      if (predicate()) return; await new Promise(resolve=>setTimeout(resolve,50));
    } throw new Error('Avatar image did not settle'); };
    root.scrollIntoView(); ${settle}
    const avatars = root.querySelectorAll('t-avatar');
    await wait(() => demo.loads() === 1 && demo.fallbackLoads() === 1 && avatars[3].querySelector('img')?.naturalWidth > 0);
    const image = avatars[0].querySelector('img');
    const child = avatars[0].querySelector('t-image');
    const initial = {fit:getComputedStyle(image).objectFit,
      position:image.classList.contains('t-image--position-top'), alt:image.alt,
      referrer:image.getAttribute('referrerpolicy'), width:Math.round(child.getBoundingClientRect().width),
      lazy:ng.getComponent(avatars[3].querySelector('t-image')).lazy(), loads:demo.loads()};
    child.dispatchEvent(new MouseEvent('mouseenter')); ${settle}
    const overlay = !child.querySelector('.t-image__overlay-content').classList.contains('t-image__overlay-content--hidden');
    demo.image.set('favicon.svg?avatar-broken=1'); ng.applyChanges(demo); ${settle}
    await wait(() => demo.errors() === 1 && demo.hiddenErrors() === 1 && demo.fallbackLoads() === 2);
    const failed = {imageError:!!avatars[0].querySelector('.t-image__error'),
      customError:avatars[0].querySelector('.t-image__error')?.textContent.trim(),
      hiddenImage:!avatars[1].querySelector('t-image'), fallback:avatars[1].querySelector('strong')?.textContent,
      events:demo.errors(), callback:demo.imageErrors(), loads:demo.loads(),
      backup:avatars[2].querySelector('img')?.getAttribute('src')};
    demo.fallbackText.set('备2'); ng.applyChanges(demo); ${settle}
    const dynamicFallback = avatars[1].querySelector('strong')?.textContent;
    demo.retry(); ng.applyChanges(demo); ${settle}
    await wait(() => demo.loads() === 2 && demo.fallbackLoads() === 3 && avatars[1].querySelector('img')?.naturalWidth > 0);
    return {initial, overlay, failed, dynamicFallback,
      recovered:!!avatars[0].querySelector('img') && !!avatars[1].querySelector('img'),
      loads:demo.loads(), callback:demo.imageErrors()};
  })()`);
  assert.equal(avatarImage.initial.fit, 'contain'); assert.equal(avatarImage.initial.position, true);
  assert.equal(avatarImage.initial.alt, '显式头像描述'); assert.equal(avatarImage.initial.referrer, 'no-referrer');
  assert.equal(avatarImage.initial.width, 64); assert.equal(avatarImage.initial.lazy, true);
  assert.equal(avatarImage.initial.loads, 1); assert.equal(avatarImage.overlay, true);
  assert.equal(avatarImage.failed.imageError, true); assert.equal(avatarImage.failed.customError, '×');
  assert.equal(avatarImage.failed.hiddenImage, true); assert.equal(avatarImage.failed.fallback, '备');
  assert.equal(avatarImage.failed.events, 1); assert.equal(avatarImage.failed.callback, 1);
  assert.equal(avatarImage.failed.loads, 1); assert.equal(avatarImage.failed.backup, 'favicon.svg?avatar-fallback=1');
  assert.equal(avatarImage.dynamicFallback, '备2'); assert.equal(avatarImage.recovered, true);
  assert.equal(avatarImage.loads, 2); assert.equal(avatarImage.callback, 1);
  failAvatarFallback = true;
  const avatarFallbackFailure = await evaluate(`(async () => {
    const root = document.querySelector('demo-avatar-image-props');
    const demo = ng.getComponent(root);
    demo.fallbackImage.set('favicon.svg?avatar-fallback=2');
    demo.image.set('favicon.svg?avatar-broken=2'); ng.applyChanges(demo); ${settle}
    const avatar = root.querySelectorAll('t-avatar')[2];
    for (let i=0;i<100;i++) {
      if (avatar.querySelector('.t-image__error')) break;
      await new Promise(resolve => setTimeout(resolve,50));
    }
    return {failed:!!avatar.querySelector('.t-image__error'), loading:!!avatar.querySelector('.t-image__loading'),
      fallbackLoads:demo.fallbackLoads(), src:avatar.querySelector('img')?.getAttribute('src'),
      state:ng.getComponent(avatar.querySelector('t-image')).hasError()};
  })()`);
  assert.equal(avatarFallbackFailure.failed, true, JSON.stringify(avatarFallbackFailure)); assert.equal(avatarFallbackFailure.loading, false);
  assert.equal(avatarFallbackFailure.fallbackLoads, 3);
  await send('Fetch.disable');
  console.log('PASS Avatar.imageProps: real decode errors, fit/alt/size/lazy/overlay, callbacks once, fallback/retry, failed backup');

  const avatarGroup = await evaluate(`(async () => {
    const root = document.querySelector('demo-avatar-group-popup');
    const demo = ng.getComponent(root);
    root.scrollIntoView(); ${settle}
    const group = () => root.querySelector('t-avatar-group > .t-avatar-group');
    const trigger = () => group().querySelector('.t-avatar__collapse');
    const direct = () => [...group().querySelectorAll(':scope > t-avatar:not(.t-avatar--hidden) > .t-avatar')];
    const initial = {count:direct().length, text:trigger().textContent.trim(),
      customCollapse:!!trigger().querySelector('strong'),
      width:Math.round(direct()[0].getBoundingClientRect().width),
      offset:parseFloat(getComputedStyle(direct()[1]).marginLeft),
      index:parseInt(getComputedStyle(direct()[0]).zIndex), originals:ng.getComponent(root.querySelector('t-avatar-group')).avatars().length};
    trigger().click(); ${settle}
    const panel = () => document.querySelector('.avatar-custom-panel');
    const popup = {count:panel()?.querySelectorAll('.t-avatar').length,
      classes:!!panel()?.querySelector('.avatar-custom-inner'), zIndex:panel()?.style.zIndex};
    panel().querySelector('button').click(); ${settle}
    const firstClick = demo.clicks();
    demo.suffix.set('!'); demo.add(); ng.applyChanges(demo); ${settle}
    const dynamic = {count:panel().querySelectorAll('.t-avatar').length, text:panel().textContent,
      collapse:trigger().textContent.trim()};
    trigger().dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); ${settle}
    const closed = !panel();
    trigger().dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})); ${settle}
    panel().querySelector('button').click(); ${settle}
    const repeatedClick = demo.clicks();
    demo.max.set(20); ng.applyChanges(demo); ${settle}
    const expanded = {count:direct().length, noPopup:!panel(), noTrigger:!trigger(), icons:group().querySelectorAll('[tAvatarIcon]').length};
    group().querySelector('button').click(); ${settle}
    const expandedClick = demo.clicks();
    demo.size.set('small'); ng.applyChanges(demo); ${settle}
    const small = direct().every(node=>node.classList.contains('t-size-s'));
    demo.max.set(2); ng.applyChanges(demo); ${settle}
    const restoredAria = trigger().getAttribute('aria-expanded');
    trigger().dispatchEvent(new KeyboardEvent('keydown', {key:' ', bubbles:true})); ${settle}
    const restoredCount = panel()?.querySelectorAll('.t-avatar').length;
    const restoredText = panel()?.querySelector('button')?.textContent.trim();
    demo.extras.set([]); ng.applyChanges(demo); ${settle}
    const removed = panel()?.querySelectorAll('.t-avatar').length;
    const noStaleHosts = direct().length === 2 && !group().textContent.includes('D!') && !group().textContent.includes('E!');
    demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    const disabledWhileOpen = !panel() && trigger().getAttribute('aria-expanded') === 'false';
    demo.disabled.set(false); ng.applyChanges(demo); ${settle}
    demo.max.set(0); ng.applyChanges(demo); ${settle}
    const zero = {count:direct().length, noPopup:!panel(), noTrigger:!trigger()};
    demo.max.set(-1); ng.applyChanges(demo); ${settle}
    const negative = direct().length;
    demo.max.set(2); demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    trigger().click(); trigger().dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})); ${settle}
    const disabled = !panel();
    demo.disabled.set(false); ng.applyChanges(demo); ${settle}
    trigger().dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowDown', bubbles:true})); ${settle}
    const arrowOpened = !!panel();
    demo.showGroup.set(false); ng.applyChanges(demo); ${settle}
    const disposed = !panel();
    return {initial,popup,firstClick,dynamic,closed,repeatedClick,expanded,expandedClick,small,
      restoredCount,restoredText,restoredAria,removed,noStaleHosts,disabledWhileOpen,zero,negative,disabled,arrowOpened,disposed,
      hostClicks:demo.hostClicks()};
  })()`);
  assert.equal(avatarGroup.initial.count, 2); assert.equal(avatarGroup.initial.text, '+3');
  assert.equal(avatarGroup.initial.customCollapse, true);
  // vendor large 为 40px，头像组再加两侧各 1px 边框。
  assert.equal(avatarGroup.initial.width, 42); assert.equal(avatarGroup.initial.offset, -8);
  assert.equal(avatarGroup.initial.index, 49); assert.equal(avatarGroup.initial.originals, 5);
  assert.equal(avatarGroup.popup.count, 3); assert.equal(avatarGroup.popup.classes, true); assert.equal(avatarGroup.popup.zIndex, '2350');
  assert.equal(avatarGroup.firstClick, 1); assert.equal(avatarGroup.dynamic.count, 4);
  assert.ok(avatarGroup.dynamic.text.includes('F!')); assert.equal(avatarGroup.dynamic.collapse, '+4');
  assert.equal(avatarGroup.closed, true); assert.equal(avatarGroup.repeatedClick, 2);
  assert.deepEqual(avatarGroup.expanded, {count:6,noPopup:true,noTrigger:true,icons:1});
  assert.equal(avatarGroup.expandedClick, 3); assert.equal(avatarGroup.small, true);
  assert.equal(avatarGroup.restoredCount, 4); assert.equal(avatarGroup.restoredText, '3');
  assert.equal(avatarGroup.restoredAria, 'false'); assert.equal(avatarGroup.disabledWhileOpen, true);
  assert.equal(avatarGroup.removed, 1); assert.deepEqual(avatarGroup.zero, {count:3,noPopup:true,noTrigger:true});
  assert.equal(avatarGroup.noStaleHosts, true); assert.equal(avatarGroup.hostClicks, 3);
  assert.equal(avatarGroup.negative, 3); assert.equal(avatarGroup.disabled, true);
  assert.equal(avatarGroup.arrowOpened, true); assert.equal(avatarGroup.disposed, true);
  console.log('PASS AvatarGroup.popupProps: original hosts/projection/events, dynamic deletion, max/size, stacking, keyboard, disposal');
  assert.deepEqual(failures, [], 'Browser exceptions or failed resources');
  console.log('All component completion interaction checks passed.');
} finally {
  socket.close();
  await fetch(`${endpoint}/json/close/${created.id}`);
}
