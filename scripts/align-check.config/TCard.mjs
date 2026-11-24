

export default {
    upstream: 'card',
    upstreamInterface: 'TdCardProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载卡片主体内容',
      default: '同 content，Vue 的默认插槽',
      loadingProps: '[D2] 加载态目前是内置骨架，透传 t-loading 全部属性留到深度期',
    },
  };
