export default {
  upstream: 'table',
  upstreamInterface: 'TdBaseTableProps',
  // 上游 allowResizeColumnWidth 与我们的 resizable 是同一个开关
  renames: { allowResizeColumnWidth: 'resizable' },
  // loadingText 是 Angular 侧的独立文字属性，上游是 loading 的 TNode；
  // sort / defaultSort / filterValue / defaultFilterValue 来自上游 TdPrimaryTableProps（本处对比的是 TdBaseTableProps）；
  // 行选择与展开行的输入同样来自 TdPrimaryTableProps，事件用 (selectChange) / (expandChange) 输出；
  // pagination / disableDataPage 是 TdBaseTableProps 上的属性，已实现，不再列入忽略。
  angularOnly: [
    'loadingText',
    'sort',
    'defaultSort',
    'multipleSort',
    'filterValue',
    'defaultFilterValue',
    'selectedRowKeys',
    'defaultSelectedRowKeys',
    'indeterminateSelectedRowKeys',
    'rowSelectionAllowUncheck',
    'selectOnRowClick',
    'expandedRowKeys',
    'defaultExpandedRowKeys',
    'expandOnRowClick',
    'expandIcon',
  ],
  ignoreUpstream: {
    // 吸顶吸底一族：需要先接 TAffix 并测量固定区域高度，当前版本未实现
    'attach': '[D1] 吸顶表头 / 吸底表尾 / 加载遮罩的挂载点，等 TAffix 接入后再透传',
    'headerAffixedTop': '[D1] 表头吸顶未实现，需要 TAffix + 表头高度测量',
    'headerAffixProps': '[D1] 表头吸顶未实现，AffixProps 待吸顶落地后透传',
    'footerAffixedBottom': '[D1] 表尾吸底未实现，需要 TAffix + 表尾高度测量',
    'footerAffixProps': '[D1] 表尾吸底未实现，AffixProps 待吸底落地后透传',
    'paginationAffixedBottom': '[D1] 分页吸底未实现，等 TAffix 接入后再做',
    'horizontalScrollAffixedBottom': '[D1] 横向滚动条吸底未实现，需要自绘滚动条容器',
    'lazyLoad': '[D1] 虚拟滚动已按可视区渲染，懒加载需要行高观测与占位占高，暂未实现',
    // 事件：Angular 侧一律用 outputs 表达，不用 Vue 的 onXxx 输入
    'onActiveChange': 'Angular 用 (activeChange) 输出',
    'onActiveRowAction': 'Angular 用 (activeRowAction) 输出',
    'onCellClick': 'Angular 用 (cellClick) 输出',
    'onColumnResizeChange': 'Angular 用 (columnResizeChange) 输出',
    'onPageChange': 'Angular 用 (pageChange) 输出',
    'onRowClick': 'Angular 用 (rowClick) 输出',
    'onRowDblclick': 'Angular 用 (rowDblclick) 输出',
    'onRowMousedown': 'Angular 用 (rowMousedown) 输出',
    'onRowMouseenter': 'Angular 用 (rowMouseenter) 输出',
    'onRowMouseleave': 'Angular 用 (rowMouseleave) 输出',
    'onRowMouseover': 'Angular 用 (rowMouseover) 输出',
    'onRowMouseup': 'Angular 用 (rowMouseup) 输出',
    'onSortChange': 'Angular 用 (sortChange) 输出',
    'onFilterChange': 'Angular 用 (filterChange) 输出',
    'onScroll': 'Angular 用 (scrollChange) 输出',
    'onScrollX': 'Angular 用 (scrollXChange) 输出',
    'onScrollY': 'Angular 用 (scrollYChange) 输出',
  },
};
