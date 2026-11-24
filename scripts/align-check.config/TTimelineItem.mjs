

export default {
    upstream: 'timeline',
    upstreamInterface: 'TdTimelineItemProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载节点内容（未传 content 时渲染投影）',
      onClick: 'Angular 用 (itemClick) 输出，避开与原生 click 重名',
    },
  };
