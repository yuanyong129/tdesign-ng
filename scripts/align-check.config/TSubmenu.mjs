

export default {
    upstream: 'menu',
    upstreamInterface: 'TdSubmenuProps',
    renames: {},
    // expandIcon：单个子菜单的展开图标覆盖（上游只有 TMenu 级的 expandIcon，这里下放到子项）
    angularOnly: ['expandIcon'],
    ignoreUpstream: {
      content: '[D1] Angular 用 title 或 <ng-content> 投影标题，不再重复 content 入口',
      default: '[D1] Angular 用 <ng-content> 投影子菜单项',
      popupProps: '[D3] t-popup 是离散 inputs 的 Angular 组件，无类型安全透传通道；菜单语境下 placement/delay/showArrow 已内置',
    },
  };
