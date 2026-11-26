# 穿梭框 Transfer · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/transfer/`
- 文档页：`/transfer`（`packages/docs/src/app/docs/transfer/transfer.component.ts`）
- 状态：🚧 有深度债 10 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 26 |
| 已对齐 | 16 |
| 覆盖率 | 61.5% |
| 深度债 | 10（D1 4 / D2 4 / D3 2） |
| Angular 惯用映射 | 0（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TTransfer`（`<t-transfer>`）

上游接口 `TdTransferProps`；上游属性 26、已对齐 16（61.5%）；深度债 10 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | TransferItem[] | [] | 数据源 |
| `targetValue` | TransferValue[] \| undefined | undefined | 目标列表的值，受控；配合 `targetValueChange` 支持双向绑定 |
| `defaultTargetValue` | TransferValue[] | [] | 目标列表的初始值，非受控 |
| `targetSort` | TransferTargetSort | 'original' | 移到右侧后新值的排序策略 |
| `direction` | TransferDirection | 'both' | 操作方向限制，`left` 只能左移、`right` 只能右移 |
| `disabled` | TransferSideOption<boolean> | false | 是否禁用，传数组时依次作用于左右列表 |
| `checked` | TransferValue[] \| undefined | undefined | 两侧合并的勾选值，受控 |
| `defaultChecked` | TransferValue[] | [] | 勾选值的初始值，非受控 |
| `sourceChecked` | TransferValue[] \| undefined | undefined | 左侧勾选值，受控；优先于 `checked` |
| `targetChecked` | TransferValue[] \| undefined | undefined | 右侧勾选值，受控；优先于 `checked` |
| `search` | TransferSideOption<boolean> | false | 是否开启两侧搜索框，传数组时按侧开启 |
| `filter` | TransferFilter \| undefined | undefined | 自定义搜索过滤函数 |
| `searchPlaceholder` | string \| string[] \| undefined | '' | 搜索框占位文字，传数组时按侧设置 |
| `title` | TransferListContent[] | [] | 左右列表标题，依次为左侧、右侧 |
| `footer` | TransferListContent[] | [] | 左右列表底部内容，依次为左侧、右侧 |
| `empty` | TransferListContent[] | [] | 左右列表空态内容，依次为左侧、右侧 |
| `operation` | string \| string[] | [] | 中间操作按钮文字，传数组时依次为左移、右移按钮 |
| `transferItem` | TemplateRef<TransferItemContext> \| undefined | undefined | 自定义列表项内容 |
| `showCheckAll` | TransferSideOption<boolean> | true | 是否展示列表头部的全选开关，传数组时按侧设置 |
| `height` | string \| number \| undefined | undefined | 列表高度，数字按 `px` 处理 |
| `oneWay` | boolean | false | 是否只允许从左向右单向移动 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | TransferChangeEvent | 移动事件，携带移动前后的状态 |
| `targetValueChange` | TransferValue[] | 目标值变化事件，用于双向绑定 |
| `checkedChange` | TransferCheckedChangeEvent | 勾选变化事件 |
| `sourceCheckedChange` | TransferValue[] | 左侧勾选变化事件 |
| `targetCheckedChange` | TransferValue[] | 右侧勾选变化事件 |
| `search` | TransferSearchEvent | 搜索事件 |
| `scroll` | TransferScrollEvent | 列表滚动事件 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `checkboxProps` | D2 录入与反馈线 | [D2] 逐项 Checkbox 属性透传需中间层，第一层固定默认（checked/indeterminate/disabled 已覆盖主要语义） |
| `keys` | D2 录入与反馈线 | [D2] 字段名固定为 label/value/disabled，自定义 key 映射后置 |
| `onChange` | D1 表格与选择线 | [D1] Angular 用 (change) 输出，参数 { value, movedKeys, source, target, data } |
| `onCheckedChange` | D1 表格与选择线 | [D1] Angular 用 (checkedChange) 输出，参数 { checked, sourceChecked, targetChecked, type } |
| `onPageChange` | D1 表格与选择线 | [D1] 依赖 pagination，随分页一起后置 |
| `onScroll` | D3 其余组件与边角能力 | [D3] Angular 用 (scroll) 输出，参数 { e, bottomDistance, type } |
| `onSearch` | D3 其余组件与边角能力 | [D3] Angular 用 (search) 输出，参数 { query, type, trigger, e } |
| `pagination` | D1 表格与选择线 | [D1] 列表内分页需接 t-pagination 与页码状态，属第二层 |
| `targetDraggable` | D2 录入与反馈线 | [D2] 拖拽排序依赖拖拽基础设施，后置 |
| `tree` | D2 录入与反馈线 | [D2] 树形穿梭依赖 tree 与展开计数，后置 |

## 文档示例

- `packages/docs/src/app/docs/transfer/demos/transfer-base.ts`
- `packages/docs/src/app/docs/transfer/demos/transfer-disabled.ts`
- `packages/docs/src/app/docs/transfer/demos/transfer-search.ts`
