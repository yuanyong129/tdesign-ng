import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'empty',
    upstreamInterface: 'TdEmptyProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // title / description / image / imageStyle 已实现，只是类型收窄为字符串（不支持 TNode / ImageProps）。
      'action': 'Angular 用 <t-button tEmptyAction> 投影操作区，不是 TNode 属性',
    },
  };
