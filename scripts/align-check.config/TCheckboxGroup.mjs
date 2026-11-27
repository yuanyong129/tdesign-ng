import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'checkbox',
    upstreamInterface: 'TdCheckboxGroupProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'lazyLoad': 'Angular 组件按需渲染，没有延迟加载的等价概念',
    },
  };
