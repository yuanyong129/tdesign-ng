import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'input',
    upstreamInterface: 'TdInputProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'prefixIcon': 'Angular 用 <t-icon tInputPrefixIcon> 投影，不是输入属性',
      'suffixIcon': 'Angular 用 <t-icon tInputSuffixIcon> 投影到后缀图标区',
      'suffix': 'Angular 用 <ng-content select="[tInputSuffix]"> 承载任意后置内容',
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'onClear': 'Angular 用 (clear) 输出',
      'onCompositionstart': 'Angular 用 (compositionstart) 输出 { value, e }',
      'onCompositionend': 'Angular 用 (compositionend) 输出 { value, e }',
      'onMouseenter': 'Angular 用宿主原生 (mouseenter) 监听，参数 MouseEvent，包含标签和提示区域',
      'onMouseleave': 'Angular 用宿主原生 (mouseleave) 监听，参数 MouseEvent，包含标签和提示区域',
      'onPaste': 'Angular 用 (paste) 输出 { e, pasteValue }',
      'onValidate': 'Angular 用 (validate) 输出 { error }，长度超限状态切换时触发',
      'onWheel': 'Angular 用 (wheel) 输出 { e }',
      'onKeypress': 'Angular 用 (keypress) 输出原生 KeyboardEvent，内部阻止冒泡避免重复触发',
    },
  };
