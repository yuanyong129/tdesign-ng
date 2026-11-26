# 分页 Pagination · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/pagination/`
- 文档页：`/pagination`（`packages/docs/src/app/docs/pagination/pagination.component.ts`）
- 状态：⚠️ 有 3 项未登记缺失（需补 align-check 或实现）

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 23 |
| 已对齐 | 16 |
| 覆盖率 | 69.6% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 4（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 3 |
| 文档示例 | 6 个 |

## 组件明细

### `TPagination`（`<t-pagination>`）

上游接口 `TdPaginationProps`；上游属性 23、已对齐 16（69.6%）；深度债 0 项；未登记缺失 3 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `current` | number | 1 | 当前页，用于双向绑定 |
| `total` | number | 0 | 数据总条数 |
| `pageSize` | number | 10 | 每页条数，用于双向绑定 |
| `pageSizeOptions` | PaginationPageSizeOptions | [10, 20, 50] | 每页条数选项 |
| `showPageSize` | boolean | true | 是否显示每页条数选择器 |
| `showJumper` | boolean | false | 是否显示跳转输入框 |
| `totalContent` | string \| boolean | true | 自定义数据统计内容，false 隐藏 |
| `showFirstAndLastPageBtn` | boolean | true | 是否显示首页/末页按钮 |
| `showPreviousAndNextBtn` | boolean | true | 是否显示上一页/下一页按钮 |
| `showPageNumber` | boolean | true | 是否显示页码 |
| `maxPageBtn` | number | 7 | 页码最多显示个数 |
| `foldedMaxPageBtn` | number | 5 | 折叠时省略号两侧的页码个数 |
| `pageEllipsisMode` | PaginationEllipsisMode | 'mid' | 省略号模式 |
| `size` | PaginationSize | 'medium' | 分页尺寸 |
| `theme` | PaginationTheme | 'default' | 分页形态 |
| `disabled` | boolean | false | 是否禁用 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `currentChange` | number | 当前页变化，用于双向绑定 |
| `pageSizeChange` | number | 每页条数变化，用于双向绑定 |
| `change` | PageInfo | 分页变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `modelValue` | Angular 惯用映射 | Angular 用 [current]/[(current)] 与 (currentChange) 表达 v-model 语义 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，携带 PageInfo |
| `onCurrentChange` | Angular 惯用映射 | Angular 用 (currentChange) 输出 |
| `onPageSizeChange` | Angular 惯用映射 | Angular 用 (pageSizeChange) 输出 |
| `defaultCurrent` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TPagination.mjs` 登记原因 |
| `defaultPageSize` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TPagination.mjs` 登记原因 |
| `selectProps` | ⚠️ 未登记 | 尚未实现也未在 `scripts/align-check.config/TPagination.mjs` 登记原因 |

## 文档示例

- `packages/docs/src/app/docs/pagination/demos/pagination-basic.ts`
- `packages/docs/src/app/docs/pagination/demos/pagination-folded.ts`
- `packages/docs/src/app/docs/pagination/demos/pagination-jumper.ts`
- `packages/docs/src/app/docs/pagination/demos/pagination-simple.ts`
- `packages/docs/src/app/docs/pagination/demos/pagination-size.ts`
- `packages/docs/src/app/docs/pagination/demos/pagination-uncontrolled.ts`
