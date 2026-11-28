import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'popup',
    upstreamInterface: 'TdPopupProps',
    renames: {},
    angularOnly: ['ignoreOutsideSelector', 'visibleChangeContext'],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'default': '触发器与内容都通过 ng-content 投影，不需要 default 插槽属性',
      'modelValue': 'Angular 用 [(visible)] 双向绑定',
      'popperOptions': '定位由 CDK Overlay 负责，不透传 popper 配置',
      'onScroll': 'Angular 用 (scroll) 输出 { e: Event }，对应运行时原生 scroll 而非类型声明的 WheelEvent',
      'onScrollToBottom': 'Angular 用 (scrollToBottom) 输出 { e: Event }，100ms 去抖',
      'onOverlayClick': 'Angular 用 (overlayClick) 输出',
      'onVisibleChange': 'Angular 用 (visibleChange) 输出',
    },
  };
