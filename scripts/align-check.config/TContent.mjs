

export default {
    upstream: 'layout',
    upstreamInterface: 'TdContentProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载内容',
      default: '同 content，Vue 的默认插槽',
    },
  };
