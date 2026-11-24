import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'rate',
    upstreamInterface: 'TdRateProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // color / texts / size 已实现（数组与字符串），icon 未实现。
      'icon': '自定义评分图标在后续版本实现，当前固定使用内置星形',
      'onChange': 'Angular 用 (change) 输出',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  };
