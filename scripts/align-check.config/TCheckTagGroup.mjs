

export default {
    upstream: 'tag',
    upstreamInterface: 'TdCheckTagGroupProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      checkedProps: "[D1] 选中态主题固定为 primary+dark+checked（上游默认），不做对象透传",
      uncheckedProps: "[D1] 未选中态主题固定为 default+dark（上游默认），不做对象透传",
      modelValue: "[D2] Angular 用 [(value)] 双向绑定表达 v-model",
      onChange: "Angular 用 (change) 输出，参数 { value, checked, type, current, event? }",
    },
  };
