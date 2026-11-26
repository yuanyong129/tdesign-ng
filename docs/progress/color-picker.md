# 颜色选择器 ColorPicker · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/color-picker/`
- 文档页：`/color-picker`（`packages/docs/src/app/docs/color-picker/color-picker.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 22 |
| 已对齐 | 18 |
| 覆盖率 | 81.8% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 4（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TColorPicker`（`<t-color-picker>`）

上游接口 `TdColorPickerProps`；上游属性 22、已对齐 18（81.8%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `borderless` | boolean | false | 是否无边框 |
| `clearable` | boolean | false | 是否可清空 |
| `colorModes` | ColorPickerMode[] | ['monochrome','linear-gradient'] | 颜色模式，渐变能力暂未实现 |
| `disabled` | boolean | false | 是否禁用 |
| `enableAlpha` | boolean | false | 是否开启透明度 |
| `enableMultipleGradient` | boolean | true | 渐变模式下是否允许多个渐变点，渐变能力暂未实现 |
| `format` | ColorPickerFormat | 'RGB' | 颜色格式 |
| `inputProps` | Record<string, unknown> \| undefined | undefined | 透传给触发器输入框的属性 |
| `popupProps` | Record<string, unknown> \| undefined | undefined | 透传给弹层的属性 |
| `recentColors` | string[] \| boolean \| null \| undefined | undefined | 最近使用颜色，`true` 显示、`false` 隐藏、数组自定义 |
| `defaultRecentColors` | string[] | [] | 默认最近使用颜色 |
| `selectInputProps` | Record<string, unknown> \| undefined | undefined | 透传给格式选择器的属性 |
| `showPrimaryColorPreview` | boolean | true | 是否显示当前颜色预览 |
| `size` | ColorPickerSize | 'medium' | 尺寸 |
| `swatchColors` | string[] \| null \| undefined | undefined | 预设颜色，传 `null` 时使用系统预设 |
| `value` | string \| undefined | undefined | 受控颜色值 |
| `defaultValue` | string | '' | 非受控初始颜色 |
| `modelValue` | string \| undefined | undefined | 受控颜色值（v-model 别名） |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | ColorPickerChangeEvent | 颜色变化 |
| `clear` | { e: MouseEvent } | 点击清空 |
| `paletteBarChange` | { color: ColorObject } | 色相条、透明度条变化 |
| `recentColorsChange` | string[] | 最近使用颜色变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数 { value, color, trigger } |
| `onClear` | Angular 惯用映射 | Angular 用 (clear) 输出，参数 { e } |
| `onPaletteBarChange` | Angular 惯用映射 | Angular 用 (paletteBarChange) 输出，参数 { color } |
| `onRecentColorsChange` | Angular 惯用映射 | Angular 用 (recentColorsChange) 输出，参数 string[] |

## 文档示例

- `packages/docs/src/app/docs/color-picker/demos/color-picker-base.ts`
- `packages/docs/src/app/docs/color-picker/demos/color-picker-controlled.ts`
- `packages/docs/src/app/docs/color-picker/demos/color-picker-swatches.ts`
