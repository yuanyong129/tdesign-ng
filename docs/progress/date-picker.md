# 日期选择 DatePicker · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/date-picker/`
- 文档页：`/date-picker`（`packages/docs/src/app/docs/date-picker/date-picker.component.ts`）
- 状态：🚧 有深度债 19 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 44 |
| 已对齐 | 22 |
| 覆盖率 | 50.0% |
| 深度债 | 19（D1 19 / D2 0 / D3 0） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 11 个 |

## 组件明细

### `TDatePicker`（`<t-date-picker>`）

上游接口 `TdDatePickerProps`；上游属性 44、已对齐 22（50.0%）；深度债 19 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | DatePickerValue \| undefined | undefined | 选中的日期，受控用法。 |
| `defaultValue` | DatePickerValue \| undefined | undefined | 默认选中的日期，非受控用法。 |
| `valueType` | DatePickerValueType \| undefined | undefined | 回传值的格式：格式串 / time-stamp / Date；不传时按是否带时间推导。 |
| `mode` | DatePickerMode | 'date' | 选择器模式：日期 / 周 / 月份 / 季度 / 年份。 |
| `multiple` | boolean | false | 是否多选：开启后值为数组，输入框以标签展示，点击日期可切换选中。 |
| `format` | string \| undefined | undefined | 输入框里显示的日期格式，默认与 valueType 一致。 |
| `firstDayOfWeek` | number | 1 | 周一作为一周的第一天（0 为周日）。 |
| `disableDate` | DisableDate \| undefined | undefined | 禁用日期：精确日期数组、范围对象或判断函数。 |
| `range` | DatePickerRange \| undefined | undefined | 可选范围：`[start, end]` 数组窗口，或返回是否可选的判断函数。 |
| `clearable` | boolean | false | 是否可清空。 |
| `disabled` | boolean | false | 是否禁用。 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 输入框尺寸。 |
| `placeholder` | string | '请选择日期' | 占位文案。 |
| `presets` | PresetDate \| undefined | undefined | 预设日期：键为按钮文案，值为日期或返回日期的函数。 |
| `presetsPlacement` | PresetsPlacement | 'bottom' | 预设日期的摆放位置。 |
| `panelActiveDate` | PanelActiveDate \| undefined | undefined | 没有选中值时，面板初始显示的年月。 |
| `allowInput` | boolean | false | 是否允许在输入框里直接输入日期（按 Enter 或失焦提交）。 |
| `enableTimePicker` | boolean | false | 是否允许选择时间（面板右侧出现时 / 分 / 秒列）。 |
| `defaultTime` | string | '00:00:00' | 打开面板时未指定时间时使用的默认时间。 |
| `needConfirm` | boolean | true | 是否点「确定」后才提交（开启时间选择时生效）。 |
| `cell` | DatePickerCellRender \| undefined | undefined | 自定义面板单元格文案：回调收到该格的日期值，返回要显示的字符串。 |
| `valueDisplay` | DatePickerValueDisplay \| undefined | undefined | 自定义输入框回显：回调收到当前值与默认回显文本，返回要显示的字符串。 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | DatePickerChangeEvent | 选中值变化 |
| `visibleChange` | boolean | 弹层显隐变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `borderless` | D1 表格与选择线 | 无边框模式在后续版本实现 |
| `disableTime` | D1 表格与选择线 | 时间选择的禁用候选在后续版本实现 |
| `inputProps` | D1 表格与选择线 | 透传 InputProps 在后续版本实现 |
| `label` | D1 表格与选择线 | 标签文案在后续版本实现 |
| `modelValue` | Angular 惯用映射 | Angular 用 value 双向绑定 |
| `onBlur` | D1 表格与选择线 | 失焦事件在后续版本实现 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onClear` | D1 表格与选择线 | 清空已包含在 (change) 的 trigger="clear" 里 |
| `onConfirm` | D1 表格与选择线 | 确认已包含在 (change) 的 trigger="confirm" 里 |
| `onFocus` | D1 表格与选择线 | 聚焦事件在后续版本实现 |
| `onMonthChange` | D1 表格与选择线 | 月份变化事件暂未暴露 |
| `onPick` | D1 表格与选择线 | 选中已包含在 (change) 的 trigger="pick" 里 |
| `onPresetClick` | D1 表格与选择线 | 预设日期已包含在 (change) 的 trigger="preset" 里 |
| `onYearChange` | D1 表格与选择线 | 年份变化事件暂未暴露 |
| `popupProps` | D1 表格与选择线 | 透传 PopupProps 在后续版本实现 |
| `prefixIcon` | Angular 惯用映射 | Angular 用 <t-icon tDatePickerPrefixIcon> 投影 |
| `readonly` | D1 表格与选择线 | 只读模式在后续版本实现 |
| `selectInputProps` | D1 表格与选择线 | 透传 SelectInputProps 在后续版本实现 |
| `status` | D1 表格与选择线 | 校验状态在后续版本实现 |
| `suffixIcon` | D1 表格与选择线 | 默认日历图标，未支持替换 |
| `timePickerProps` | D1 表格与选择线 | 时间面板透传在后续版本实现 |
| `tips` | D1 表格与选择线 | 提示文案在后续版本实现 |

## 文档示例

- `packages/docs/src/app/docs/date-picker/demos/date-picker-basic.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-disabled.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-mode.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-multiple.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-options.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-presets.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-quarter.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-range.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-render.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-time.ts`
- `packages/docs/src/app/docs/date-picker/demos/date-picker-week.ts`
