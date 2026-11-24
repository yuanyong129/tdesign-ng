import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'list',
    upstreamInterface: 'TdListProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'scroll': '列表虚拟滚动在后续版本实现，当前用 height + 原生滚动；滚动位置用 (scrollChange) 读取',
      'onLoadMore': 'Angular 用 (loadMore) 输出',
      'onScroll': 'Angular 用 (scrollChange) 输出，参数是 { originalEvent, scrollTop, scrollBottom }',
    },
  };
