# 选项卡 Tabs · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/tabs/`
- 文档页：`/tabs`（`packages/docs/src/app/docs/tabs/tabs.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 16 |
| 已对齐 | 10 |
| 覆盖率 | 62.5% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 7 个 |

## 组件明细

### `TTabs`（`<t-tabs>`）

上游接口 `TdTabsProps`；上游属性 16、已对齐 10（62.5%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `theme` | TabsTheme | 'normal' | 选项卡主题 |
| `placement` | TabsPlacement | 'top' | 选项卡位置 |
| `size` | TabsSize | 'medium' | 选项卡尺寸 |
| `disabled` | boolean | false | 是否禁用全部选项卡 |
| `addable` | boolean | false | 是否显示新增按钮 |
| `dragSort` | boolean | false | 是否开启拖拽排序，排序结果由 (dragSortChange) 抛给使用方 |
| `scrollPosition` | TabsScrollPosition | 'auto' | 激活选项卡滚入可视区时的对齐方式 |
| `value` | TabValue \| undefined | undefined | 当前激活的选项卡值，受控时以它为准 |
| `defaultValue` | TabValue | '' | 默认激活的选项卡值 |
| `action` | Content | undefined | 导航栏右侧的操作内容，支持字符串或模板 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | TabValue | 激活选项卡变化时触发 |
| `add` | TabsAddEvent | 点击新增按钮时触发 |
| `remove` | TabsRemoveEvent | 点击页签关闭按钮时触发 |
| `dragSortChange` | TabsDragSortEvent | 拖拽排序时触发，使用方按 payload 重排自己的面板数据 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `list` | D3 其余组件与边角能力 | 数据驱动面板未实现，用 t-tab-panel 投影 |
| `modelValue` | Angular 惯用映射 | Angular 用 value（受控）/ defaultValue |
| `onAdd` | Angular 惯用映射 | Angular 用 (add) 输出，payload { e } |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onDragSort` | Angular 惯用映射 | Angular 用 (dragSortChange) 输出 |
| `onRemove` | Angular 惯用映射 | Angular 用 (remove) 输出，payload { value, index, e } |

## 文档示例

- `packages/docs/src/app/docs/tabs/demos/tabs-action.ts`
- `packages/docs/src/app/docs/tabs/demos/tabs-add-remove.ts`
- `packages/docs/src/app/docs/tabs/demos/tabs-basic.ts`
- `packages/docs/src/app/docs/tabs/demos/tabs-card.ts`
- `packages/docs/src/app/docs/tabs/demos/tabs-drag-sort.ts`
- `packages/docs/src/app/docs/tabs/demos/tabs-lazy.ts`
- `packages/docs/src/app/docs/tabs/demos/tabs-placement.ts`
