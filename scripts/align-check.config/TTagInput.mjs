

export default {
    upstream: 'tag-input',
    upstreamInterface: 'TdTagInputProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      inputProps: "[D1] Vue 的 InputProps 任意透传在 Angular 无等价物，输入框能力用独立 input 表达",
      tagProps: "[D1] 标签主题/尺寸由 t-tag 自身属性表达，不做对象透传",
      modelValue: "[D2] Angular 用 [(value)] 双向绑定表达 v-model",
      onBlur: "Angular 用 (blur) 输出",
      onChange: "Angular 用 (change) 输出",
      onClear: "Angular 用 (clear) 输出",
      onClick: "[D3] 宿主原生 (click) 已可监听，不再提供同名输出避免双触发",
      onDragSort: "Angular 用 (dragSortChange) 输出（input dragSort 与输出同名会冲突）",
      onEnter: "Angular 用 (enter) 输出",
      onFocus: "Angular 用 (focus) 输出",
      onInputChange: "Angular 用 (inputChange) 输出",
      onMouseenter: "Angular 用 (mouseenter) 输出",
      onMouseleave: "Angular 用 (mouseleave) 输出",
      onPaste: "Angular 用 (paste) 输出",
      onRemove: "Angular 用 (remove) 输出",
    },
  };
