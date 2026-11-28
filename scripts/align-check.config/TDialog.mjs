import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'dialog',
    upstreamInterface: 'TdDialogProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'default': '内容通过 ng-content 投影，不需要 default 插槽属性',
      'attach': '[D2] 当前在原模板位置渲染，尚未接入自定义挂载点',
      'draggable': '[D2] 对话框拖动尚未实现，留到挂载和内容配置之后',
      'showInAttachedElement': '[D2] 依赖 attach 的局部显示与定位，后续挂载批次实现',
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onConfirm': 'Angular 用 (confirm) 输出',
      'onCancel': 'Angular 用 (cancel) 输出',
      'onCloseBtnClick': 'Angular 用独立 (closeBtnClick) 输出，键盘激活也携带原事件',
      'onOverlayClick': 'Angular 用 (overlayClick) 输出',
      'onEscKeydown': 'Angular 用独立 (escKeydown) 输出，禁用 Esc 关闭时仍通知',
      'onBeforeClose': 'Angular 用 (beforeClose) 输出，通知实际状态变化，不是拦截器',
      'onBeforeOpen': 'Angular 用 (beforeOpen) 输出，通知实际状态变化，不是拦截器',
      'onOpened': 'Angular 用 (opened) 输出，表示打开状态渲染完成，不承诺退出动画时长',
      'onClosed': 'Angular 用 (closed) 输出，表示关闭状态渲染完成，不承诺退出动画时长',
    },
  };
