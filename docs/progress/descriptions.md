# 描述列表 Descriptions · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/descriptions/`
- 文档页：`/descriptions`（`packages/docs/src/app/docs/descriptions/descriptions.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 15 |
| 已对齐 | 14 |
| 覆盖率 | 93.3% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TDescriptionItem`（`<t-descriptions-item>`）

上游接口 `TdDescriptionsItemProps`；上游属性 4、已对齐 3（75.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `label` | DescriptionsContent | undefined | 标签 |
| `content` | DescriptionsContent | undefined | 内容 |
| `span` | number | 1 | 占用的列数 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | [D3] 子项默认插槽用 display:none + textContent 快照，仅支持纯文本，富内容用 [content]="tpl" |

### `TDescriptions`（`<t-descriptions>`）

上游接口 `TdDescriptionsProps`；上游属性 11、已对齐 11（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `bordered` | boolean | false | 是否带边框 |
| `colon` | boolean | true | 是否显示冒号 |
| `column` | number | 2 | 每行列数 |
| `contentStyle` | DescriptionsStyles | undefined | 内容样式 |
| `itemLayout` | DescriptionsItemLayout | horizontal | 描述项的排列方向 |
| `items` | ReadonlyArray<DescriptionItem> \| undefined | undefined | 描述项 |
| `labelStyle` | DescriptionsStyles | undefined | 标签样式 |
| `layout` | DescriptionsLayout | horizontal | 布局方向 |
| `size` | DescriptionsSize | medium | 尺寸 |
| `tableLayout` | DescriptionsTableLayout | fixed | 表格布局 |
| `title` | DescriptionsContent | undefined | 标题 |

## 文档示例

- `packages/docs/src/app/docs/descriptions/demos/descriptions-base.ts`
- `packages/docs/src/app/docs/descriptions/demos/descriptions-bordered.ts`
- `packages/docs/src/app/docs/descriptions/demos/descriptions-layout.ts`
