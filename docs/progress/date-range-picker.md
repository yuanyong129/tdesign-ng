# DateRangePicker 日期范围 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/date-range-picker/`
- 文档页：`/date-range-picker`（`packages/docs/src/app/docs/date-range-picker/date-range-picker.component.ts`）
- 状态：🚧 有深度债 18 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 44 |
| 已对齐 | 23 |
| 覆盖率 | 52.3% |
| 深度债 | 18（D1 18 / D2 0 / D3 0） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TDateRangePicker`（`<t-date-range-picker>`）

上游接口 `TdDateRangePickerProps`；上游属性 44、已对齐 23（52.3%）；深度债 18 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | DateRangeValue \| undefined | undefined | 选中的范围，受控用法。 |
| `defaultValue` | DateRangeValue \| undefined | undefined | 默认选中的范围，非受控用法。 |
| `valueType` | DatePickerValueType \| undefined | 'YYYY-MM-DD' | 回传值的格式：格式串 / time-stamp / Date。 |
| `format` | string \| undefined | undefined | 输入框显示的日期格式，默认与 valueType 一致。 |
| `firstDayOfWeek` | number | 1 | 一周的起始日，0 为周日。 |
| `disableDate` | DisableDate \| undefined | undefined | 禁用日期，支持日期数组、范围对象与判断函数。 |
| `clearable` | boolean | false | 是否可清空。 |
| `disabled` | boolean | false | 是否禁用。 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 输入框尺寸。 |
| `placeholder` | string \| [string, string] | ['开始日期', '结束日期'] | 两个输入框的占位文案。 |
| `presets` | PresetDateRange \| undefined | undefined | 预设范围：键为按钮文案，值为范围或返回范围的函数。 |
| `presetsPlacement` | PresetsPlacement | 'bottom' | 预设范围的摆放位置。 |
| `allowInput` | boolean | false | 是否允许在输入框里直接输入日期（Enter / 失焦提交）。 |
| `separator` | string | '-' | 两个输入框之间的分隔符。 |
| `range` | DateValue[] \| Array<DateValue[]> \| ((date: DateValue) => boolean) \| undefined | undefined | 限制可选的日期范围：日期区间数组 / 区间数组的数组 / 判断函数。 |
| `label` | string \| undefined | undefined | 前置标签文案。 |
| `tips` | string \| undefined | undefined | 提示文案。 |
| `status` | 'default' \| 'success' \| 'warning' \| 'error' | 'default' | 校验状态。 |
| `borderless` | boolean | false | 无边框模式。 |
| `readonly` | boolean | false | 只读状态（不可编辑、不可展开面板）。 |
| `enableTimePicker` | boolean | false | 是否允许选择时间（面板只展示一侧日期 + 时间列）。 |
| `defaultTime` | string[] | ['00:00:00', '23:59:59'] | 未指定时间时开始 / 结束使用的默认时间。 |
| `needConfirm` | boolean | true | 是否点「确定」后才提交（开启时间选择时生效）。 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | DateRangePickerChangeEvent | 选中范围变化 |
| `visibleChange` | boolean | 弹层显隐变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `cancelRangeSelectLimit` | D1 表格与选择线 | 范围选择上限在后续版本实现 |
| `cell` | D1 表格与选择线 | 自定义单元格在后续版本实现 |
| `disableTime` | D1 表格与选择线 | 时间选择在后续版本实现 |
| `mode` | D1 表格与选择线 | 年份/月份模式在后续版本实现 |
| `modelValue` | Angular 惯用映射 | Angular 用 value 双向绑定 |
| `onBlur` | D1 表格与选择线 | 失焦事件在后续版本实现 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onConfirm` | D1 表格与选择线 | 需确认在后续版本实现 |
| `onFocus` | D1 表格与选择线 | 聚焦事件在后续版本实现 |
| `onInput` | D1 表格与选择线 | 手输已包含在 (change) 的 trigger="enter" 里 |
| `onMonthChange` | D1 表格与选择线 | 年月变化事件暂未暴露 |
| `onPick` | D1 表格与选择线 | 选中已包含在 (change) 的 trigger="pick" 里 |
| `onPresetClick` | D1 表格与选择线 | 预设已包含在 (change) 的 trigger="preset" 里 |
| `onYearChange` | D1 表格与选择线 | 年月变化事件暂未暴露 |
| `panelActiveDate` | D1 表格与选择线 | 面板初始年月在后续版本实现 |
| `panelPreselection` | D1 表格与选择线 | 面板预选在后续版本实现 |
| `popupProps` | D1 表格与选择线 | 透传 PopupProps 在后续版本实现 |
| `prefixIcon` | Angular 惯用映射 | Angular 用 <t-icon tDateRangePickerPrefixIcon> 投影 |
| `rangeInputProps` | D1 表格与选择线 | 透传 RangeInputProps 在后续版本实现 |
| `suffixIcon` | D1 表格与选择线 | 默认日历图标，未支持替换 |
| `timePickerProps` | D1 表格与选择线 | 时间面板透传在后续版本实现 |

## 文档示例

- `packages/docs/src/app/docs/date-range-picker/demos/date-range-picker-basic.ts`
- `packages/docs/src/app/docs/date-range-picker/demos/date-range-picker-options.ts`
- `packages/docs/src/app/docs/date-range-picker/demos/date-range-picker-presets.ts`
- `packages/docs/src/app/docs/date-range-picker/demos/date-range-picker-state.ts`
- `packages/docs/src/app/docs/date-range-picker/demos/date-range-picker-time.ts`
