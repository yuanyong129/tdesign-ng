

export default {
    upstream: 'range-input',
    upstreamInterface: 'TdRangeInputProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      modelValue: "[D3] Angular 用 [(value)] 双向绑定表达 v-model",
      onBlur: "Angular 用 (blur) 输出",
      onChange: "Angular 用 (change) 输出",
      onClear: "Angular 用 (clear) 输出",
      onClick: "Angular 用 (click) 输出（已改名，避免与宿主原生 click 双触发）",
      onEnter: "Angular 用 (enter) 输出",
      onFocus: "Angular 用 (focus) 输出",
      onMouseenter: "[D3] 同时提供 (mouseenter) 输出与宿主原生事件",
      onMouseleave: "[D3] 同时提供 (mouseleave) 输出与宿主原生事件",
    },
  };
