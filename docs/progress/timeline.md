# Timeline 时间轴 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/timeline/`
- 文档页：`/timeline`（`packages/docs/src/app/docs/timeline/timeline.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 12 |
| 已对齐 | 11 |
| 覆盖率 | 91.7% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TTimeline`（`<t-timeline>`）

上游接口 `TdTimelineProps`；上游属性 5、已对齐 5（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `labelAlign` | TimelineLabelAlign | left | 标签位置。横向时间轴只能取 top / bottom，纵向时间轴只能取 left / right，传错时会自动换算 |
| `layout` | TimelineLayout | vertical | 时间轴方向 |
| `mode` | TimelineMode | alternate | 标签与内容的排布模式，alternate 为左右交替，same 为标签与内容同侧 |
| `reverse` | boolean | false | 是否反向排列子项 |
| `theme` | TimelineTheme | default | 主题，dot 把连接线换成虚线 |

### `TTimelineItem`（`<t-timeline-item>`）

上游接口 `TdTimelineItemProps`；上游属性 7、已对齐 6（85.7%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | TimelineItemContent | undefined | 内容，也可以用内容投影传入 |
| `dot` | TimelineItemContent | undefined | 自定义圆点 |
| `dotColor` | string | primary | 圆点颜色，可传主题色（default/primary/success/warning/error）或任意颜色值 |
| `label` | TimelineItemContent | undefined | 标签 |
| `labelAlign` | TimelineItemLabelAlign | undefined | 标签位置，会覆盖父组件的 labelAlign |
| `loading` | boolean | false | 圆点是否为加载态 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `itemClick` | TimelineItemClickEvent | 点击时间轴子项 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onClick` | Angular 惯用映射 | Angular 用 (itemClick) 输出，避开与原生 click 重名 |

## 文档示例

- `packages/docs/src/app/docs/timeline/demos/timeline-base.ts`
- `packages/docs/src/app/docs/timeline/demos/timeline-horizontal.ts`
- `packages/docs/src/app/docs/timeline/demos/timeline-mode.ts`
