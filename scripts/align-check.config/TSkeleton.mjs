

export default {
    upstream: 'skeleton',
    upstreamInterface: 'TdSkeletonProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载被包裹的内容',
      default: '同 content，Vue 的默认插槽',
    },
  };
