import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'rate',
    upstreamInterface: 'TdRateProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'onChange': 'Angular 用 (change) 输出',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  };
