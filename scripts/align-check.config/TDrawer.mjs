import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'drawer',
    upstreamInterface: 'TdDrawerProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'default': '内容通过 ng-content 投影，不需要 default 插槽属性',
      'attach': '抽屉固定挂到 body 层级的 fixed 容器，暂不支持自定义挂载点',
      'showInAttachedElement': '同 attach，暂不支持挂到指定元素内',
      'sizeDraggable': '拖拽调整尺寸尚未实现',
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onConfirm': 'Angular 用 (confirm) 输出',
      'onCancel': 'Angular 用 (cancel) 输出',
      'onCloseBtnClick': '关闭按钮会触发 (close)，trigger 为 close-btn',
      'onOverlayClick': 'Angular 用 (overlayClick) 输出',
      'onEscKeydown': 'Esc 关闭会触发 (close)，trigger 为 esc',
      'onBeforeClose': '暂未暴露关闭前钩子',
      'onBeforeOpen': '暂未暴露打开前钩子',
      'onSizeDragEnd': '尺寸拖拽未实现，因此没有该事件',
    },
  };
