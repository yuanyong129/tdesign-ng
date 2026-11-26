# 文字提示 Tooltip · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/tooltip/`
- 文档页：`/tooltip`（`packages/docs/src/app/docs/tooltip/tooltip.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 6 |
| 已对齐 | 6 |
| 覆盖率 | 100.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 0（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TTooltip`（`<t-tooltip>`）

上游接口 `TdTooltipProps`；上游属性 6、已对齐 6（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | string \| undefined | undefined | 提示内容（纯文本） |
| `placement` | TooltipPlacement | 'top' | 提示出现的位置，mouse 表示跟随鼠标 |
| `theme` | TooltipTheme | 'default' | 提示主题。 |
| `showArrow` | boolean | true | 是否显示箭头 |
| `delay` | number | 0 | 延迟显示的毫秒数 |
| `duration` | number | 0 | 自动消失的毫秒数，0 表示不自动消失 |
| `disabled` | boolean | false | 是否禁用 |
| `destroyOnClose` | boolean | false | 关闭时是否销毁弹层内容 |
| `visible` | boolean \| undefined | undefined | 受控的展开状态 |
| `zIndex` | number \| undefined | undefined | 弹层层级 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `visibleChange` | boolean | 展开状态变化，用于双向绑定 |

## 文档示例

- `packages/docs/src/app/docs/tooltip/demos/tooltip-basic.ts`
- `packages/docs/src/app/docs/tooltip/demos/tooltip-duration.ts`
- `packages/docs/src/app/docs/tooltip/demos/tooltip-placement.ts`
- `packages/docs/src/app/docs/tooltip/demos/tooltip-theme.ts`
