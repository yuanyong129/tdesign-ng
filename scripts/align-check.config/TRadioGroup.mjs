import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'radio',
    upstreamInterface: 'TdRadioGroupProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 作为受控初始值',
    },
  };
