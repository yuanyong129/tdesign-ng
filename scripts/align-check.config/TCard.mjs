

export default {
    upstream: 'card',
    upstreamInterface: 'TdCardProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载卡片主体内容',
      default: '同 content，Vue 的默认插槽',
    },
  };
