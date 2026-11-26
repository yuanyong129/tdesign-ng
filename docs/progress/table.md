# 表格 Table · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/table/`
- 文档页：`/table`（`packages/docs/src/app/docs/table/table.component.ts`）
- 状态：⚠️ 有 19 项未登记缺失（需补 align-check 或实现）

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 62 |
| 已对齐 | 20 |
| 覆盖率 | 32.3% |
| 深度债 | 8（D1 8 / D2 0 / D3 0） |
| Angular 惯用映射 | 15（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 19 |
| 文档示例 | 21 个 |

## 组件明细

### `TTable`（`<t-table>`）

上游接口 `TdBaseTableProps`；上游属性 62、已对齐 20（32.3%）；深度债 8 项；未登记缺失 19 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | TableRow[] | [] | 表格数据 |
| `columns` | TableColumn[] | [] | 列配置 |
| `rowKey` | string | 'id' | 行唯一标识字段名 |
| `bordered` | boolean | false | 是否显示边框 |
| `stripe` | boolean | false | 是否显示斑马纹 |
| `hover` | boolean | true | 鼠标悬停高亮行 |
| `size` | TableSize | 'medium' | 表格尺寸 |
| `verticalAlign` | TableVerticalAlign | 'middle' | 单元格垂直对齐 |
| `tableLayout` | TableLayout | 'fixed' | 表格布局方式 |
| `showHeader` | boolean | true | 是否显示表头 |
| `loading` | boolean | false | 是否显示加载中 |
| `loadingText` | string | '加载中' | 加载提示文字 |
| `empty` | string | '暂无数据' | 空数据提示文字 |
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
| `selectOnRowClick` | boolean | false | 点击行时选中该行 |
| `expandedRowKeys` | Array<string \| number> \| undefined | undefined | 受控的展开行 key，传入后表格不再自己记录展开状态 |
| `defaultExpandedRowKeys` | Array<string \| number> \| undefined | undefined | 默认展开的行 key，仅初始生效 |
| `expandOnRowClick` | boolean | false | 点击行时展开 / 收起该行 |
| `expandIcon` | boolean | true | 是否显示展开图标列 |
| `pagination` | TablePagination \| undefined | undefined | 分页配置，传入后表格底部显示分页；数据超过一页且未开启 disableDataPage 时自动本地分页 |
| `disableDataPage` | boolean | false | 关闭本地分页，只显示分页器并把翻页事件交给使用方（服务端分页） |
| `rowspanAndColspan` | ((params: TableRowspanParams) => TableRowspan \| undefined) \| undefined | undefined | 合并单元格回调，返回 `{ rowspan, colspan }` 与相邻单元格合并 |
| `scroll` | TableScroll \| undefined | undefined | 虚拟滚动配置，`type: 'virtual'` 且行数超过 `threshold` 时只渲染可视区域的行 |
| `resizable` | boolean | false | 是否允许拖拽表头调整列宽，单列可以用 `resizable: false` 关闭 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `sortChange` | TableSort \| undefined | 排序变化 |
| `filterChange` | TableFilterChangeEvent | 筛选变化，表格本身不改变数据，需要在使用方自行过滤 |
| `selectChange` | TableSelectChangeEvent | 选中行变化 |
| `expandChange` | TableExpandChangeEvent | 展开行变化 |
| `pageChange` | TablePageChangeEvent | 分页变化，携带新一页的数据 |
| `columnResizeChange` | TableColumnResizeEvent | 列宽拖拽结束，携带拖拽后的列宽 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `attach` | D1 表格与选择线 | [D1] 吸顶表头 / 吸底表尾 / 加载遮罩的挂载点，等 TAffix 接入后再透传 |
| `footerAffixedBottom` | D1 表格与选择线 | [D1] 表尾吸底未实现，需要 TAffix + 表尾高度测量 |
| `footerAffixProps` | D1 表格与选择线 | [D1] 表尾吸底未实现，AffixProps 待吸底落地后透传 |
| `headerAffixedTop` | D1 表格与选择线 | [D1] 表头吸顶未实现，需要 TAffix + 表头高度测量 |
| `headerAffixProps` | D1 表格与选择线 | [D1] 表头吸顶未实现，AffixProps 待吸顶落地后透传 |
| `horizontalScrollAffixedBottom` | D1 表格与选择线 | [D1] 横向滚动条吸底未实现，需要自绘滚动条容器 |
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
| `paginationAffixedBottom` | D1 表格与选择线 | [D1] 分页吸底未实现，等 TAffix 接入后再做 |
| `activeRowKeys` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `defaultActiveRowKeys` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `activeRowType` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `bottomContent` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `cellEmptyContent` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `disableSpaceInactiveRow` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `firstFullRow` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `fixedRows` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `footData` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `footerSummary` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `keyboardRowHover` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `lastFullRow` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `loadingProps` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `locale` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `rowAttributes` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `rowClassName` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `rowspanAndColspanInFooter` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `tableContentWidth` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |
| `topContent` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TTable.mjs` 登记原因 |

## 文档示例

- `packages/docs/src/app/docs/table/demos/table-active-row.ts`
- `packages/docs/src/app/docs/table/demos/table-basic.ts`
- `packages/docs/src/app/docs/table/demos/table-cell.ts`
- `packages/docs/src/app/docs/table/demos/table-custom-row.ts`
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
