

export default {
    upstream: 'tag',
    upstreamInterface: 'TdCheckTagProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      modelValue: "[D2] Angular 用 [(checked)] 双向绑定表达 v-model",
      default: "Angular 用 <ng-content /> 投影内容，优先于 content",
      onChange: "Angular 用 (change) 输出，参数 { checked, value, event? }",
      onClick: "[D3] 宿主原生 (click) 已可监听，不再提供同名输出避免双触发",
    },
  };
