import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'textarea',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
      'onValidate': '数值越界校验由 t-form 承担，P2 表单落地后再补',
    },
  };
