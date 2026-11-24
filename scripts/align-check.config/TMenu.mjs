

export default {
    upstream: 'menu',
    upstreamInterface: 'TdMenuProps',
    // 上游把 TMenu 与 THeadMenu 拆成两个组件，我们用 mode 合并；事件在 Angular 侧是输出
    renames: { onChange: 'change', onExpand: 'expand' },
    // mode/expandIcon 是合并后的必然产物，collapsedWidth 是折叠态宽度（上游藏在 width 数组里）
    angularOnly: ['mode', 'expandIcon', 'collapsedWidth'],
    ignoreUpstream: {
      onChange: 'Angular 用 (change) 输出，参数 { value }',
      onExpand: 'Angular 用 (expand) 输出，参数 MenuValue[]（同时提供 [(expanded)]）',
    },
  };
