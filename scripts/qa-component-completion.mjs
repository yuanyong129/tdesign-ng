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
  await send('Emulation.setDeviceMetricsOverride',{width:1365,height:900,deviceScaleFactor:1,mobile:false});
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

  await page('/input-number', 'demo-input-number-input-props input');
  const numberOptions = await evaluate(`(async () => {
    const root = document.querySelector('demo-input-number-input-props');
    const demo = ng.getComponent(root);
    const components = root.querySelectorAll('t-input-number');
    const input = components[0].querySelector('input');
    const attributes = {name:input.name,autocomplete:input.autocomplete,spellcheck:input.spellcheck,maxlength:input.maxLength};
    const values = [];
    const subscription = ng.getComponent(components[0]).change.subscribe(event=>values.push(event.value));
    input.value = '1234'; input.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const limited = {text:input.value,value:demo.value(),changes:demo.changes()};
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true})); ${settle}
    const step = {value:demo.value(),keys:demo.keys(),events:[...values]};
    input.value = 'hello'; input.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const invalidRestored = input.value;
    demo.readonly.set(true); ng.applyChanges(demo); ${settle}
    const readOnly = input.readOnly;
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true})); ${settle}
    components[0].querySelector('.t-input-number__increase').dispatchEvent(new MouseEvent('click',{bubbles:true})); ${settle}
    const readonlyValue = demo.value();
    const disabledButtons = [...components[0].querySelectorAll('button')].every(button=>button.disabled);
    const explicitDisabled = components[1].querySelector('input').disabled;
    const formDisabled = components[2].querySelector('input').disabled;
    demo.control.enable(); ng.applyChanges(demo); ${settle}
    const formInput = components[2].querySelector('input');
    formInput.value = '21'; formInput.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const formValue = demo.control.value;
    demo.control.reset(); ng.applyChanges(demo); ${settle}
    const reset = formInput.value;
    demo.readonly.set(false); ng.applyChanges(demo); ${settle}
    subscription.unsubscribe();
    return {attributes,limited,step,invalidRestored,readOnly,readonlyValue,disabledButtons,explicitDisabled,formDisabled,
      formValue,reset,unlocked:!input.readOnly};
  })()`);
  assert.deepEqual(numberOptions.attributes, {name:'amount',autocomplete:'off',spellcheck:false,maxlength:3});
  assert.deepEqual(numberOptions.limited,{text:'123',value:123,changes:1});
  assert.deepEqual(numberOptions.step,{value:124,keys:1,events:[123,124]});
  assert.equal(numberOptions.invalidRestored,'124'); assert.equal(numberOptions.readOnly,true);
  assert.equal(numberOptions.readonlyValue,124); assert.equal(numberOptions.disabledButtons,true);
  assert.equal(numberOptions.explicitDisabled,true); assert.equal(numberOptions.formDisabled,true);
  assert.equal(numberOptions.formValue,21); assert.equal(numberOptions.reset,'9'); assert.equal(numberOptions.unlocked,true);
  console.log('PASS InputNumber.inputProps: native attrs, length/numeric validation, step callbacks once, readonly, CVA/reset');

  await page('/range-input', 'demo-range-input-input-props input');
  const rangeOptions = await evaluate(`(async () => {
    const root = document.querySelector('demo-range-input-input-props');
    const demo = ng.getComponent(root);
    const ranges = root.querySelectorAll('t-range-input');
    const [left,right] = ranges[0].querySelectorAll('input');
    const attributes = {left:left.name,right:right.name,spellcheck:left.spellcheck,maxlength:right.maxLength,readonly:right.readOnly};
    left.value='中文测试'; left.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const limited = {text:left.value,value:[...demo.value()],changes:demo.changes(),callback:demo.callbackChanges()};
    right.value='illegal'; right.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const protectedValue = [...demo.value()];
    ranges[0].querySelector('.t-range-input').dispatchEvent(new MouseEvent('mouseenter'));
    left.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); ${settle}
    const keyboard = {enters:demo.enters(),keys:demo.keys()};
    const protectedClear = !ranges[0].querySelector('.t-range-input__suffix-clear');
    left.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
    left.value='测试输入'; left.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true})); ${settle}
    const composingText=left.value;
    left.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));
    left.dispatchEvent(new InputEvent('input',{bubbles:true})); ${settle}
    const composition={text:left.value,changes:demo.changes(),callback:demo.callbackChanges()};
    demo.options.set([{name:'changed-left'}, {name:'changed-right',maxlength:2}]); ng.applyChanges(demo); ${settle}
    right.value='abcdef'; right.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const dynamic = {left:left.name,right:right.name,maxlength:right.maxLength,value:[...demo.value()],readonly:right.readOnly};
    ranges[0].querySelector('.t-range-input').dispatchEvent(new MouseEvent('mouseenter')); ${settle}
    ranges[0].querySelector('.t-range-input__suffix-clear').dispatchEvent(new MouseEvent('click',{bubbles:true})); ${settle}
    const cleared = [...demo.value()];
    const shared = [...ranges[1].querySelectorAll('input')].every(input=>input.name==='shared-range' && !input.spellcheck);
    const disabled = [...ranges[2].querySelectorAll('input')].map(input=>input.disabled);
    const formDisabled = [...ranges[3].querySelectorAll('input')].every(input=>input.disabled);
    demo.control.enable(); ng.applyChanges(demo); ${settle}
    const formInput=ranges[3].querySelector('input');
    formInput.value='3'; formInput.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const formValue=[...demo.control.value];
    demo.control.reset(); ng.applyChanges(demo); ${settle}
    return {attributes,limited,protectedValue,keyboard,protectedClear,composingText,composition,dynamic,cleared,shared,disabled,formDisabled,
      formValue,reset:[...ranges[3].querySelectorAll('input')].map(input=>input.value)};
  })()`);
  assert.deepEqual(rangeOptions.attributes,{left:'range-start',right:'range-end',spellcheck:false,maxlength:3,readonly:true});
  assert.deepEqual(rangeOptions.limited,{text:'中文',value:['中文','right'],changes:1,callback:1});
  assert.deepEqual(rangeOptions.protectedValue,['中文','right']);
  assert.deepEqual(rangeOptions.keyboard,{enters:1,keys:1}); assert.equal(rangeOptions.protectedClear,true);
  assert.equal(rangeOptions.composingText,'测试输入');
  assert.deepEqual(rangeOptions.composition,{text:'测试',changes:2,callback:2});
  assert.deepEqual(rangeOptions.dynamic,{left:'changed-left',right:'changed-right',maxlength:2,value:['测试','ab'],readonly:false});
  assert.deepEqual(rangeOptions.cleared,['','']); assert.equal(rangeOptions.shared,true);
  assert.deepEqual(rangeOptions.disabled,[false,true]); assert.equal(rangeOptions.formDisabled,true);
  assert.deepEqual(rangeOptions.formValue,['3','2']); assert.deepEqual(rangeOptions.reset,['1','2']);
  console.log('PASS RangeInput.inputProps: shared/per-side attrs, weighted limit, protected side, callbacks, dynamic config, clear, CVA');

  await page('/tag-input', 'demo-tag-input-props input');
  const tagOptions = await evaluate(`(async () => {
    const root = document.querySelector('demo-tag-input-props');
    const demo = ng.getComponent(root);
    const components = root.querySelectorAll('t-tag-input');
    const component=ng.getComponent(components[0]);
    const input=components[0].querySelector('input');
    const attributes={name:input.name,autocomplete:input.autocomplete,spellcheck:input.spellcheck};
    const firstTag=components[0].querySelector('t-tag > .t-tag');
    const appearance={theme:firstTag.classList.contains('t-tag--success'),light:firstTag.classList.contains('t-tag--light'),
      round:firstTag.classList.contains('t-tag--round'), color:firstTag.style.color,
      width:firstTag.querySelector('.t-tag--text')?.style.maxWidth,title:firstTag.querySelector('[title]')?.title};
    input.value='abcdX'; input.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const limited={text:input.value,callbacks:demo.callbacks()};
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,isComposing:true})); ${settle}
    const composingUnchanged=component.mergedInputValue()==='abcd' && demo.value().length===3;
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); ${settle}
    const entered=[...demo.value()];
    input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
    input.value='中文测试'; input.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true})); ${settle}
    const duringComposition=input.value;
    input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));
    input.dispatchEvent(new InputEvent('input',{bubbles:true})); ${settle}
    const composition={text:input.value,callbacks:demo.callbacks(),compositions:demo.compositions()};
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); ${settle}
    components[0].querySelector('.t-tag__icon-close').dispatchEvent(new MouseEvent('click',{bubbles:true})); ${settle}
    const removed={value:[...demo.value()],removes:demo.removes(),closes:demo.closes()};
    demo.tags.set({...demo.tags(),closable:false}); ng.applyChanges(demo); ${settle}
    const noClose=!components[0].querySelector('.t-tag__icon-close');
    component.removeTag(0,new MouseEvent('click')); ${settle}
    const protectedTag=demo.value().length===4;
    demo.readonly.set(true); ng.applyChanges(demo); ${settle}
    const readOnly=input.readOnly;
    const before=[...demo.value()];
    input.value='test'; input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    component.handleClear(new MouseEvent('click')); ${settle}
    const unchanged=JSON.stringify(before)===JSON.stringify(demo.value());
    demo.readonly.set(false); demo.tags.set({theme:'danger',variant:'outline',closable:true}); ng.applyChanges(demo); ${settle}
    const updated=components[0].querySelector('t-tag > .t-tag');
    const dynamic={danger:updated.classList.contains('t-tag--danger'),outline:updated.classList.contains('t-tag--outline'),color:updated.style.color};
    const explicitDisabled=components[1].querySelector('input').disabled;
    const formDisabled=components[2].querySelector('input').disabled;
    demo.control.enable(); ng.applyChanges(demo); ${settle}
    const formInput=components[2].querySelector('input');
    formInput.value='new'; formInput.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    formInput.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); ${settle}
    const formValue=[...demo.control.value];
    demo.control.reset(); ng.applyChanges(demo); ${settle}
    return {attributes,appearance,limited,composingUnchanged,entered,duringComposition,composition,removed,noClose,protectedTag,
      readOnly,unchanged,dynamic,explicitDisabled,formDisabled,formValue,reset:[...demo.control.value]};
  })()`);
  assert.deepEqual(tagOptions.attributes,{name:'tags',autocomplete:'off',spellcheck:false});
  assert.deepEqual(tagOptions.appearance,{theme:true,light:true,round:true,color:'rgb(0, 82, 217)',width:'80px',title:'第一个长标签'});
  assert.deepEqual(tagOptions.limited,{text:'abcd',callbacks:1}); assert.equal(tagOptions.composingUnchanged,true);
  assert.deepEqual(tagOptions.entered,['第一个长标签','第二个','第三个','abcd']);
  assert.equal(tagOptions.duringComposition,'中文测试'); assert.deepEqual(tagOptions.composition,{text:'中文',callbacks:2,compositions:1});
  assert.deepEqual(tagOptions.removed,{value:['第二个','第三个','abcd','中文'],removes:1,closes:1});
  assert.equal(tagOptions.noClose,true); assert.equal(tagOptions.protectedTag,true);
  assert.equal(tagOptions.readOnly,true); assert.equal(tagOptions.unchanged,true);
  assert.deepEqual(tagOptions.dynamic,{danger:true,outline:true,color:''});
  assert.equal(tagOptions.explicitDisabled,true); assert.equal(tagOptions.formDisabled,true);
  assert.deepEqual(tagOptions.formValue,['表单禁用','new']); assert.deepEqual(tagOptions.reset,['表单禁用']);
  console.log('PASS TagInput input/tag props: attrs/style, IME, callbacks once, close/removal, readonly, dynamic appearance, CVA');
  await page('/slider', 'demo-slider-options input');
  const slider = await evaluate(`(async () => {
    const root=document.querySelector('demo-slider-options'), demo=ng.getComponent(root);
    const host=root.querySelector('.configured-single'), component=ng.getComponent(host);
    const input=host.querySelector('input'), thumb=host.querySelector('.t-slider__button-wrapper');
    const edit=async value=>{input.value=value; input.dispatchEvent(new Event('input',{bubbles:true})); ${settle}};
    const key=async value=>{thumb.dispatchEvent(new KeyboardEvent('keydown',{key:value,bubbles:true})); ${settle}};
    const rail=host.querySelector('.t-slider__rail');
    const initial={name:input.name,value:input.value,small:!!host.querySelector('.t-size-s')};
    await edit('9'); const edited={value:demo.value(),changes:demo.changes(),ends:demo.ends(),callbacks:demo.callbacks()};
    await key('ArrowRight'); const keyboard={value:demo.value(),text:input.value,ends:demo.ends()};
    const rect=rail.getBoundingClientRect();
    rail.dispatchEvent(new MouseEvent('click',{clientX:rect.left+rect.width*0.3,bubbles:true})); ${settle}
    const snapped=demo.value();
    const beforeClick=demo.changes(); thumb.click(); ${settle}
    const clickStable=demo.changes()===beforeClick;
    await edit(''); const empty=demo.value(); await key('End');
    const tooltip=ng.getComponent(host.querySelector('t-tooltip'));
    thumb.dispatchEvent(new MouseEvent('mouseenter')); ${settle}
    host.querySelector('t-tooltip').dispatchEvent(new MouseEvent('mouseenter')); ${settle}
    const delayed=!tooltip.innerVisible();
    await new Promise(r=>setTimeout(r,160)); ${settle}
    const panel=document.querySelector('.t-tooltip--primary');
    const popup={visible:tooltip.innerVisible(),text:panel?.textContent.trim(),arrow:!!panel?.querySelector('.t-popup__content--arrow'),
      placement:tooltip.placement(),z:panel?.style.zIndex};
    thumb.dispatchEvent(new MouseEvent('mouseleave')); thumb.dispatchEvent(new FocusEvent('focus')); ${settle}
    await new Promise(r=>setTimeout(r,160)); ${settle}
    const focusVisible=tooltip.innerVisible();
    demo.label.set('数量 {value}/{value}'); ng.applyChanges(demo); ${settle}
    const label=tooltip.content();
    demo.label.set(false); ng.applyChanges(demo); ${settle}
    const hiddenByLabel=!tooltip.innerVisible();
    demo.label.set(undefined); demo.tooltipProps.set({...demo.tooltipProps(),delay:0,duration:60}); ng.applyChanges(demo); ${settle}
    await new Promise(r=>setTimeout(r,100)); ${settle}
    const durationHidden=!tooltip.innerVisible();
    thumb.dispatchEvent(new MouseEvent('mouseleave')); thumb.dispatchEvent(new FocusEvent('blur')); ${settle}
    demo.tooltipProps.set({...demo.tooltipProps(),delay:100,duration:0}); ng.applyChanges(demo); ${settle}
    thumb.dispatchEvent(new MouseEvent('mouseenter')); ${settle}
    demo.tooltipProps.set({...demo.tooltipProps(),disabled:true}); ng.applyChanges(demo); ${settle}
    await new Promise(r=>setTimeout(r,140)); ${settle}
    const cancelled=!tooltip.innerVisible();
    demo.tooltipProps.set({...demo.tooltipProps(),disabled:false});
    demo.label.set(undefined); demo.tooltipProps.set({...demo.tooltipProps(),delay:0}); ng.applyChanges(demo); ${settle}
    demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    const disabled={input:input.disabled,tabindex:thumb.tabIndex,tooltip:tooltip.innerVisible()};
    const beforeDisabled=demo.changes(); await edit('3'); await key('Home');
    const disabledStable=beforeDisabled===demo.changes();
    demo.disabled.set(false); demo.numberProps.set({inputProps:{readonly:true}}); ng.applyChanges(demo); ${settle}
    const readonly=input.readOnly; const beforeReadonly=demo.changes(); await edit('3');
    const readonlyStable=beforeReadonly===demo.changes(); await key('Home'); const railEditable=demo.value()===1;
    thumb.dispatchEvent(new MouseEvent('mousedown',{bubbles:true})); ${settle}
    document.dispatchEvent(new MouseEvent('mousemove',{clientX:rect.left+rect.width*.5})); ${settle}
    const dragged=demo.value(); demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    const beforeStop={changes:demo.changes(),ends:demo.ends()};
    document.dispatchEvent(new MouseEvent('mousemove',{clientX:rect.right})); document.dispatchEvent(new MouseEvent('mouseup')); ${settle}
    const stopStable=beforeStop.changes===demo.changes() && beforeStop.ends===demo.ends();
    const rangeHost=root.querySelector('.configured-range'), range=ng.getComponent(rangeHost);
    const rangeInputs=rangeHost.querySelectorAll('input');
    rangeInputs[1].value='1'; rangeInputs[1].dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const crossed=[...demo.rangeValue()];
    rangeInputs[0].value='19'; rangeInputs[0].dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const crossedBack=[...demo.rangeValue()];
    const rangeText=[...rangeInputs].map(input=>input.value);
    const rangeRail=rangeHost.querySelector('.t-slider__rail'), rr=rangeRail.getBoundingClientRect();
    rangeHost.querySelector('.t-slider__button-wrapper').dispatchEvent(new MouseEvent('mousedown',{bubbles:true})); ${settle}
    document.dispatchEvent(new MouseEvent('mousemove',{clientX:rr.right})); ${settle}
    document.dispatchEvent(new MouseEvent('mousemove',{clientX:rr.left+rr.width*.9})); ${settle}
    const dragCross=[...demo.rangeValue()]; document.dispatchEvent(new MouseEvent('mouseup')); ${settle}
    const vertical=root.querySelector('.configured-vertical'), vi=vertical.querySelector('input');
    vi.value='0.7'; vi.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    const verticalState={value:vi.value,bottom:vertical.querySelector('.t-slider__button-wrapper').style.bottom,
      height:vertical.querySelector('.t-slider__rail').getBoundingClientRect().height};
    demo.numberProps.set(false); ng.applyChanges(demo); ${settle}
    const removed=!host.querySelector('input');
    demo.numberProps.set(true); ng.applyChanges(demo); ${settle}
    const restored=!!host.querySelector('input');
    return {initial,edited,keyboard,snapped,clickStable,empty,delayed,popup,focusVisible,label,hiddenByLabel,durationHidden,cancelled,disabled,
      disabledStable,readonly,readonlyStable,railEditable,dragged,stopStable,crossed,crossedBack,rangeText,dragCross,verticalState,removed,restored};
  })()`);
  assert.deepEqual(slider.initial,{name:'slider-quantity',value:'5',small:true});
  assert.deepEqual(slider.edited,{value:9,changes:1,ends:0,callbacks:1});
  assert.deepEqual(slider.keyboard,{value:11,text:'11',ends:1});
  assert.equal(slider.snapped,7); assert.equal(slider.clickStable,true); assert.equal(slider.empty,7);
  assert.equal(slider.delayed,true);
  assert.deepEqual(slider.popup,{visible:true,text:'选择份数',arrow:false,placement:'bottom',z:'2200'});
  assert.equal(slider.focusVisible,true); assert.equal(slider.label,'数量 21/21'); assert.equal(slider.hiddenByLabel,true);
  assert.equal(slider.durationHidden,true); assert.equal(slider.cancelled,true);
  assert.deepEqual(slider.disabled,{input:true,tabindex:-1,tooltip:false}); assert.equal(slider.disabledStable,true);
  assert.equal(slider.readonly,true); assert.equal(slider.readonlyStable,true); assert.equal(slider.railEditable,true);
  assert.equal(slider.dragged,11); assert.equal(slider.stopStable,true);
  assert.deepEqual(slider.crossed,[1,3]); assert.deepEqual(slider.crossedBack,[3,19]); assert.deepEqual(slider.dragCross,[19,19]);
  assert.deepEqual(slider.rangeText,['3','19']);
  assert.equal(slider.verticalState.value,'0.7'); assert.equal(slider.verticalState.bottom,'70%'); assert.ok(slider.verticalState.height>100);
  assert.equal(slider.removed,true); assert.equal(slider.restored,true);
  console.log('PASS Slider options: numeric linkage, range crossing, min-relative steps, readonly/disabled, drag cancellation, tooltip delay/focus/priority, vertical');
  await page('/input', 'demo-input-editing input');
  const inputState = await evaluate(`(async () => {
    const root=document.querySelector('demo-input-editing'), demo=ng.getComponent(root);
    const host=root.querySelector('.editing-weighted'), component=ng.getComponent(host), input=host.querySelector('input');
    const edit=async (element,value)=>{element.value=value; element.dispatchEvent(new Event('input',{bubbles:true})); ${settle}};
    await edit(input,'a中😀z');
    const weighted={value:demo.value(),text:input.value,count:host.querySelector('.t-input__limit-number').textContent.trim()};
    input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
    input.value='中文测试'; input.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true})); ${settle}
    input.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter',isComposing:true})); ${settle}
    const composing={value:demo.value(),text:input.value,enters:demo.enters()};
    const beforeEnd=demo.changes();
    input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));
    input.dispatchEvent(new InputEvent('input',{bubbles:true})); ${settle}
    const composition={value:demo.value(),text:input.value,events:demo.compositions(),changes:demo.changes()-beforeEnd};
    input.dispatchEvent(new KeyboardEvent('keypress',{bubbles:true,key:'a'}));
    input.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter'}));
    const data=new DataTransfer(); data.setData('text/plain','粘贴文本');
    input.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,clipboardData:data}));
    input.dispatchEvent(new WheelEvent('wheel',{bubbles:true,deltaY:1}));
    host.dispatchEvent(new MouseEvent('mouseenter'));
    host.dispatchEvent(new MouseEvent('mouseleave')); ${settle}
    const events={keys:demo.keys(),enters:demo.enters(),paste:demo.pasted(),wheels:demo.wheels(),enter:demo.mouseEnters(),leave:demo.mouseLeaves()};
    demo.overflow.set(true); ng.applyChanges(demo); ${settle}
    await edit(input,'中文测试'); await edit(input,'中文测试多');
    const exceeded={value:demo.value(),error:input.getAttribute('aria-invalid'),errors:[...demo.errors()]};
    await edit(input,'a'); const recovery=[...demo.errors()];
    demo.value.set('程序写入超限'); ng.applyChanges(demo); ${settle}
    const programError=demo.errors().at(-1);
    demo.value.set('a'); demo.acceptChanges.set(false); ng.applyChanges(demo); ${settle}
    await edit(input,'rejected'); const controlled={value:demo.value(),text:input.value};
    demo.acceptChanges.set(true); demo.overflow.set(false); ng.applyChanges(demo); ${settle}
    demo.readonly.set(true); ng.applyChanges(demo); ${settle}
    const readOnly={native:input.readOnly,clear:!!host.querySelector('.t-input__suffix-clear')};
    const beforeReadOnly=demo.changes(); await edit(input,'修改'); component.handleClear(new MouseEvent('click')); ${settle}
    readOnly.stable=demo.changes()===beforeReadOnly;
    demo.readonly.set(false); demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    const beforeDisabled={changes:demo.changes(),keys:demo.keys()}; await edit(input,'禁用');
    input.dispatchEvent(new KeyboardEvent('keypress',{bubbles:true,key:'x'})); ${settle}
    const disabled={native:input.disabled,stable:demo.changes()===beforeDisabled.changes && demo.keys()===beforeDisabled.keys};
    demo.disabled.set(false); demo.inputClass.set(['changed-class','second-class']); ng.applyChanges(demo); ${settle}
    const classChanged=!!host.querySelector('.t-input.changed-class.second-class') && !host.querySelector('.editing-inner');
    demo.inputClass.set({'conditional-class':true,'changed-class':false}); ng.applyChanges(demo); ${settle}
    const classObject=!!host.querySelector('.conditional-class') && !host.querySelector('.second-class');
    const defaultHost=root.querySelector('.editing-default'), defaultInput=defaultHost.querySelector('input');
    const defaultInitial=defaultInput.value; await edit(defaultInput,'用户编辑');
    demo.initial.set('新的默认值'); ng.applyChanges(demo); ${settle}
    const defaultEdited=defaultInput.value; defaultHost.querySelector('.t-input__suffix-clear').dispatchEvent(new MouseEvent('click',{bubbles:true})); ${settle}
    const cleared={text:defaultInput.value,focused:document.activeElement===defaultInput};
    const formHost=root.querySelector('.editing-form'), formInput=formHost.querySelector('input');
    const formInitial=formInput.value; await edit(formInput,'表单编辑'); formInput.dispatchEvent(new FocusEvent('blur')); ${settle}
    const formEdited={value:demo.control.value,touched:demo.control.touched};
    demo.control.disable(); ng.applyChanges(demo); ${settle}
    const formDisabled=formInput.disabled; await edit(formInput,'不应更新');
    const formStable=demo.control.value==='表单编辑';
    demo.control.enable(); demo.control.reset(); ng.applyChanges(demo); ${settle}
    const formReset={text:formInput.value,value:demo.control.value,touched:demo.control.touched};
    const formatted=root.querySelector('.editing-formatted input'); await edit(formatted,'ab😀cd');
    const formatText=formatted.value;
    const auto=root.querySelector('.editing-auto'), autoInput=auto.querySelector('input');
    const shortWidth=auto.querySelector('.t-input').getBoundingClientRect().width;
    await edit(autoInput,'自动宽度内容明显变长');
    const longWidth=auto.querySelector('.t-input').getBoundingClientRect().width;
    autoInput.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
    autoInput.value='组合输入中内容也会撑宽输入框'; autoInput.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true})); ${settle}
    const draftWidth=auto.querySelector('.t-input').getBoundingClientRect().width;
    autoInput.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true})); ${settle}
    demo.autoValue.set(''); demo.autoPlaceholder.set('比原来更长的占位提示'); ng.applyChanges(demo); ${settle}
    const placeholderWidth=auto.querySelector('.t-input').getBoundingClientRect().width;
    demo.autoSize.set('large'); ng.applyChanges(demo); ${settle}
    const largeWidth=auto.querySelector('.t-input').getBoundingClientRect().width;
    demo.autoWidth.set(false); ng.applyChanges(demo); ${settle}
    const autoOff={pre:!!auto.querySelector('.t-input__input-pre'),width:autoInput.style.width};
    const groupRoot=document.querySelector('demo-input-group'), groupDemo=ng.getComponent(groupRoot), group=groupRoot.querySelector('t-input-group');
    const groupInputs=group.querySelectorAll('input'); await edit(groupInputs[0],'李');
    const borders=[...group.querySelectorAll('.t-input')].map(el=>({left:getComputedStyle(el).borderTopLeftRadius,right:getComputedStyle(el).borderTopRightRadius}));
    groupDemo.separate.set(true); ng.applyChanges(groupDemo); ${settle}
    const groupGap=parseFloat(getComputedStyle(group.querySelectorAll('t-input')[1]).marginLeft);
    const separateBorders=[...group.querySelectorAll('.t-input')].every(el=>getComputedStyle(el).borderTopLeftRadius!=='0px' && getComputedStyle(el).borderTopRightRadius!=='0px');
    return {weighted,composing,composition,events,exceeded,recovery,programError,controlled,readOnly,disabled,classChanged,classObject,
      defaultInitial,defaultEdited,cleared,formInitial,formEdited,formDisabled,formStable,formReset,formatText,
      shortWidth,longWidth,draftWidth,placeholderWidth,largeWidth,autoOff,borders,groupGap,separateBorders,groupValues:[...groupInputs].map(input=>input.value)};
  })()`);
  assert.deepEqual(inputState.weighted,{value:'a中',text:'a中',count:'3/6'});
  assert.deepEqual(inputState.composing,{value:'a中',text:'中文测试',enters:0});
  assert.deepEqual(inputState.composition,{value:'中文测',text:'中文测',events:['a中','中文测'],changes:1});
  assert.deepEqual(inputState.events,{keys:1,enters:1,paste:'粘贴文本',wheels:1,enter:1,leave:1});
  assert.deepEqual(inputState.exceeded,{value:'中文测试多',error:'true',errors:['exceed-maximum']});
  assert.deepEqual(inputState.recovery,['exceed-maximum','valid']); assert.equal(inputState.programError,'exceed-maximum');
  assert.deepEqual(inputState.controlled,{value:'a',text:'a'});
  assert.deepEqual(inputState.readOnly,{native:true,clear:false,stable:true}); assert.deepEqual(inputState.disabled,{native:true,stable:true});
  assert.equal(inputState.classChanged,true); assert.equal(inputState.classObject,true);
  assert.equal(inputState.defaultInitial,'初始值'); assert.equal(inputState.defaultEdited,'用户编辑'); assert.deepEqual(inputState.cleared,{text:'',focused:true});
  assert.equal(inputState.formInitial,'表单初始值'); assert.deepEqual(inputState.formEdited,{value:'表单编辑',touched:true});
  assert.equal(inputState.formDisabled,true); assert.equal(inputState.formStable,true);
  assert.deepEqual(inputState.formReset,{text:'表单初始值',value:'表单初始值',touched:false}); assert.equal(inputState.formatText,'AB😀C');
  assert.ok(inputState.longWidth>inputState.shortWidth+40); assert.ok(inputState.draftWidth>inputState.longWidth);
  assert.ok(inputState.placeholderWidth>inputState.shortWidth); assert.ok(inputState.largeWidth>=inputState.placeholderWidth);
  assert.deepEqual(inputState.autoOff,{pre:false,width:''});
  assert.equal(inputState.borders[0].right,'0px'); assert.equal(inputState.borders[1].left,'0px');
  assert.ok(inputState.groupGap>0); assert.equal(inputState.separateBorders,true); assert.deepEqual(inputState.groupValues,['李','三']);
  console.log('PASS Input/InputGroup: controlled/default/CVA, weighted limits and validation, IME once, events, format, auto width, classes, group borders/gap');
  const inputPointer = await evaluate(`(async () => {
    const root=document.querySelector('demo-input-editing'), demo=ng.getComponent(root), input=root.querySelector('.editing-weighted .t-input');
    input.scrollIntoView({block:'center',behavior:'instant'}); ${settle}
    demo.mouseEnters.set(0); demo.mouseLeaves.set(0);
    const rect=input.getBoundingClientRect(); return {x:rect.left+rect.width/2,y:rect.top+rect.height/2};
  })()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5});
  await evaluate(`(async()=>{${settle}})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...inputPointer});
  await evaluate(`(async()=>{${settle}})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5});
  await evaluate(`(async()=>{${settle}})()`);
  const pointerEvents = await evaluate(`(() => {const demo=ng.getComponent(document.querySelector('demo-input-editing')); return {enter:demo.mouseEnters(),leave:demo.mouseLeaves()};})()`);
  assert.deepEqual(pointerEvents,{enter:1,leave:1});
  await page('/auto-complete', 'demo-auto-complete-basic input');
  const autoCompleteInput = await evaluate(`(async () => {
    const root=document.querySelector('demo-auto-complete-basic'), host=root.querySelector('t-auto-complete'), component=ng.getComponent(host);
    const input=host.querySelector('input'), changes=[], compositions=[], enters=[];
    component.change.subscribe(event=>changes.push(event.value));
    component.compositionstart.subscribe(event=>compositions.push(event.value));
    component.compositionend.subscribe(event=>compositions.push(event.value));
    component.enter.subscribe(event=>enters.push(event.value));
    input.value='v'; input.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    input.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'ArrowDown'})); ${settle}
    const active=component.active();
    input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
    input.value='vue'; input.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true})); ${settle}
    input.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter',isComposing:true})); ${settle}
    const composing={value:ng.getComponent(root).value,changes:changes.length,enters:enters.length};
    input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));
    input.dispatchEvent(new InputEvent('input',{bubbles:true})); ${settle}
    const committed={value:ng.getComponent(root).value,changes:[...changes],compositions:[...compositions]};
    input.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'ArrowDown'})); ${settle}
    const chosen=component.active(); input.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter'})); ${settle}
    return {active,composing,committed,chosen,selected:ng.getComponent(root).value,enters:enters.length};
  })()`);
  assert.ok(autoCompleteInput.active); assert.deepEqual(autoCompleteInput.composing,{value:'v',changes:1,enters:0});
  assert.deepEqual(autoCompleteInput.committed,{value:'vue',changes:['v','vue'],compositions:['v','vue']});
  assert.equal(autoCompleteInput.selected,autoCompleteInput.chosen); assert.equal(autoCompleteInput.enters,1);
  console.log('PASS AutoComplete consuming Input: composition once, Enter ignored during IME, arrow selection and Enter once');
  await page('/textarea', 'demo-textarea-stateful textarea');
  const textareaState = await evaluate(`(async () => {
    const root=document.querySelector('demo-textarea-stateful'), demo=ng.getComponent(root);
    const [defaultInput,input,formInput]=root.querySelectorAll('textarea');
    const edit=async(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));${settle}};
    const initial=defaultInput.value; await edit(defaultInput,'用户编辑');
    demo.initial.set('不覆盖编辑'); ng.applyChanges(demo); ${settle}
    const defaultEdited=defaultInput.value;
    const minHeight=defaultInput.getBoundingClientRect().height;
    demo.rows.set({minRows:4,maxRows:5}); ng.applyChanges(demo); ${settle}
    const larger=defaultInput.getBoundingClientRect().height>minHeight+20;
    demo.rows.set(false); ng.applyChanges(demo); ${settle}
    const autoOff=defaultInput.style.height==='';
    await edit(input,'中😀文x'); const unicode=input.value;
    const before=demo.changes(); input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
    input.value='组合测试'; input.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true})); ${settle}
    const draft=input.value;
    input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true})); input.dispatchEvent(new InputEvent('input',{bubbles:true})); ${settle}
    const composition={text:input.value,count:demo.changes()-before};
    demo.acceptChanges.set(false); ng.applyChanges(demo); ${settle}
    await edit(input,'拒绝'); const rejected=input.value;
    demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    const keys=demo.keys(),changes=demo.changes(); await edit(input,'禁用');
    input.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'x'})); ${settle}
    const disabled=input.disabled && demo.keys()===keys && demo.changes()===changes;
    demo.disabled.set(false); demo.readonly.set(true); ng.applyChanges(demo); ${settle}
    await edit(input,'只读'); const readonly=input.readOnly && demo.changes()===changes;
    formInput.focus(); await edit(formInput,'延迟表单');
    const pending={model:demo.control.value,text:formInput.value,touched:demo.control.touched};
    formInput.blur(); ${settle}
    const blurred={model:demo.control.value,touched:demo.control.touched};
    demo.control.disable(); ng.applyChanges(demo); ${settle} const formDisabled=formInput.disabled;
    demo.control.enable(); demo.control.reset(); ng.applyChanges(demo); ${settle}
    return {initial,defaultEdited,larger,autoOff,unicode,draft,composition,rejected,disabled,readonly,pending,blurred,formDisabled,
      reset:{text:formInput.value,touched:demo.control.touched}};
  })()`);
  assert.equal(textareaState.initial,'默认内容'); assert.equal(textareaState.defaultEdited,'用户编辑');
  assert.equal(textareaState.larger,true); assert.equal(textareaState.autoOff,true); assert.equal(textareaState.unicode,'中😀文');
  assert.equal(textareaState.draft,'组合测试'); assert.deepEqual(textareaState.composition,{text:'组合测',count:1});
  assert.equal(textareaState.rejected,'组合测'); assert.equal(textareaState.disabled,true); assert.equal(textareaState.readonly,true);
  assert.deepEqual(textareaState.pending,{model:'表单默认',text:'延迟表单',touched:false});
  assert.deepEqual(textareaState.blurred,{model:'延迟表单',touched:true}); assert.equal(textareaState.formDisabled,true);
  assert.deepEqual(textareaState.reset,{text:'表单默认',touched:false});
  console.log('PASS Textarea state: default once, controlled rejection, Unicode/IME, dynamic autosize, readonly/disabled, updateOn blur/reset');

  await page('/checkbox', 'demo-checkbox-stateful input');
  const checkboxState = await evaluate(`(async () => {
    const root=document.querySelector('demo-checkbox-stateful'), demo=ng.getComponent(root);
    const click=async el=>{el.click();${settle}};
    const first=root.querySelector('.stateful-default input'); const initial=first.checked;
    await click(first); demo.initial.set(false); ng.applyChanges(demo); ${settle}
    demo.initial.set(true); ng.applyChanges(demo); ${settle} const defaultEdited=first.checked;
    const controlled=root.querySelector('.stateful-controlled input'); await click(controlled);
    const rejected={checked:controlled.checked,events:demo.proposals()};
    const group=root.querySelector('.stateful-group'); let items=group.querySelectorAll('input');
    const initialGroup=[...items].map(el=>el.checked); const names=[...items].map(el=>el.name);
    await click(items[0]); const limited={value:[...demo.value()],checks:[...items].map(el=>el.checked),lastDisabled:items[3].disabled,events:demo.groupChanges()};
    await click(items[2]); demo.dynamicValue.set('x'); ng.applyChanges(demo); ${settle}
    await click(items[0]); const renamed=[...demo.value()];
    demo.max.set(4); demo.extra.set(true); ng.applyChanges(demo); ${settle}
    items=group.querySelectorAll('input'); await click(items[0]); const all=[...demo.value()];
    await click(items[0]); const preserved=[...demo.value()];
    demo.readonly.set(true); ng.applyChanges(demo); ${settle}
    const before=demo.groupChanges(); await click(items[0]); const readonly=demo.groupChanges()===before;
    demo.readonly.set(false); demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    const disabled=[...items].every(el=>el.disabled); await click(items[0]); const disabledStable=demo.groupChanges()===before;
    const rejectedGroup=root.querySelector('.stateful-rejected-group');
    await click(rejectedGroup.querySelectorAll('input')[1]); const rejectedChecks=[...rejectedGroup.querySelectorAll('input')].map(el=>el.checked);
    const single=root.querySelector('.stateful-form-single input'); single.focus(); await click(single);
    const singlePending={model:demo.single.value,checked:single.checked,touched:demo.single.touched}; single.blur(); ${settle}
    const singleBlurred={model:demo.single.value,touched:demo.single.touched};
    const formGroup=root.querySelector('.stateful-form-group'), formInputs=formGroup.querySelectorAll('input');
    formInputs[1].focus(); await click(formInputs[1]);
    const groupPending={model:[...demo.group.value],checks:[...formInputs].map(el=>el.checked),touched:demo.group.touched};
    formInputs[2].focus(); ${settle} const internalFocusUntouched=!demo.group.touched;
    formInputs[2].blur(); ${settle} const groupBlurred={model:[...demo.group.value],touched:demo.group.touched};
    demo.single.disable(); demo.group.disable(); ng.applyChanges(demo); ${settle}
    const formDisabled=single.disabled && [...formInputs].every(el=>el.disabled);
    demo.single.enable(); demo.group.enable(); demo.single.reset(); demo.group.reset(); ng.applyChanges(demo); ${settle}
    return {initial,defaultEdited,rejected,initialGroup,names,limited,renamed,all,preserved,readonly,disabled,disabledStable,rejectedChecks,
      singlePending,singleBlurred,groupPending,internalFocusUntouched,groupBlurred,formDisabled,reset:{single:single.checked,group:[...formInputs].map(el=>el.checked),touched:demo.group.touched}};
  })()`);
  assert.equal(checkboxState.initial,true); assert.equal(checkboxState.defaultEdited,false);
  assert.deepEqual(checkboxState.rejected,{checked:false,events:1}); assert.deepEqual(checkboxState.initialGroup,[false,true,false,false]);
  assert.ok(checkboxState.names.every(name=>name==='stateful-checkbox'));
  assert.deepEqual(checkboxState.limited,{value:['locked','a'],checks:[false,true,true,false],lastDisabled:true,events:1});
  assert.deepEqual(checkboxState.renamed,['locked','x']); assert.deepEqual(checkboxState.all,['locked','x','b','c']); assert.deepEqual(checkboxState.preserved,['locked']);
  assert.equal(checkboxState.readonly,true); assert.equal(checkboxState.disabled,true); assert.equal(checkboxState.disabledStable,true);
  assert.deepEqual(checkboxState.rejectedChecks,[true,false]); assert.deepEqual(checkboxState.singlePending,{model:true,checked:false,touched:false});
  assert.deepEqual(checkboxState.singleBlurred,{model:false,touched:true});
  assert.deepEqual(checkboxState.groupPending,{model:['a'],checks:[true,true,false],touched:false});
  assert.equal(checkboxState.internalFocusUntouched,true); assert.deepEqual(checkboxState.groupBlurred,{model:['a','b'],touched:true});
  assert.equal(checkboxState.formDisabled,true); assert.deepEqual(checkboxState.reset,{single:true,group:[true,false,false],touched:false});
  console.log('PASS Checkbox state: defaults, controlled rejection, check-all/max/protected items, dynamic values, names, CVA blur/reset');

  await page('/radio', 'demo-radio-stateful input');
  const radioState = await evaluate(`(async () => {
    const root=document.querySelector('demo-radio-stateful'), demo=ng.getComponent(root);
    const click=async el=>{el.click();${settle}};
    const key=async(el,key)=>{el.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key}));${settle}};
    const first=root.querySelector('.stateful-default input'); const initial=first.checked;
    await click(first); demo.initial.set(false); ng.applyChanges(demo); ${settle} demo.initial.set(true); ng.applyChanges(demo); ${settle}
    const defaultEdited=first.checked;
    const controlled=root.querySelector('.stateful-controlled input'); await click(controlled); const rejected={checked:controlled.checked,events:demo.proposals()};
    const group=root.querySelector('.stateful-group'); let items=group.querySelectorAll('input');
    const tab=[...items].map(el=>el.tabIndex); await click(items[1]); const unchecked=[...items].every(el=>!el.checked);
    demo.allowUncheck.set(false); ng.applyChanges(demo); ${settle} await click(items[1]);
    await key(items[1],'ArrowRight'); const next={value:demo.value(),focused:document.activeElement===items[2],checks:[...items].map(el=>el.checked)};
    const focusOutline=getComputedStyle(items[2].closest('label')).outlineWidth;
    await key(items[2],'ArrowRight'); const wrapped=demo.value();
    demo.extra.set(true); ng.applyChanges(demo); ${settle} items=group.querySelectorAll('input'); await key(items[1],'End'); const end=demo.value();
    await key(items[3],'Home'); const home=demo.value();
    demo.readonly.set(true); ng.applyChanges(demo); ${settle} const before=demo.groupChanges(); await click(items[2]); await key(items[1],'ArrowRight');
    const readonly=demo.groupChanges()===before;
    demo.readonly.set(false); demo.disabled.set(true); ng.applyChanges(demo); ${settle} const disabled=[...items].every(el=>el.disabled && el.tabIndex===-1);
    const rejectedGroup=root.querySelector('.stateful-rejected-group'); await click(rejectedGroup.querySelectorAll('input')[1]);
    const rejectedChecks=[...rejectedGroup.querySelectorAll('input')].map(el=>el.checked);
    const single=root.querySelector('.stateful-form-single input'); single.focus(); await click(single);
    const singlePending={model:demo.single.value,checked:single.checked,touched:demo.single.touched}; single.blur(); ${settle}
    const singleBlurred={model:demo.single.value,touched:demo.single.touched};
    const formGroup=root.querySelector('.stateful-form-group'), formInputs=formGroup.querySelectorAll('input');
    formInputs[1].focus(); await click(formInputs[1]); const groupPending={model:demo.group.value,checked:formInputs[1].checked,touched:demo.group.touched};
    formInputs[1].blur(); ${settle} const groupBlurred={model:demo.group.value,touched:demo.group.touched};
    demo.single.disable(); demo.group.disable(); ng.applyChanges(demo); ${settle} const formDisabled=single.disabled && [...formInputs].every(el=>el.disabled);
    demo.single.enable(); demo.group.enable(); demo.single.reset(); demo.group.reset(); ng.applyChanges(demo); ${settle}
    return {initial,defaultEdited,rejected,tab,unchecked,next,focusOutline,wrapped,end,home,readonly,disabled,rejectedChecks,
      singlePending,singleBlurred,groupPending,groupBlurred,formDisabled,reset:{single:single.checked,group:[...formInputs].map(el=>el.checked),touched:demo.group.touched}};
  })()`);
  assert.equal(radioState.initial,true); assert.equal(radioState.defaultEdited,false); assert.deepEqual(radioState.rejected,{checked:false,events:1});
  assert.deepEqual(radioState.tab,[-1,0,-1]); assert.equal(radioState.unchecked,true);
  assert.deepEqual(radioState.next,{value:'c',focused:true,checks:[false,false,true]});
  assert.equal(radioState.focusOutline,'2px');
  assert.equal(radioState.wrapped,'b'); assert.equal(radioState.end,'d'); assert.equal(radioState.home,'b');
  assert.equal(radioState.readonly,true); assert.equal(radioState.disabled,true); assert.deepEqual(radioState.rejectedChecks,[true,false]);
  assert.deepEqual(radioState.singlePending,{model:true,checked:false,touched:false}); assert.deepEqual(radioState.singleBlurred,{model:false,touched:true});
  assert.deepEqual(radioState.groupPending,{model:'b',checked:true,touched:false}); assert.deepEqual(radioState.groupBlurred,{model:'c',touched:true});
  assert.equal(radioState.formDisabled,true); assert.deepEqual(radioState.reset,{single:true,group:[true,false],touched:false});
  console.log('PASS Radio state: defaults, rejection, allowUncheck, roving focus/arrows/Home/End, disabled/readonly, CVA blur/reset');

  await page('/switch', 'demo-switch-guard .guarded-switch');
  const switchState = await evaluate(`(async () => {
    const root=document.querySelector('demo-switch-guard'), demo=ng.getComponent(root);
    let host=root.querySelector('.guarded-switch');
    const click=async()=>{host.click();${settle}};
    await click(); await click(); const pending={calls:demo.calls(),changes:demo.changes(),busy:host.getAttribute('aria-busy'),spinner:!!host.querySelector('.t-loading')};
    const spinnerFits=parseFloat(getComputedStyle(host.querySelector('.t-icon-loading')).width)<=parseFloat(getComputedStyle(host).height);
    demo.finish(true); ${settle} const accepted={value:demo.value(),changes:demo.changes(),busy:host.getAttribute('aria-busy')};
    await click(); demo.finish(false); ${settle} const denied=demo.value()===true && demo.changes()===1;
    await click(); demo.fail(); ${settle} const rejected=demo.value()===true && demo.changes()===1 && !ng.getComponent(host).pending();
    await click(); demo.disabled.set(true); ng.applyChanges(demo); ${settle} demo.finish(true); ${settle} const disabledStable=demo.changes()===1;
    demo.disabled.set(false); ng.applyChanges(demo); ${settle}
    await click(); demo.loading.set(true); ng.applyChanges(demo); ${settle} demo.finish(true); ${settle} const loadingStable=demo.changes()===1;
    demo.loading.set(false); ng.applyChanges(demo); ${settle}
    await click(); const staleResolve=demo.resolve;
    demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    demo.disabled.set(false); ng.applyChanges(demo); ${settle}
    await click(); staleResolve(true); ${settle}
    const oldRequestStable=ng.getComponent(host).pending() && demo.changes()===1;
    demo.finish(false); ${settle}
    await click(); demo.value.set(false); ng.applyChanges(demo); ${settle} demo.finish(true); ${settle} const writtenStable=demo.value()===false && demo.changes()===1;
    await click(); demo.customValue.set(['on','off']); ng.applyChanges(demo); ${settle} demo.finish(true); ${settle} const configStable=demo.changes()===1;
    await click(); demo.mounted.set(false); ng.applyChanges(demo); ${settle} demo.finish(true); ${settle} const destroyedStable=demo.changes()===1;
    demo.mounted.set(true); demo.customValue.set([true,false]); demo.mode.set('deny'); ng.applyChanges(demo); ${settle} host=root.querySelector('.guarded-switch');
    await click(); const syncDenied=demo.changes()===1;
    demo.mode.set('throw'); await click(); const syncFailed=demo.changes()===1;
    demo.mode.set('allow'); demo.acceptChanges.set(false); await click(); const controlled=host.getAttribute('aria-checked')==='false' && demo.value()===false;
    demo.acceptChanges.set(true); host.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true})); ${settle} const keyboard=demo.value()===true;
    const defaultHost=root.querySelector('.default-switch'); const defaultInitial=defaultHost.getAttribute('aria-checked'); defaultHost.click(); ${settle}
    demo.initial.set('off'); ng.applyChanges(demo); ${settle} demo.initial.set('on'); ng.applyChanges(demo); ${settle}
    const defaultEdited=defaultHost.getAttribute('aria-checked');
    const form=root.querySelector('.form-switch'); form.focus(); form.click(); ${settle}
    const formPending={model:demo.control.value,checked:form.getAttribute('aria-checked'),touched:demo.control.touched}; form.blur(); ${settle}
    const formBlurred={model:demo.control.value,touched:demo.control.touched};
    demo.control.disable(); ng.applyChanges(demo); ${settle} const formDisabled=form.tabIndex===-1 && form.getAttribute('aria-disabled')==='true';
    demo.control.enable(); demo.control.reset(); ng.applyChanges(demo); ${settle}
    return {pending,spinnerFits,accepted,denied,rejected,disabledStable,loadingStable,oldRequestStable,writtenStable,configStable,destroyedStable,syncDenied,syncFailed,controlled,keyboard,
      defaultInitial,defaultEdited,formPending,formBlurred,formDisabled,reset:{checked:form.getAttribute('aria-checked'),model:demo.control.value,touched:demo.control.touched}};
  })()`);
  assert.deepEqual(switchState.pending,{calls:1,changes:0,busy:'true',spinner:true}); assert.deepEqual(switchState.accepted,{value:true,changes:1,busy:null});
  assert.equal(switchState.spinnerFits,true);
  for (const key of ['denied','rejected','disabledStable','loadingStable','oldRequestStable','writtenStable','configStable','destroyedStable','syncDenied','syncFailed','controlled','keyboard']) assert.equal(switchState[key],true,key);
  assert.equal(switchState.defaultInitial,'true'); assert.equal(switchState.defaultEdited,'false');
  assert.deepEqual(switchState.formPending,{model:'off',checked:'true',touched:false}); assert.deepEqual(switchState.formBlurred,{model:'on',touched:true});
  assert.equal(switchState.formDisabled,true); assert.deepEqual(switchState.reset,{checked:'false',model:'off',touched:false});
  console.log('PASS Switch state: default/custom/CVA, sync and async guards, one pending request, rejection, stale result cancellation, destroy, keyboard');
  await page('/form', 'demo-form-lifecycle .ngmodel-form input');
  const formLifecycle = await evaluate(`(async () => {
    const root=document.querySelector('demo-form-lifecycle'), demo=ng.getComponent(root);
    let host=root.querySelector('t-form'), form=ng.getComponent(host), native=host.querySelector('form');
    const item=ng.getComponent(host.querySelector('t-form-item'));
    const id={native:native.id,host:host.id,count:document.querySelectorAll('#lifecycle-native-form').length};
    demo.formId.set('changed-native-form'); ng.applyChanges(demo); ${settle}
    const dynamicId=native.id;
    const initialDisabled=demo.locked.disabled && !demo.name.disabled;
    demo.disabled.set(true); ng.applyChanges(demo); ${settle}
    const allDisabled=[demo.name,demo.count,demo.enabled,demo.locked,demo.tags].every(control=>control.disabled);
    demo.disabled.set(false); ng.applyChanges(demo); ${settle}
    const released={name:demo.name.disabled,locked:demo.locked.disabled};
    demo.mirror.set(true); demo.disabled.set(true); demo.mirrorDisabled.set(true); ng.applyChanges(demo); ${settle}
    demo.disabled.set(false); ng.applyChanges(demo); ${settle} const sharedLocked=demo.name.disabled;
    demo.mirror.set(false); ng.applyChanges(demo); ${settle} const sharedReleased=demo.name.enabled;
    demo.name.setValue(''); ${settle}
    const required=await form.validateAll(); ${settle}
    const errorShown=host.querySelector('t-form-item .t-input__extra')?.textContent.trim();
    demo.errorMessage.set('统一错误'); ng.applyChanges(demo); ${settle}
    const fieldResult=await form.validateField('name'); ${settle}
    const unified={returned:fieldResult.name.message,shown:host.querySelector('t-form-item .t-input__extra')?.textContent.trim()};
    demo.ownRules.set([]); ng.applyChanges(demo); ${settle}
    const ownEmpty=await form.validateField('name');
    demo.ownRules.set(undefined); demo.errorMessage.set(undefined); ng.applyChanges(demo); ${settle}
    demo.rules.set({name:[{pattern:/^[a-z]+$/g,message:'仅限英文',trigger:'change'}]}); demo.name.setValue('alpha'); ng.applyChanges(demo); ${settle}
    const regex1=await form.validateField('name'),regex2=await form.validateField('name');
    demo.rules.set({name:[{whitespace:false,message:'不可全为空白'}]}); demo.name.setValue('   '); ng.applyChanges(demo); ${settle}
    const whitespace=await form.validateField('name');
    demo.rules.set({name:[{validator:value=>({result:value==='ok',message:'自定义空值校验'})}]}); demo.name.setValue(''); ng.applyChanges(demo); ${settle}
    const customEmpty=await form.validateField('name');
    demo.rules.set({name:[{pattern:'[',message:'正则配置错误'}]}); demo.name.setValue('test'); ng.applyChanges(demo); ${settle}
    const invalidPattern=await form.validateField('name');
    demo.rules.set({name:[{validator:()=>({result:false,message:'警告提示',type:'warning'})}]}); demo.name.setValue('warning'); ng.applyChanges(demo); ${settle}
    const warningBlocked=await form.submitForm(); demo.allowWarnings.set(true); ng.applyChanges(demo); ${settle}
    const warningAllowed=await form.submitForm();
    demo.rules.set({}); demo.allowWarnings.set(false); ng.applyChanges(demo); ${settle}
    demo.name.setValue('编辑名称'); demo.count.setValue(9); demo.enabled.setValue(false); demo.tags.setValue(['b','c']);
    demo.name.markAsDirty(); demo.name.markAsTouched(); ${settle}
    native.dispatchEvent(new Event('reset',{bubbles:true,cancelable:true})); ${settle}
    const empty={fields:form.getFieldsValue(),resets:demo.resets(),pristine:demo.name.pristine,touched:demo.name.touched,locked:demo.locked.disabled};
    demo.resetType.set('initial'); ng.applyChanges(demo); ${settle} form.resetForm(); ${settle}
    const initial=JSON.parse(JSON.stringify(form.getFieldsValue()));
    demo.tags.value.push('mutated'); form.resetForm(); ${settle} const cloned=[...demo.tags.value];
    const modelHost=root.querySelector('.ngmodel-form'), modelForm=ng.getComponent(modelHost), modelInput=modelHost.querySelector('input');
    const modelInitial=demo.model; modelInput.value='模板编辑'; modelInput.dispatchEvent(new Event('input',{bubbles:true})); ${settle}
    modelForm.resetForm(); ${settle} const modelReset={model:demo.model,text:modelInput.value};
    demo.extra.set(true); ng.applyChanges(demo); ${settle}
    demo.extraControl.setValue('改动态值'); ${settle} form.resetForm(); ${settle}
    const dynamicReset=form.getFieldsValue().extra;
    demo.extra.set(false); ng.applyChanges(demo); ${settle} const removed=!('extra' in form.getFieldsValue());
    demo.rules.set({name:[{validator:()=>false,message:'离焦检查',trigger:'blur'}]}); ng.applyChanges(demo); ${settle}
    const nameInput=host.querySelector('input'), helper=host.querySelector('t-form-item button');
    nameInput.focus(); helper.focus(); ${settle} const internalFocusClean=!host.querySelector('t-form-item .t-input__extra');
    helper.blur(); ${settle} const externalFocusError=host.querySelector('t-form-item .t-input__extra')?.textContent.trim();
    demo.useAsyncRules(); ng.applyChanges(demo); ${settle}
    const old=item.validate('submit'); demo.name.setValue('新值'); ${settle} const latest=item.validate('submit');
    const first=demo.requests.shift(),second=demo.requests.shift(); second.resolve(true); await latest; ${settle}
    first.resolve(false); const oldResult=await old; ${settle}
    const staleHidden=!host.querySelector('t-form-item .t-input__extra');
    const cleared=item.validate('submit'); const clearRequest=demo.requests.shift(); form.clearValidate(); clearRequest.resolve(false);
    const clearResult=await cleared; ${settle} const clearHidden=!host.querySelector('t-form-item .t-input__extra');
    const rejected=item.validate('submit'); demo.fail(); const rejectResult=await rejected; ${settle}
    form.clearValidate(); ${settle}
    const submission=form.submitForm(); ${settle} const requestsBefore=demo.requests.length;
    const duplicate=await form.submitForm(); const duplicateSingle=demo.requests.length===requestsBefore;
    demo.finish(true); const submitted=await submission; ${settle}
    const beforeReset=demo.submits(); const resetPending=form.submitForm(); ${settle} form.resetForm(); demo.finish(true);
    const resetCancelled=await resetPending; ${settle}
    const beforeChange=demo.submits(); const changedPending=form.submitForm(); ${settle} demo.name.setValue('提交期间变化'); ${settle} demo.finish(true);
    const changeCancelled=await changedPending; ${settle}
    form.clearValidate();
    const renamePending=form.submitForm(); ${settle} demo.fieldName.set('renamed'); ng.applyChanges(demo); ${settle} demo.finish(true);
    const renameCancelled=await renamePending; ${settle}
    demo.fieldName.set('name'); ng.applyChanges(demo); ${settle}
    demo.rules.set({extra:[{validator:()=>new Promise((resolve,reject)=>demo.requests.push({resolve,reject})),message:'移除字段校验'}]});
    demo.extra.set(true); ng.applyChanges(demo); ${settle}
    const removedPending=form.submitForm(); ${settle} demo.extra.set(false); ng.applyChanges(demo); ${settle} demo.finish(true);
    const removeCancelled=await removedPending; ${settle}
    demo.useAsyncRules(); ng.applyChanges(demo); ${settle}
    const latePending=form.submitForm(); ${settle} demo.extra.set(true); ng.applyChanges(demo); ${settle} demo.finish(true);
    const additionCancelled=await latePending; ${settle} demo.extra.set(false); ng.applyChanges(demo); ${settle}
    demo.rules.set({}); ng.applyChanges(demo); ${settle}
    const callbackSub=form.validate.subscribe(()=>demo.name.setValue('校验回调改值'));
    const callbackCancelled=(await form.submitForm())===null; callbackSub.unsubscribe(); ${settle}
    const submitsBefore=demo.submits(); const nativeSubmit=new Event('submit',{bubbles:true,cancelable:true});
    native.dispatchEvent(nativeSubmit); ${settle}
    const nativeOnce=demo.submits()===submitsBefore+1 && nativeSubmit.defaultPrevented;
    const external=document.createElement('button'); external.type='submit'; external.setAttribute('form',native.id); document.body.append(external);
    const beforeExternal=demo.submits(); external.click(); ${settle} external.remove();
    const externalSubmit=demo.submits()===beforeExternal+1;
    demo.useAsyncRules(); ng.applyChanges(demo); ${settle}
    const beforeDestroy=demo.submits(); const destroyedPending=form.submitForm(); ${settle}
    demo.mounted.set(false); ng.applyChanges(demo); ${settle} demo.finish(true); const destroyCancelled=await destroyedPending; ${settle}
    return {id,dynamicId,initialDisabled,allDisabled,released,sharedLocked,sharedReleased,required:required.name.result,errorShown,unified,ownEmpty:ownEmpty.name.result,
      regex:[regex1.name.result,regex2.name.result],whitespace:whitespace.name.result,customEmpty:customEmpty.name.result,invalidPattern:invalidPattern.name.result,
      warningBlocked:warningBlocked===null,warningAllowed:!!warningAllowed,empty,initial,cloned,modelInitial,modelReset,dynamicReset,removed,
      internalFocusClean,externalFocusError,oldResult,staleHidden,clearResult,clearHidden,rejectResult,
      duplicate:duplicate===null,duplicateSingle,submitted:!!submitted,resetCancelled:resetCancelled===null,
      changeCancelled:changeCancelled===null,renameCancelled:renameCancelled===null,
      removeCancelled:removeCancelled===null,additionCancelled:additionCancelled===null,callbackCancelled,nativeOnce,externalSubmit,
      destroyCancelled:destroyCancelled===null,destroyStable:beforeDestroy===demo.submits()};
  })()`);
  assert.deepEqual(formLifecycle.id,{native:'lifecycle-native-form',host:'',count:1}); assert.equal(formLifecycle.dynamicId,'changed-native-form');
  assert.equal(formLifecycle.initialDisabled,true); assert.equal(formLifecycle.allDisabled,true); assert.deepEqual(formLifecycle.released,{name:false,locked:true});
  assert.equal(formLifecycle.sharedLocked,true); assert.equal(formLifecycle.sharedReleased,true);
  assert.equal(formLifecycle.required,false); assert.equal(formLifecycle.errorShown,'名称必填'); assert.deepEqual(formLifecycle.unified,{returned:'统一错误',shown:'统一错误'});
  assert.equal(formLifecycle.ownEmpty,true); assert.deepEqual(formLifecycle.regex,[true,true]); assert.equal(formLifecycle.whitespace,false); assert.equal(formLifecycle.customEmpty,false);
  assert.equal(formLifecycle.invalidPattern,false);
  assert.equal(formLifecycle.warningBlocked,true); assert.equal(formLifecycle.warningAllowed,true);
  assert.deepEqual(formLifecycle.empty,{fields:{name:'',count:null,enabled:false,locked:'',tags:[]},resets:1,pristine:true,touched:false,locked:true});
  assert.deepEqual(formLifecycle.initial,{name:'初始名称',count:3,enabled:true,locked:'保留禁用',tags:['a']}); assert.deepEqual(formLifecycle.cloned,['a']);
  assert.equal(formLifecycle.modelInitial,'模板初始值'); assert.deepEqual(formLifecycle.modelReset,{model:'模板初始值',text:'模板初始值'});
  assert.equal(formLifecycle.dynamicReset,'动态初始值'); assert.equal(formLifecycle.removed,true);
  assert.equal(formLifecycle.internalFocusClean,true); assert.equal(formLifecycle.externalFocusError,'离焦检查');
  assert.deepEqual(formLifecycle.oldResult,{result:false,stale:true}); assert.equal(formLifecycle.staleHidden,true);
  assert.deepEqual(formLifecycle.clearResult,{result:false,stale:true}); assert.equal(formLifecycle.clearHidden,true);
  assert.deepEqual(formLifecycle.rejectResult,{result:false,message:'异步校验失败',type:'error'});
  for(const key of ['duplicate','duplicateSingle','submitted','resetCancelled','changeCancelled','renameCancelled','removeCancelled','additionCancelled','callbackCancelled','nativeOnce','externalSubmit','destroyCancelled','destroyStable']) assert.equal(formLifecycle[key],true,key);
  console.log('PASS Form lifecycle: reset modes/native reset, disabled ownership, IDs, validation triggers/regex/empty/warnings, dynamic fields, stale async results and submission');
  await page('/form', 'demo-form-readonly .ro-input input');
  const formReadonly = await evaluate(`(async () => {
    const root=document.querySelector('demo-form-readonly'), demo=ng.getComponent(root), form=ng.getComponent(root.querySelector('t-form'));
    const get=selector=>root.querySelector(selector), comp=selector=>ng.getComponent(get(selector));
    const edit=async (input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));${settle}};
    const input=get('.ro-input input'); input.focus();
    const initial={readonly:input.readOnly,disabled:input.disabled,enabled:demo.text.enabled,focused:document.activeElement===input,clear:!!get('.ro-input .t-input__suffix-clear')};
    await edit(input,'不应修改'); const textStable=demo.text.value==='表单文本' && input.value==='表单文本';
    const textarea=get('.ro-textarea textarea'); await edit(textarea,'不应修改'); const textareaStable=textarea.value==='多行内容';
    const number=comp('.ro-number'), numberEvents=[]; number.change.subscribe(event=>numberEvents.push(event));
    get('.ro-number input').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true})); ${settle}
    const numberStable=numberEvents.length===0 && get('.ro-number input').readOnly;
    const range=comp('.ro-range'), rangeEvents=[]; range.change.subscribe(event=>rangeEvents.push(event));
    await edit(get('.ro-range input'),'9'); const rangeStable=rangeEvents.length===0 && get('.ro-range input').readOnly && !get('.ro-range .t-range-input__suffix-clear');
    const tags=comp('.ro-tags'), tagEvents=[]; tags.change.subscribe(event=>tagEvents.push(event));
    tags.removeTag(0,new MouseEvent('click')); ${settle}
    const tagReadonly=tags.mergedReadonly() && !tags.dragEnabled() && tagEvents.length===0 && !get('.ro-tags .t-tag__icon-close');
    const checkbox=get('.ro-checkbox input'); checkbox.click(); ${settle}
    const checkboxStable=checkbox.checked && checkbox.getAttribute('aria-readonly')==='true';
    const checkboxGroup=get('.ro-checkbox-group'); checkboxGroup.querySelectorAll('input')[1].click(); ${settle}
    const checkboxChecks=[...checkboxGroup.querySelectorAll('input')].map(el=>el.checked);
    const radio=get('.ro-radio input'); radio.click(); ${settle} const radioStable=radio.checked;
    const radios=get('.ro-radio-group').querySelectorAll('input'); radios[1].click();
    radios[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); ${settle}
    const radioChecks=[...radios].map(el=>el.checked);
    const select=comp('.ro-select'), selectInput=get('.ro-select input');
    select.handleWrapperClick(new MouseEvent('click')); await edit(selectInput,'query');
    const selectStable=!select.popupVisible() && selectInput.readOnly && select.query()==='';
    const selectInputComp=comp('.ro-select-input'), selectionEvents=[]; selectInputComp.valueChange.subscribe(value=>selectionEvents.push(value));
    selectInputComp.handlePopupVisibleChange(true); selectInputComp.handleClear(new MouseEvent('click'));
    selectInputComp.removeTagAt(0); ${settle}
    demo.popupVisible.set(true); ng.applyChanges(demo); ${settle}
    const selectInputStable=!selectInputComp.isPopupVisible() && selectionEvents.length===0 && demo.selected().length===2 && get('.ro-select-input input').readOnly
      && !ng.getComponent(get('.ro-select-input t-popup')).innerVisible();
    demo.popupVisible.set(undefined); ng.applyChanges(demo); ${settle}
    const auto=comp('.ro-auto'); auto.handleFocus(new FocusEvent('focus')); auto.handleKeydown(new KeyboardEvent('keydown',{key:'ArrowDown'})); ${settle}
    const autoStable=!auto.open() && get('.ro-auto input').readOnly;
    const date=comp('.ro-dates'), oldDates=JSON.stringify(demo.dates());
    date.handleVisibleChange(true); date.handleClear(new MouseEvent('click')); date.commit(['2026-11-02','2026-11-03'],'clear'); ${settle}
    const dateStable=!date.open() && oldDates===JSON.stringify(demo.dates()) && [...get('.ro-dates').querySelectorAll('input')].every(el=>el.readOnly);
    demo.extra.set(true); ng.applyChanges(demo); ${settle} const dynamic=get('.ro-dynamic input').readOnly;
    demo.text.setValue('程序更新'); ${settle} const programmatic=input.value==='程序更新';
    const submission=await form.submitForm(); const submitAllowed=submission?.fields.text==='程序更新';
    form.resetForm(); ${settle} const resetAllowed=demo.text.value==='' && input.readOnly;
    const outside=get('.ro-outside input'); await edit(outside,'外部编辑'); const outsideEditable=!outside.readOnly && outside.value==='外部编辑';
    const switchHost=get('.ro-switch'); switchHost.click(); ${settle} const switchIndependent=switchHost.getAttribute('aria-checked')==='true';
    demo.readonly.set(false); ng.applyChanges(demo); ${settle}
    const released={input:input.readOnly,explicit:get('.ro-explicit input').readOnly,textarea:textarea.readOnly,number:get('.ro-number input').readOnly,dynamic:get('.ro-dynamic input').readOnly};
    await edit(input,'恢复编辑'); const editable=demo.text.value==='恢复编辑';
    const popupCases=[];
    for (const kind of ['select','select-input','auto','dates']) {
      demo.readonly.set(false); ng.applyChanges(demo); ${settle}
      if(kind==='select') select.handleWrapperClick(new MouseEvent('click'));
      if(kind==='select-input') selectInputComp.handlePopupVisibleChange(true);
      if(kind==='auto') auto.handleFocus(new FocusEvent('focus'));
      if(kind==='dates') date.handleVisibleChange(true);
      ${settle}
      const before=kind==='select'?select.popupVisible():kind==='select-input'?selectInputComp.isPopupVisible():kind==='auto'?auto.open():date.open();
      demo.readonly.set(true); ng.applyChanges(demo); ${settle}
      const after=kind==='select'?select.popupVisible():kind==='select-input'?selectInputComp.isPopupVisible():kind==='auto'?auto.open():date.open();
      const popup=kind==='select'?null:ng.getComponent(get('.ro-'+kind+' t-popup'));
      const closed=kind==='select'?!select.overlayRef?.hasAttached():!popup.innerVisible();
      popupCases.push({kind,before,after,closed});
    }
    demo.readonly.set(false); ng.applyChanges(demo); ${settle}
    input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true})); input.value='组合草稿';
    input.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true})); ${settle}
    demo.readonly.set(true); ng.applyChanges(demo); ${settle}
    input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true})); ${settle}
    const compositionCancelled=input.value===demo.text.value && demo.text.value==='恢复编辑';
    return {initial,textStable,textareaStable,numberStable,rangeStable,tagReadonly,checkboxStable,checkboxChecks,radioStable,radioChecks,
      selectStable,selectInputStable,autoStable,dateStable,dynamic,programmatic,submitAllowed,resetAllowed,outsideEditable,switchIndependent,released,editable,popupCases,compositionCancelled};
  })()`);
  assert.deepEqual(formReadonly.initial,{readonly:true,disabled:false,enabled:true,focused:true,clear:false});
  for(const key of ['textStable','textareaStable','numberStable','rangeStable','tagReadonly','checkboxStable','radioStable','selectStable','selectInputStable','autoStable','dateStable','dynamic','programmatic','submitAllowed','resetAllowed','outsideEditable','switchIndependent','editable','compositionCancelled']) assert.equal(formReadonly[key],true,key);
  assert.deepEqual(formReadonly.checkboxChecks,[true,false]); assert.deepEqual(formReadonly.radioChecks,[true,false]);
  assert.deepEqual(formReadonly.released,{input:false,explicit:true,textarea:false,number:false,dynamic:false});
  assert.deepEqual(formReadonly.popupCases,['select','select-input','auto','dates'].map(kind=>({kind,before:true,after:false,closed:true})));
  console.log('PASS Form readonly: inherited union, 13 control entries, editable recovery, dynamic fields, clear/removal guards, popup close, IME cancel, CVA enabled, reset/submit');
  await page('/select-input', 'demo-select-input-options input');
  const selectInputState = await evaluate(`(async () => {
    const root=document.querySelector('demo-select-input-options'), demo=ng.getComponent(root);
    const singleHost=root.querySelector('.options-single'), single=ng.getComponent(singleHost), input=singleHost.querySelector('input');
    const multiHost=root.querySelector('.options-multiple'), multi=ng.getComponent(multiHost), multiInput=multiHost.querySelector('input');
    const edit=async(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));${settle}};
    single.handlePopupVisibleChange(true); ${settle}
    const attrs={name:input.name,autocomplete:input.autocomplete,spellcheck:input.spellcheck};
    await edit(input,'a中😀z'); const limited={text:input.value,value:demo.keyword(),callbacks:demo.inputs()};
    input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
    input.value='中文测试'; input.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true})); ${settle}
    const composing={text:input.value,value:demo.keyword(),enters:demo.enters()};
    input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true})); input.dispatchEvent(new InputEvent('input',{bubbles:true})); ${settle}
    const composed={text:input.value,value:demo.keyword(),callbacks:demo.inputs()};
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); ${settle}
    const clipboard=new DataTransfer(); clipboard.setData('text','fixture');
    input.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,clipboardData:clipboard})); ${settle}
    const events={enters:demo.enters(),paste:demo.pastes()};
    demo.acceptChanges.set(false); ng.applyChanges(demo); ${settle} await edit(input,'拒绝');
    const rejected=input.value===demo.keyword() && demo.keyword()==='中文测';
    demo.acceptChanges.set(true); demo.inputProps.set({...demo.inputProps(),name:'updated-name',maxlength:3,maxcharacter:undefined}); ng.applyChanges(demo); ${settle}
    await edit(input,'中😀文x'); const dynamic={name:input.name,text:input.value};
    demo.disabled.set(true); ng.applyChanges(demo); ${settle} const disabled={native:input.disabled,visible:single.isPopupVisible()};
    const beforeDisabled=demo.inputs(); await edit(input,'blocked'); const disabledStable=demo.inputs()===beforeDisabled;
    demo.disabled.set(false); demo.readonly.set(true); ng.applyChanges(demo); ${settle}
    const readonly=input.readOnly && !singleHost.querySelector('.t-input__suffix-clear');
    demo.readonly.set(false); ng.applyChanges(demo); ${settle}
    const multiAttributes={name:multiInput.name,max:multiInput.getAttribute('maxlength')};
    const tag=multiHost.querySelector('.t-tag');
    const tagStyle={primary:tag.classList.contains('t-tag--primary'),round:tag.classList.contains('t-tag--round')};
    multi.handlePopupVisibleChange(true); ${settle} const defaultInput=multiInput.value;
    await edit(multiInput,'中文测试'); const nestedLimit={text:multiInput.value,events:demo.multiInputs(),callbacks:demo.multiCallbacks()};
    demo.initialKeyword.set('默认值变化'); ng.applyChanges(demo); ${settle} const defaultOnce=multiInput.value;
    multi.handlePopupVisibleChange(false); ${settle} multi.handlePopupVisibleChange(true); ${settle}
    const clearedKeyword=multiInput.value;
    demo.reserve.set(true); ng.applyChanges(demo); ${settle} await edit(multiInput,'保留');
    multi.handlePopupVisibleChange(false); ${settle} multi.handlePopupVisibleChange(true); ${settle}
    const reserved=multiInput.value;
    multiHost.querySelector('.t-tag__icon-close').dispatchEvent(new MouseEvent('click',{bubbles:true})); ${settle}
    const removed={value:[...demo.tags()],changes:demo.tagChanges(),callbacks:demo.tagCallbacks(),closes:demo.closes()};
    demo.acceptChanges.set(false); ng.applyChanges(demo); ${settle}
    multiHost.querySelector('.t-tag__icon-close').dispatchEvent(new MouseEvent('click',{bubbles:true})); ${settle}
    const rejectionPreserved=multiHost.querySelectorAll('t-tag').length===2 && demo.tags().length===2;
    demo.acceptChanges.set(true); demo.tagInputProps.set({...demo.tagInputProps(),inputProps:{readonly:true,disabled:false}}); ng.applyChanges(demo); ${settle}
    const nestedReadonly=multiInput.readOnly && !multi.isPopupVisible() && !multiHost.querySelector('.t-tag__icon-close');
    demo.sharedProps.set({disabled:true}); demo.tagInputProps.set({...demo.tagInputProps(),inputProps:{readonly:false,disabled:false}}); ng.applyChanges(demo); ${settle}
    const disabledUnion=multiInput.disabled;
    demo.sharedProps.set({}); demo.tagInputProps.set({...demo.tagInputProps(),inputProps:{},tagProps:{closable:false,theme:'danger'}}); ng.applyChanges(demo); ${settle}
    const noClose=!multiHost.querySelector('.t-tag__icon-close');
    demo.tagProps.set({closable:true,theme:'success'}); ng.applyChanges(demo); ${settle}
    const explicitTag=!!multiHost.querySelector('.t-tag--success .t-tag__icon-close');
    multi.handleClear(new MouseEvent('click')); ${settle} const cleared=demo.tags();
    const formHost=root.querySelector('.options-form'), form=ng.getComponent(formHost), formInput=formHost.querySelector('input');
    form.handlePopupVisibleChange(true); ${settle} formInput.focus();
    form.removeTagAt(0); ${settle} const pending={value:[...demo.control.value],count:formHost.querySelectorAll('t-tag').length,touched:demo.control.touched};
    const ownPanel=document.querySelector('.form-panel-button'); ownPanel.focus(); ${settle}
    const ownUntouched=!demo.control.touched; ownPanel.blur(); ${settle}
    const blurred={value:[...demo.control.value],touched:demo.control.touched};
    demo.control.disable(); ng.applyChanges(demo); ${settle} const formDisabled=formInput.disabled && !form.isPopupVisible();
    demo.control.enable(); demo.control.reset(); ng.applyChanges(demo); ${settle}
    const reset={value:[...demo.control.value],count:formHost.querySelectorAll('t-tag').length,touched:demo.control.touched};
    single.handlePopupVisibleChange(true); ${settle} input.focus(); const otherPanel=document.querySelector('.multiple-panel-button');
    multi.handlePopupVisibleChange(true); ${settle} document.querySelector('.multiple-panel-button').focus(); ${settle}
    const unrelatedBlur=!single.focused();
    const popup=ng.getComponent(singleHost.querySelector('t-popup'));
    demo.visible.set(true); ng.applyChanges(demo); ${settle} popup.hide(); ${settle}
    const rejectedClose=popup.isVisible();
    demo.visible.set(false); ng.applyChanges(demo); ${settle} popup.show(); ${settle}
    const rejectedOpen=!popup.isVisible();
    demo.visible.set(undefined); ng.applyChanges(demo); ${settle}
    return {attrs,limited,composing,composed,events,rejected,dynamic,disabled,disabledStable,readonly,multiAttributes,tagStyle,defaultInput,nestedLimit,
      defaultOnce,clearedKeyword,reserved,removed,rejectionPreserved,nestedReadonly,disabledUnion,noClose,explicitTag,cleared,pending,ownUntouched,blurred,formDisabled,reset,unrelatedBlur,rejectedClose,rejectedOpen};
  })()`);
  assert.deepEqual(selectInputState.attrs,{name:'single-search',autocomplete:'off',spellcheck:false});
  assert.deepEqual(selectInputState.limited,{text:'a中',value:'a中',callbacks:1});
  assert.deepEqual(selectInputState.composing,{text:'中文测试',value:'a中',enters:0});
  assert.deepEqual(selectInputState.composed,{text:'中文测',value:'中文测',callbacks:2}); assert.deepEqual(selectInputState.events,{enters:1,paste:1});
  assert.equal(selectInputState.rejected,true); assert.deepEqual(selectInputState.dynamic,{name:'updated-name',text:'中😀文'});
  assert.deepEqual(selectInputState.disabled,{native:true,visible:false}); assert.equal(selectInputState.disabledStable,true); assert.equal(selectInputState.readonly,true);
  assert.deepEqual(selectInputState.multiAttributes,{name:'nested-search',max:null}); assert.deepEqual(selectInputState.tagStyle,{primary:true,round:true});
  assert.equal(selectInputState.defaultInput,'初始'); assert.deepEqual(selectInputState.nestedLimit,{text:'中文',events:1,callbacks:1});
  assert.equal(selectInputState.defaultOnce,'中文'); assert.equal(selectInputState.clearedKeyword,''); assert.equal(selectInputState.reserved,'保留');
  assert.deepEqual(selectInputState.removed,{value:['第二个','第三个'],changes:1,callbacks:1,closes:1}); assert.equal(selectInputState.rejectionPreserved,true);
  for(const key of ['nestedReadonly','disabledUnion','noClose','explicitTag','ownUntouched','formDisabled','unrelatedBlur','rejectedClose','rejectedOpen']) assert.equal(selectInputState[key],true,key);
  assert.deepEqual(selectInputState.cleared,[]); assert.deepEqual(selectInputState.pending,{value:['表单','可删除'],count:1,touched:false});
  assert.deepEqual(selectInputState.blurred,{value:['可删除'],touched:true}); assert.deepEqual(selectInputState.reset,{value:['表单','可删除'],count:2,touched:false});
  console.log('PASS SelectInput options/state: attrs/limits, IME once, callbacks, nested precedence, tag removal/rejection, keyword retention, CVA focus/reset, paste once');
  const selectInputPointer=await evaluate(`(async()=>{
    const root=document.querySelector('demo-select-input-options'),demo=ng.getComponent(root),host=root.querySelector('.options-single');
    ng.getComponent(host).handlePopupVisibleChange(false); ${settle}
    host.scrollIntoView({block:'center',behavior:'instant'}); ${settle}
    demo.mouseEnters.set(0);demo.mouseLeaves.set(0);
    const rect=host.querySelector('input').getBoundingClientRect();return {x:rect.left+rect.width/2,y:rect.top+rect.height/2};
  })()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5});
  await evaluate(`(async()=>{${settle}})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...selectInputPointer});
  await evaluate(`(async()=>{${settle}})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5});
  await evaluate(`(async()=>{${settle}})()`);
  const selectMouse=await evaluate(`(()=>{const demo=ng.getComponent(document.querySelector('demo-select-input-options'));return {enter:demo.mouseEnters(),leave:demo.mouseLeaves()};})()`);
  assert.deepEqual(selectMouse,{enter:1,leave:1});
  await page('/auto-complete', 'demo-auto-complete-options input');
  const autoOptions=await evaluate(`(async()=>{
    const root=document.querySelector('demo-auto-complete-options'),demo=ng.getComponent(root);
    const host=root.querySelector('.options-controlled'),auto=ng.getComponent(host),input=host.querySelector('input');
    const edit=async(el,text)=>{el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));${settle}};
    const key=async(el,name)=>{el.dispatchEvent(new KeyboardEvent('keydown',{key:name,bubbles:true,cancelable:true}));${settle}};
    const attrs={name:input.name,autocomplete:input.autocomplete,spellcheck:input.spellcheck,role:input.getAttribute('role')};
    input.focus(); ${settle}
    const overlay=document.querySelector('.auto-options-popup');
    const popup={classes:overlay.classList.contains('t-select__dropdown'),inner:!!overlay.querySelector('.auto-options-inner'),arrow:!!overlay.querySelector('.t-popup__arrow'),zIndex:overlay.style.zIndex};
    await edit(input,'a中😀x'); const limited={text:input.value,value:demo.value(),callbacks:demo.inputs()};
    demo.value.set('');ng.applyChanges(demo);${settle}
    input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));await edit(input,'中文测试');
    await key(input,'Enter');const composing={value:demo.value(),text:input.value,enters:demo.enters()};
    input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));input.dispatchEvent(new Event('input',{bubbles:true}));${settle}
    const composed={value:demo.value(),callbacks:demo.inputs(),compositions:demo.compositions()};
    demo.acceptChanges.set(false);ng.applyChanges(demo);${settle}await edit(input,'beta');const rejected=input.value===demo.value();
    demo.value.set('');demo.filterable.set(false);ng.applyChanges(demo);${settle}
    await key(input,'ArrowDown');const aria=input.getAttribute('aria-activedescendant')===document.querySelector('.auto-options-popup [role=option]').id;
    await key(input,'Enter');const rejectedSelection={value:demo.value(),text:input.value,selects:demo.selects(),open:auto.open()};
    await key(input,'Enter');const noRepeat=demo.selects()===1;
    demo.acceptChanges.set(true);ng.applyChanges(demo);${settle}await key(input,'ArrowUp');await key(input,'Escape');
    const escaped=!auto.open()&&!input.hasAttribute('aria-activedescendant')&&!document.querySelector('.auto-options-popup');
    demo.options.set(['']);ng.applyChanges(demo);${settle}input.blur();input.focus();${settle}
    await key(input,'Enter');const emptyNotImplicit=demo.selects()===1;
    await key(input,'ArrowDown');await key(input,'Enter');const emptySelectable=demo.selects()===2;
    demo.options.set(['old']);ng.applyChanges(demo);${settle}await key(input,'ArrowDown');
    demo.options.set(['new']);ng.applyChanges(demo);${settle}await key(input,'Enter');const staleIgnored=demo.selects()===2;
    await key(input,'ArrowDown');await key(input,'Enter');const dynamicSelection=demo.value()==='new';
    demo.popupProps.set({...demo.popupProps(),disabled:true});ng.applyChanges(demo);${settle}await edit(input,'beta');
    const panelDisabled=input.value==='beta'&&!input.disabled&&!auto.open();
    demo.popupProps.set({...demo.popupProps(),disabled:false});demo.inputProps.set({...demo.inputProps(),readonly:true});ng.applyChanges(demo);${settle}
    await key(input,'ArrowDown');const configReadonly=input.readOnly&&!auto.open();
    demo.inputProps.set({...demo.inputProps(),readonly:false,disabled:false,maxlength:3,maxcharacter:undefined});demo.disabled.set(true);ng.applyChanges(demo);${settle}
    const disabledUnion=input.disabled;demo.disabled.set(false);ng.applyChanges(demo);${settle}await edit(input,'a😀bc');const dynamicLimit=input.value;
    const defaultHost=root.querySelector('.options-default'),defaultInput=defaultHost.querySelector('input');
    await edit(defaultInput,'edited');demo.initial.set('changed');ng.applyChanges(demo);${settle}const defaultOnce=defaultInput.value;
    const formHost=root.querySelector('.options-form'),form=ng.getComponent(formHost),formInput=formHost.querySelector('input');
    formInput.focus();${settle}await edit(formInput,'n');await key(formInput,'ArrowDown');await key(formInput,'Enter');
    const pending={model:demo.control.value,text:formInput.value,touched:demo.control.touched};
    await key(formInput,'ArrowDown');const footer=document.querySelector('.auto-panel-button');footer.focus();${settle}
    const ownUntouched=!demo.control.touched;footer.blur();${settle}const blurred={model:demo.control.value,touched:demo.control.touched};
    demo.control.disable();ng.applyChanges(demo);${settle}const formDisabled=formInput.disabled&&!form.open();
    demo.control.enable();demo.control.reset();ng.applyChanges(demo);${settle}const reset={text:formInput.value,touched:demo.control.touched};
    const customHost=root.querySelector('.options-custom'),custom=ng.getComponent(customHost),button=customHost.querySelector('button');
    button.focus();${settle}await key(button,'ArrowDown');await key(button,'Enter');const customSelected=demo.customValue();
    button.blur();${settle}
    return {attrs,popup,limited,composing,composed,rejected,aria,rejectedSelection,noRepeat,escaped,emptyNotImplicit,emptySelectable,staleIgnored,dynamicSelection,
      panelDisabled,configReadonly,disabledUnion,dynamicLimit,defaultOnce,pending,ownUntouched,blurred,formDisabled,reset,customSelected};
  })()`);
  assert.deepEqual(autoOptions.attrs,{name:'auto-search',autocomplete:'off',spellcheck:false,role:'combobox'});
  assert.deepEqual(autoOptions.popup,{classes:true,inner:true,arrow:true,zIndex:'2300'});
  assert.deepEqual(autoOptions.limited,{text:'a中',value:'a中',callbacks:1});
  assert.deepEqual(autoOptions.composing,{value:'',text:'中文测试',enters:0});
  assert.deepEqual(autoOptions.composed,{value:'中文测',callbacks:2,compositions:1});
  assert.deepEqual(autoOptions.rejectedSelection,{value:'',text:'',selects:1,open:false});
  for(const key of ['rejected','aria','noRepeat','escaped','emptyNotImplicit','emptySelectable','staleIgnored','dynamicSelection','panelDisabled','configReadonly','disabledUnion','ownUntouched','formDisabled']) assert.equal(autoOptions[key],true,key);
  assert.equal(autoOptions.dynamicLimit,'a😀b');assert.equal(autoOptions.defaultOnce,'edited');
  assert.deepEqual(autoOptions.pending,{model:'form',text:'next',touched:false});assert.deepEqual(autoOptions.blurred,{model:'next',touched:true});
  assert.deepEqual(autoOptions.reset,{text:'form',touched:false});assert.equal(autoOptions.customSelected,'custom-a');
  console.log('PASS AutoComplete options/state: popup config, native attrs/Unicode/IME, controlled rejection/default once, keyboard/ARIA/dynamic options, readonly/disabled, CVA blur/reset, custom trigger');
  assert.deepEqual(failures, [], 'Browser exceptions or failed resources');
  console.log('All component completion interaction checks passed.');
} finally {
  socket.close();
  await fetch(`${endpoint}/json/close/${created.id}`);
}
