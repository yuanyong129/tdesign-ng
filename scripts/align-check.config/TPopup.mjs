import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'popup',
    upstreamInterface: 'TdPopupProps',
    renames: {},
    angularOnly: ['ignoreOutsideSelector'],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'default': '触发器与内容都通过 ng-content 投影，不需要 default 插槽属性',
      'triggerElement': '触发元素就是默认投影的内容',
      'defaultVisible': 'Angular 用 [visible] 作为受控初始值',
      'modelValue': 'Angular 用 [(visible)] 双向绑定',
      'attach': '弹层固定挂到 body（CDK overlay），暂不支持自定义挂载点',
      'overlayStyle': '样式通过 [overlayClassName] 或全局 CSS 控制',
      'overlayInnerStyle': '样式通过 [overlayInnerClassName] 或全局 CSS 控制',
      'popperOptions': '定位由 CDK Overlay 负责，不透传 popper 配置',
      'onScroll': '暂未暴露内容区滚动事件，可直接监听原生 scroll',
      'onScrollToBottom': '暂未暴露滚动到底事件，可直接监听原生 scroll',
      'onOverlayClick': 'Angular 用 (overlayClick) 输出',
      'onVisibleChange': 'Angular 用 (visibleChange) 输出',
    },
  };
