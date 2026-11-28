import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'form',
    upstreamInterface: 'TdFormProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'data': 'Angular 用 ngModel/FormGroup 承载表单数据，不需要 data 输入',
      'onReset': 'Angular 用 (reset) 输出',
      'onSubmit': 'Angular 用 (submit) 输出',
      'onValidate': 'Angular 用 (validate) 输出',
    },
  };
