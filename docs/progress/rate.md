# 评分 Rate · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/rate/`
- 文档页：`/rate`（`packages/docs/src/app/docs/rate/rate.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 14 |
| 已对齐 | 11 |
| 覆盖率 | 78.6% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TRate`（`<t-rate>`）

上游接口 `TdRateProps`；上游属性 14、已对齐 11（78.6%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `allowHalf` | boolean | false | 是否允许半星评分。 |
| `clearable` | boolean | false | 是否允许再次点击已选中的评分时清空。 |
| `color` | RateColor | '#ED7B2F' | 评分颜色，传数组时第一项为选中色、第二项为未选中色。 |
| `count` | number | 5 | 评分总数。 |
| `disabled` | boolean | false | 是否禁用评分。 |
| `gap` | number | 4 | 图标之间的间距，单位 px。 |
| `showText` | boolean | false | 是否在评分右侧显示文案。 |
| `size` | RateSize | '24px' | 图标尺寸，任意 CSS 长度。 |
| `texts` | string[] | [] | 评分对应的文案，默认使用内置文案（极差 / 失望 / 一般 / 满意 / 惊喜）。 |
| `value` | number \| undefined | undefined | 评分值，受控用法。 |
| `defaultValue` | number | 0 | 默认评分值，非受控用法。 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | RateChangeEvent | 评分变化时触发。 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `icon` | D3 其余组件与边角能力 | 自定义评分图标在后续版本实现，当前固定使用内置星形 |
| `modelValue` | Angular 惯用映射 | Angular 用 value 双向绑定 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |

## 文档示例

- `packages/docs/src/app/docs/rate/demos/rate-basic.ts`
- `packages/docs/src/app/docs/rate/demos/rate-half.ts`
- `packages/docs/src/app/docs/rate/demos/rate-options.ts`
- `packages/docs/src/app/docs/rate/demos/rate-text.ts`
