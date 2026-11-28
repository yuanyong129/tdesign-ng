# TimePicker 时间选择器 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/time-picker/`
- 文档页：`/time-picker`（`packages/docs/src/app/docs/time-picker/time-picker.component.ts`）
- 状态：🚧 有深度债 17 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 33 |
| 已对齐 | 12 |
| 覆盖率 | 36.4% |
| 深度债 | 17（D1 17 / D2 0 / D3 0） |
| Angular 惯用映射 | 4（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TTimePicker`（`<t-time-picker>`）

上游接口 `TdTimePickerProps`；上游属性 33、已对齐 12（36.4%）；深度债 17 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | TimePickerValue \| undefined | undefined | 选中的时间，受控用法。 |
| `defaultValue` | TimePickerValue \| undefined | undefined | 默认选中的时间，非受控用法。 |
| `format` | string | 'HH:mm:ss' | 时间格式，支持 HH / mm / ss。 |
| `steps` | Array<string \| number> | [1, 1, 1] | 每一列的步长，顺序为 HH / mm / ss。 |
| `clearable` | boolean | false | 是否可清空。 |
| `disabled` | boolean | false | 是否禁用。 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 输入框尺寸。 |
| `placeholder` | string | '请选择时间' | 占位文案。 |
| `presets` | PresetTime \| undefined | undefined | 预设时间：键为按钮文案，值为时间或返回时间的函数。 |
| `disableTime` | DisableTime \| undefined | undefined | 禁用时间的判断函数，返回每列需要禁用的候选值。 |
| `hideDisabledTime` | boolean | true | 是否隐藏被禁用的候选项（false 时置灰显示）。 |
| `allowInput` | boolean | false | 是否允许在输入框里直接输入时间（Enter / 失焦提交）。 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | TimePickerChangeEvent | 选中时间变化 |
| `visibleChange` | boolean | 弹层显隐变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `borderless` | D1 表格与选择线 | 无边框模式在后续版本实现 |
| `inputProps` | D1 表格与选择线 | 透传 InputProps 在后续版本实现 |
| `label` | D1 表格与选择线 | 标签文案在后续版本实现 |
| `modelValue` | Angular 惯用映射 | Angular 用 value 双向绑定 |
| `onBlur` | D1 表格与选择线 | 失焦事件在后续版本实现 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onClear` | D1 表格与选择线 | 清空已包含在 (change) 的 trigger="clear" 里 |
| `onClose` | D1 表格与选择线 | 关闭事件暂未暴露 |
| `onConfirm` | D1 表格与选择线 | 确认已包含在 (change) 的 trigger="confirm" 里 |
| `onFocus` | D1 表格与选择线 | 聚焦事件在后续版本实现 |
| `onInput` | D1 表格与选择线 | 输入框编辑时间在后续版本实现 |
| `onOpen` | D1 表格与选择线 | 打开事件暂未暴露 |
| `onPick` | D1 表格与选择线 | 选中只更新面板草稿，确认后才派发 (change) |
| `popupProps` | D1 表格与选择线 | 透传 PopupProps 在后续版本实现 |
| `prefixIcon` | Angular 惯用映射 | Angular 用 <t-icon tTimePickerPrefixIcon> 投影 |
| `readonly` | D1 表格与选择线 | 只读模式在后续版本实现 |
| `selectInputProps` | D1 表格与选择线 | 透传 SelectInputProps 在后续版本实现 |
| `status` | D1 表格与选择线 | 校验状态在后续版本实现 |
| `suffixIcon` | D1 表格与选择线 | 默认时钟图标，未支持替换 |
| `tips` | D1 表格与选择线 | 提示文案在后续版本实现 |
| `valueDisplay` | Angular 惯用映射 | Angular 用 <ng-template tTimePickerValueDisplay> 投影 |

## 文档示例

- `packages/docs/src/app/docs/time-picker/demos/time-picker-basic.ts`
- `packages/docs/src/app/docs/time-picker/demos/time-picker-options.ts`
- `packages/docs/src/app/docs/time-picker/demos/time-picker-presets.ts`
