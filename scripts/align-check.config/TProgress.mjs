import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'progress',
    upstreamInterface: 'TdProgressProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // label 已实现（string | boolean），只是不支持 TNode 渲染函数。
    },
  };
