

export default {
    upstream: 'popconfirm',
    upstreamInterface: 'TdPopconfirmProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> / triggerElement 承载触发器',
      onCancel: 'Angular 用 (cancel) 输出，参数 { e }',
      onConfirm: 'Angular 用 (confirm) 输出，参数 { e }',
      onVisibleChange: 'Angular 用 (visibleChange) 输出，参数 { visible, trigger, e? }（对齐上游两段式参数）',
    },
  };
