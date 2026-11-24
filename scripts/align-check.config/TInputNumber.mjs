

export default {
    upstream: 'input-number',
    upstreamInterface: 'TdInputNumberProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      inputProps: "[D3] Vue 的 InputProps 任意透传在 Angular 无等价物（inputs 编译期声明）",
      modelValue: "[D3] Angular 用 [(value)] 双向绑定表达 v-model",
      onBlur: "Angular 用 (blur) 输出",
      onChange: "Angular 用 (change) 输出",
      onEnter: "Angular 用 (enter) 输出",
      onFocus: "Angular 用 (focus) 输出",
      onKeydown: "Angular 用 (keydown) 输出",
      onKeypress: "Angular 用 (keypress) 输出",
      onKeyup: "Angular 用 (keyup) 输出",
      onValidate: "Angular 用 (validate) 输出，参数 { error }",
    },
  };
