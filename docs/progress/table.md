# Table 表格 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/table/`
- 文档页：`/table`（`packages/docs/src/app/docs/table/table.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 62 |
| 已对齐 | 45 |
| 覆盖率 | 72.6% |
| 深度债 | 2（D1 1 / D2 1 / D3 0） |
| Angular 惯用映射 | 15（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 23 个 |

## 组件明细

### `TTable`（`<t-table>`）

上游接口 `TdBaseTableProps`；上游属性 62、已对齐 45（72.6%）；深度债 2 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | TableRow[] | [] | 表格数据 |
| `columns` | TableColumn[] | [] | 列配置 |
| `displayColumns` | string[] \| undefined | undefined | 实际显示的列，按 colKey 的顺序渲染；传入后表格只渲染这些列 |
| `defaultDisplayColumns` | string[] \| undefined | undefined | 实际显示的列默认值，非受控场景生效 |
| `rowKey` | string | 'id' | 行唯一标识字段 |
| `bordered` | boolean | false | 是否显示边框 |
| `stripe` | boolean | false | 是否显示斑马纹 |
| `hover` | boolean | true | 鼠标悬停高亮行 |
| `size` | TableSize | 'medium' | 表格尺寸 |
| `verticalAlign` | TableVerticalAlign | 'middle' | 单元格垂直对齐 |
| `tableLayout` | TableLayout | 'fixed' | 表格布局方式 |
| `showHeader` | boolean | true | 是否显示表头 |
| `loading` | boolean | false | 是否显示加载态 |
| `loadingText` | string | '加载。 | 加载提示文字 |
| `empty` | string | '暂无数据' | 空数据提示文案 |
| `height` | string \| number \| undefined | undefined | 表格高度，超出后内部滚动 |
| `maxHeight` | string \| number \| undefined | undefined | 表格最大高度，超出后内部滚动 |
| `sort` | TableSort \| undefined | undefined | 受控排序，传入后表格不再本地排序 |
| `defaultSort` | TableSort \| undefined | undefined | 默认排序，仅初始生效 |
| `multipleSort` | boolean | false | 是否支持多列排序 |
| `filterValue` | TableFilterValue \| undefined | undefined | 受控筛选值，传入后表格不再自己记录筛选状态 |
| `defaultFilterValue` | TableFilterValue \| undefined | undefined | 默认筛选值，仅初始生效 |
| `selectedRowKeys` | Array<string \| number> \| undefined | undefined | 受控的选中行 key，传入后表格不再自己记录选中状态 |
| `defaultSelectedRowKeys` | Array<string \| number> \| undefined | undefined | 默认选中的行 key，仅初始生效 |
| `indeterminateSelectedRowKeys` | Array<string \| number> | [] | 半选状态的行 key，用于表格外部控制半选 |
| `rowSelectionAllowUncheck` | boolean | false | 单选时是否允许再次点击取消选中 |
| `rowSelectionType` | TableRowSelectionType \| undefined | undefined | 行选择器类型，覆盖列上 type 的渲染 |
| `selectOnRowClick` | boolean | false | 点击行时选中该行 |
| `expandedRowKeys` | Array<string \| number> \| undefined | undefined | 受控的展开行 key，传入后表格不再自己记录展开状态 |
| `defaultExpandedRowKeys` | Array<string \| number> \| undefined | undefined | 默认展开的行 key，仅初始生效 |
| `expandOnRowClick` | boolean | false | 点击行时展开 / 收起该行 |
| `expandIcon` | boolean | true | 是否显示展开图标列 |
| `expandedRow` | TableExpandedRowContent \| undefined | undefined | 展开行内容，支持字符串与模板；传函数时按行返回内容 |
| `pagination` | TablePagination \| undefined | undefined | 分页配置，传入后表格底部显示分页；数据超过一页且未开启 disableDataPage 时自动本地分页。 |
| `reserveSelectedRowOnPaginate` | boolean | true | 翻页时是否保留已选中的行 |
| `disableDataPage` | boolean | false | 关闭本地分页，只显示分页器并把翻页事件交给使用方（服务端分页。 |
| `rowspanAndColspan` | ((params: TableRowspanParams) => TableRowspan \| undefined) \| undefined | undefined | 合并单元格回调，返回 `{ rowspan, colspan }` 与相邻单元格合并 |
| `scroll` | TableScroll \| undefined | undefined | 虚拟滚动配置，`type: 'virtual'` 且行数超过 `threshold` 时只渲染可视区域的行 |
| `resizable` | boolean | false | 是否允许拖拽表头调整列宽，单列可以用 `resizable: false` 关闭 |
| `activeRowKeys` | Array<string \| number> \| undefined | undefined | 受控的高亮行 key，传入后表格不再自己记录高亮行 |
| `defaultActiveRowKeys` | Array<string \| number> \| undefined | undefined | 默认高亮行 key，仅初始生效 |
| `activeRowType` | TableActiveRowType \| undefined | undefined | 键盘操作的高亮模式，`single` 单行、`multiple` 多行 |
| `disableSpaceInactiveRow` | boolean | false | 空格键是否禁用取消高亮行 |
| `keyboardRowHover` | boolean | false | 键盘移动时是否显示行悬停高亮 |
| `topContent` | Content | undefined | 表格顶部内容，渲染在表格内容之上 |
| `bottomContent` | Content | undefined | 表格底部内容，渲染在分页之上 |
| `firstFullRow` | Content | undefined | 表头下方的整行内容 |
| `lastFullRow` | Content | undefined | 表尾上方的整行内容 |
| `cellEmptyContent` | TableCellEmptyContent | undefined | 单元格内容为空时的占位，支持回调按单元格取值 |
| `footData` | TableRow[] | [] | 表尾数据，渲染在 `tfoot` 里 |
| `footerSummary` | Content | undefined | 表尾整行总结内容，与 `footData` 二选一 |
| `rowspanAndColspanInFooter` | ((params: TableRowspanParams) => TableRowspan \| undefined) \| undefined | undefined | 表尾单元格合并回调 |
| `fixedRows` | number[] | [] | 固定行数，`[顶部固定行数, 底部固定行数]`，固定行不随内容滚动 |
| `rowAttributes` | TableRowAttributes \| undefined | undefined | 行属性，支持对象、回调或它们的数组，`class` / `style` 会被合并 |
| `rowClassName` | TableRowClassName \| undefined | undefined | 行类名，支持字符串、回调、按行下标或行 key 取值的映射、以及它们的数组 |
| `tableContentWidth` | string \| number \| undefined | undefined | 表格内容宽度，超过容器宽度时出现横向滚动条 |
| `loadingProps` | TableLoadingProps \| undefined | undefined | 加载状态配置，可覆盖文案、图标与遮罩 |
| `locale` | TableLocale \| undefined | undefined | 语言配置，传入的字段优先于同名属性（如 `empty`、`loadingText`、`size`） |
| `headerAffixedTop` | boolean \| TableAffixProps | false | 表头吸顶，表格滚出可视区后表头固定在容器顶部；传对象可配置 `offsetTop` / `zIndex` / `container` |
| `headerAffixProps` | TableAffixProps \| undefined | undefined | 表头吸顶的附加配置，优先于 `headerAffixedTop` 里的对象 |
| `footerAffixedBottom` | boolean \| TableAffixProps | false | 表尾吸底，表格滚出可视区后表尾固定在容器底部 |
| `footerAffixProps` | TableAffixProps \| undefined | undefined | 表尾吸底的附加配置，优先于 `footerAffixedBottom` 里的对象 |
| `paginationAffixedBottom` | boolean \| TableAffixProps \| undefined | undefined | 分页吸底，分页器滚出可视区后固定在容器底部 |
| `horizontalScrollAffixedBottom` | boolean \| TableAffixProps \| undefined | undefined | 横向滚动条吸底，表格较宽时在容器底部固定一条横向滚动条 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `sortChange` | TableSort \| undefined | 排序变化 |
| `filterChange` | TableFilterChangeEvent | 筛选变化，表格本身不改变数据，需要在使用方自行过滤 |
| `selectChange` | TableSelectChangeEvent | 选中行变化 |
| `expandChange` | TableExpandChangeEvent | 展开行变化 |
| `pageChange` | TablePageChangeEvent | 分页变化，携带新一页的数据 |
| `columnResizeChange` | TableColumnResizeEvent | 列宽拖拽结束，携带拖拽后的列宽 |
| `activeChange` | TableActiveChangeEvent | 高亮行变化 |
| `activeRowAction` | TableActiveRowActionEvent | 键盘操作高亮行时的动作 |
| `rowClick` | TableRowEventContext | 点击行 |
| `rowDblclick` | TableRowEventContext | 双击行 |
| `rowMousedown` | TableRowEventContext | 行内按下鼠标 |
| `rowMouseup` | TableRowEventContext | 行内松开鼠标 |
| `rowMouseenter` | TableRowEventContext | 鼠标进入行 |
| `rowMouseleave` | TableRowEventContext | 鼠标离开行 |
| `rowMouseover` | TableRowEventContext | 鼠标在行内移动 |
| `cellClick` | TableCellClickEvent | 点击单元格 |
| `scrollChange` | TableScrollEvent | 表格滚动 |
| `scrollXChange` | TableScrollEvent | 表格横向滚动 |
| `scrollYChange` | TableScrollEvent | 表格纵向滚动 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `attach` | D2 录入与反馈线 | [D2] 挂载点需要 TPopup / TLoading 支持 attach 才能透传，当前两者都没有该能力 |
| `lazyLoad` | D1 表格与选择线 | [D1] 虚拟滚动已按可视区渲染，懒加载需要行高观测与占位占高，暂未实现 |
| `onActiveChange` | Angular 惯用映射 | Angular 用 (activeChange) 输出 |
| `onActiveRowAction` | Angular 惯用映射 | Angular 用 (activeRowAction) 输出 |
| `onCellClick` | Angular 惯用映射 | Angular 用 (cellClick) 输出 |
| `onColumnResizeChange` | Angular 惯用映射 | Angular 用 (columnResizeChange) 输出 |
| `onPageChange` | Angular 惯用映射 | Angular 用 (pageChange) 输出 |
| `onRowClick` | Angular 惯用映射 | Angular 用 (rowClick) 输出 |
| `onRowDblclick` | Angular 惯用映射 | Angular 用 (rowDblclick) 输出 |
| `onRowMousedown` | Angular 惯用映射 | Angular 用 (rowMousedown) 输出 |
| `onRowMouseenter` | Angular 惯用映射 | Angular 用 (rowMouseenter) 输出 |
| `onRowMouseleave` | Angular 惯用映射 | Angular 用 (rowMouseleave) 输出 |
| `onRowMouseover` | Angular 惯用映射 | Angular 用 (rowMouseover) 输出 |
| `onRowMouseup` | Angular 惯用映射 | Angular 用 (rowMouseup) 输出 |
| `onScroll` | Angular 惯用映射 | Angular 用 (scrollChange) 输出 |
| `onScrollX` | Angular 惯用映射 | Angular 用 (scrollXChange) 输出 |
| `onScrollY` | Angular 惯用映射 | Angular 用 (scrollYChange) 输出 |

## 文档示例

- `packages/docs/src/app/docs/table/demos/table-active-row.ts`
- `packages/docs/src/app/docs/table/demos/table-affix.ts`
- `packages/docs/src/app/docs/table/demos/table-basic.ts`
- `packages/docs/src/app/docs/table/demos/table-cell.ts`
- `packages/docs/src/app/docs/table/demos/table-custom-row.ts`
- `packages/docs/src/app/docs/table/demos/table-display-columns.ts`
- `packages/docs/src/app/docs/table/demos/table-expand-click.ts`
- `packages/docs/src/app/docs/table/demos/table-expand.ts`
- `packages/docs/src/app/docs/table/demos/table-filter.ts`
- `packages/docs/src/app/docs/table/demos/table-fixed.ts`
- `packages/docs/src/app/docs/table/demos/table-footer.ts`
- `packages/docs/src/app/docs/table/demos/table-full-row.ts`
- `packages/docs/src/app/docs/table/demos/table-group-header.ts`
- `packages/docs/src/app/docs/table/demos/table-merge.ts`
- `packages/docs/src/app/docs/table/demos/table-pagination.ts`
- `packages/docs/src/app/docs/table/demos/table-resizable.ts`
- `packages/docs/src/app/docs/table/demos/table-select-click.ts`
- `packages/docs/src/app/docs/table/demos/table-select.ts`
- `packages/docs/src/app/docs/table/demos/table-size.ts`
- `packages/docs/src/app/docs/table/demos/table-sort.ts`
- `packages/docs/src/app/docs/table/demos/table-state.ts`
- `packages/docs/src/app/docs/table/demos/table-style.ts`
- `packages/docs/src/app/docs/table/demos/table-virtual.ts`
