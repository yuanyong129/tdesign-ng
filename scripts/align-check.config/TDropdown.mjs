

export default {
    upstream: 'dropdown',
    upstreamInterface: 'TdDropdownProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      popupProps: '[D2] 未透传 popupProps，弹层可配置项由组件显式 input 暴露',
      onClick: 'Angular 用 (click) 输出，参数 { item, e }',
    },
  };
