

export default {
    upstream: 'button',
    // 上游的 type 是原生 button 的 submit/reset/button，我们的 type 语义一致；
    // TDesign 的主题与形态分别是 theme / variant，P1 已按上游拆分。
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载插槽内容，不是输入属性',
      default: '同 content，Vue 的默认插槽',
      icon: 'Angular 用 <t-icon tButtonIcon> 投影，不是输入属性',
      suffix: 'Angular 用 <span tButtonSuffix> 投影，不是输入属性',
      onClick: 'Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出，避免一次点击触发两次',
      'loadingProps': 'Angular 侧用 [loading] 搭配 t-loading 指令实现，P1 定',
    },
  };
