import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'switch',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
    },
  };
