# 统计数值 Statistic · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/statistic/`
- 文档页：`/statistic`（`packages/docs/src/app/docs/statistic/statistic.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 15 |
| 已对齐 | 13 |
| 覆盖率 | 86.7% |
| 深度债 | 2（D1 0 / D2 0 / D3 2） |
| Angular 惯用映射 | 0（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TStatistic`（`<t-statistic>`）

上游接口 `TdStatisticProps`；上游属性 15、已对齐 13（86.7%）；深度债 2 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `color` | string | '' | 颜色，可传预设值（black/blue/red/orange/green）或任意颜色值 |
| `decimalPlaces` | number \| undefined | undefined | 数值的小数位数，不传时至少 0 位、最多保留 20 位 |
| `extra` | StatisticContent | undefined | 额外说明，显示在数值下方 |
| `format` | ((value: number) => number) \| undefined | undefined | 自定义格式化函数，传入后覆盖 decimalPlaces 与 separator 的处理 |
| `loading` | boolean | false | 是否加载中，加载时显示骨架屏 |
| `prefix` | StatisticContent | undefined | 数值前缀 |
| `separator` | string | , | 千分位分隔符，传空字符串可关闭分组 |
| `suffix` | StatisticContent | undefined | 数值后缀 |
| `title` | StatisticContent | undefined | 标题 |
| `trend` | StatisticTrend | undefined | 趋势，会渲染上 / 下箭头 |
| `trendPlacement` | StatisticTrendPlacement | left | 趋势图标的位置，prefix / suffix 有内容时以它们为准 |
| `unit` | StatisticContent | undefined | 数值单位 |
| `value` | number | undefined | 数值 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `animation` | D3 其余组件与边角能力 | [D3] 数值滚动动画需要 rAF tween 基础设施 |
| `animationStart` | D3 其余组件与边角能力 | [D3] 同上，并依赖组件实例方法 start() |

## 文档示例

- `packages/docs/src/app/docs/statistic/demos/statistic-base.ts`
- `packages/docs/src/app/docs/statistic/demos/statistic-precision.ts`
- `packages/docs/src/app/docs/statistic/demos/statistic-trend.ts`
