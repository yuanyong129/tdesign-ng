

export default {
    upstream: 'dropdown',
    upstreamInterface: 'TdDropdownItemProps',
    renames: {},
    angularOnly: ['maxColumnWidth', 'minColumnWidth', 'hasSubmenu'],
    ignoreUpstream: {
      onClick: 'Angular 用 (click) 输出，参数 { value, e }；数据里的 onClick 仍会被调用',
    },
  };
