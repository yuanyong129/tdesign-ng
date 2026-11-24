

export default {
    upstream: 'alert',
    upstreamInterface: 'TdAlertProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载消息主体',
      onClose: 'Angular 用 (close) 输出，参数为 { e }',
      onClosed: 'Angular 用 (closed) 输出，参数为 { e }',
    },
  };
