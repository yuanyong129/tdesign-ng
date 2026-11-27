import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'textarea',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
      'onKeypress': 'Angular 用 (keypress) 输出原生 KeyboardEvent，组件内部阻止冒泡以避免重复触发',
      'onValidate': 'Angular 用 (validate) 输出，参数 { error }；初始超限及超限状态切换时触发',
    },
  };
