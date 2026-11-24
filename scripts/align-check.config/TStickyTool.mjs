

export default {
    upstream: 'sticky-tool',
    upstreamInterface: 'TdStickyToolProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      onClick: 'Angular 用 (itemClick) 输出 { e, item }',
      onHover: 'Angular 用 (itemHover) 输出 { e, item }',
      popupProps: '[D3] 弹层属性深度透传未实现，当前固定 hideEmptyPopup + 自动 placement',
    },
  };
