

export default {
    upstream: 'popconfirm',
    upstreamInterface: 'TdPopconfirmProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> / triggerElement 承载触发器',
      popupProps: '[D2] 未透传 popupProps，弹层可配置项由组件显式 input 暴露（placement / trigger / showArrow / destroyOnClose）',
      onCancel: 'Angular 用 (cancel) 输出，参数 { e }',
      onConfirm: 'Angular 用 (confirm) 输出，参数 { e }',
      onVisibleChange: 'Angular 用 (visibleChange) 输出，参数 { visible, trigger, e? }（对齐上游两段式参数）',
    },
  };
