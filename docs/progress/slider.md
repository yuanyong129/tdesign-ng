# 滑块 Slider · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/slider/`
- 文档页：`/slider`（`packages/docs/src/app/docs/slider/slider.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 16 |
| 已对齐 | 11 |
| 覆盖率 | 68.8% |
| 深度债 | 2（D1 0 / D2 0 / D3 2） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TSlider`（`<t-slider>`）

上游接口 `TdSliderProps`；上游属性 16、已对齐 11（68.8%）；深度债 2 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | SliderValue \| undefined | undefined | 滑块值，受控用法 |
| `defaultValue` | SliderValue | 0 | 默认滑块值 |
| `min` | number | 0 | 最小值 |
| `max` | number | 100 | 最大值 |
| `step` | number | 1 | 步长 |
| `range` | boolean | false | 是否双滑块（区间选择） |
| `disabled` | boolean | false | 是否禁用 |
| `layout` | SliderLayout | 'horizontal' | 布局方向 |
| `label` | string \| boolean \| undefined | undefined | 滑块提示文案 |
| `showStep` | boolean | false | 是否显示步长刻度点 |
| `marks` | SliderMarks \| undefined | undefined | 刻度标记 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | SliderValue | 值变化时触发 |
| `changeEnd` | SliderValue | 拖动结束或点击轨道时触发 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `inputNumberProps` | D3 其余组件与边角能力 | 滑块两侧的数字输入框在后续版本实现 |
| `modelValue` | Angular 惯用映射 | Angular 用 value 双向绑定 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onChangeEnd` | Angular 惯用映射 | Angular 用 (changeEnd) 输出 |
| `tooltipProps` | D3 其余组件与边角能力 | 滑块提示用内置 t-tooltip，未透传 TooltipProps |

## 文档示例

- `packages/docs/src/app/docs/slider/demos/slider-basic.ts`
- `packages/docs/src/app/docs/slider/demos/slider-marks.ts`
- `packages/docs/src/app/docs/slider/demos/slider-range.ts`
- `packages/docs/src/app/docs/slider/demos/slider-vertical.ts`
