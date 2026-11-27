import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'radio',
    upstreamInterface: 'TdRadioProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(checked)] 双向绑定 + ControlValueAccessor',
      'default': '内容通过 ng-content 投影，无需 default 插槽属性',
    },
  };
