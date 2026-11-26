# 侧边悬浮 StickyTool · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/sticky-tool/`
- 文档页：`/sticky-tool`（`packages/docs/src/app/docs/sticky-tool/sticky-tool.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 9 |
| 已对齐 | 6 |
| 覆盖率 | 66.7% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TStickyTool`（`<t-sticky-tool>`）

上游接口 `TdStickyToolProps`；上游属性 9、已对齐 6（66.7%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `list` | StickyToolItem[] | [] | 悬浮项列表 |
| `offset` | Array<string \| number> \| undefined | undefined | 偏移 |
| `placement` | StickyToolPlacement | right-bottom | 停靠位置 |
| `shape` | StickyToolShape | square | 形状 |
| `type` | StickyToolType | normal | 展示形式 |
| `width` | string \| number \| undefined | undefined | 宽度 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `itemClick` | StickyToolItemEvent | 子项点击 |
| `itemHover` | StickyToolItemEvent | 子项悬浮 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onClick` | Angular 惯用映射 | Angular 用 (itemClick) 输出 { e, item } |
| `onHover` | Angular 惯用映射 | Angular 用 (itemHover) 输出 { e, item } |
| `popupProps` | D3 其余组件与边角能力 | [D3] 弹层属性深度透传未实现，当前固定 hideEmptyPopup + 自动 placement |

## 文档示例

- `packages/docs/src/app/docs/sticky-tool/demos/sticky-tool-base.ts`
- `packages/docs/src/app/docs/sticky-tool/demos/sticky-tool-placement.ts`
- `packages/docs/src/app/docs/sticky-tool/demos/sticky-tool-shape.ts`
