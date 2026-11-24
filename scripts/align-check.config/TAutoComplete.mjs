

export default {
    upstream: 'auto-complete',
    upstreamInterface: 'TdAutoCompleteProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: "[D2] 由 triggerElement 承接：Angular 把默认插槽与具名插槽合并成一个内容输入",
      modelValue: "[D1] Angular 用 [(value)] 双向绑定表达 v-model",
      inputProps: "[D2] 常用项（size/status/placeholder/tips/borderless/clearable/disabled/readonly/autofocus）已提为独立 input，不做任意属性透传",
      popupProps: "[D2] 弹层行为固定为 trigger=focus / placement=bottom-left，不做任意属性透传",
      textareaProps: "[D1] 上游 auto-complete 未消费该属性",
      onBlur: "Angular 用 (blur) 输出",
      onChange: "Angular 用 (change) 输出",
      onClear: "Angular 用 (clear) 输出",
      onCompositionstart: "Angular 用 (compositionstart) 输出",
      onCompositionend: "Angular 用 (compositionend) 输出",
      onEnter: "Angular 用 (enter) 输出",
      onFocus: "Angular 用 (focus) 输出",
      onSelect: "Angular 用 (select) 输出",
    },
  };
