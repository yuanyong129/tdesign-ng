import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'dialog',
    upstreamInterface: 'TdDialogProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'default': '内容通过 ng-content 投影，不需要 default 插槽属性',
      'attach': '对话框固定挂到 body 层级的 fixed 容器，暂不支持自定义挂载点',
      'draggable': '拖拽尚未实现，需要时可在外层自行实现',
      'showInAttachedElement': '同 attach，暂不支持挂到指定元素内',
      'confirmOnEnter': '回车确认尚未实现',
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onConfirm': 'Angular 用 (confirm) 输出',
      'onCancel': 'Angular 用 (cancel) 输出',
      'onCloseBtnClick': '关闭按钮会触发 (close)，trigger 为 close-btn',
      'onOverlayClick': 'Angular 用 (overlayClick) 输出',
      'onEscKeydown': 'Esc 关闭会触发 (close)，trigger 为 esc',
      'onBeforeClose': '暂未暴露关闭前钩子',
      'onBeforeOpen': '暂未暴露打开前钩子',
      'onOpened': '暂未暴露打开后回调，可用 (visibleChange) 判断',
      'onClosed': '暂未暴露关闭后回调，可用 (visibleChange) 判断',
    },
  };
