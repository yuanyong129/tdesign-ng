import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'input',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'prefixIcon': 'Angular 用 <t-icon tInputPrefixIcon> 投影，不是输入属性',
      'suffixIcon': '同 prefixIcon，用 <t-icon tInputSuffixIcon> 投影',
      'suffix': 'Angular 用 <ng-content select="[tInputSuffix]"> 承载任意后置内容',
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
      'onClear': 'Angular 用 (clear) 输出',
      'onCompositionstart': '组合输入事件暂未单独暴露，可用 (keydown)/(change) 覆盖',
      'onCompositionend': '同上',
      'onMouseenter': 'Angular 可直接在原生的宿主元素上监听',
      'onMouseleave': '同上',
      'onPaste': '暂未单独暴露，需要时可监听原生 paste 事件',
      'onValidate': '数值越界校验由 t-form 承担，P2 表单落地后再补',
      'onWheel': '暂未暴露，需要时可监听原生 wheel 事件',
      'inputClass': 'Angular 用 [class] 直接传，或在外层包一个元素',
      'autoWidth': '暂未实现，用 style 指定宽度即可',
      'separate': 'input-group 的属性，P2 做 t-input-group 时处理',
    },
  };
