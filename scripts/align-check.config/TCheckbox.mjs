import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'checkbox',
    upstreamInterface: 'TdCheckboxProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(checked)] 双向绑定 + ControlValueAccessor',
      'defaultChecked': 'Angular 用 [checked] 作为受控初始值',
      'default': '内容通过 ng-content 投影，无需 default 插槽属性',
      'lazyLoad': 'Angular 组件按需渲染，没有延迟加载的等价概念',
    },
  };
