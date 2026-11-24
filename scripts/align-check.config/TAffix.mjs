

export default {
    upstream: 'affix',
    upstreamInterface: 'TdAffixProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载被吸附的内容',
      onFixedChange:
        'Angular 用 (fixedChange) 输出 { affixed, top }，且只在吸附状态翻转时派发（避免滚动期间反复变更检测）',
    },
  };
