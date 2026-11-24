

export default {
    upstream: 'back-top',
    upstreamInterface: 'TdBackTopProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载自定义按钮内容',
      onClick: 'Angular 用宿主原生 (click)，避免与内部按钮双触发',
    },
  };
