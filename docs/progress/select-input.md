# 选择器输入 SelectInput · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/select-input/`
- 文档页：`/select-input`（`packages/docs/src/app/docs/select-input/select-input.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 43 |
| 已对齐 | 31 |
| 覆盖率 | 72.1% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 12（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TSelectInput`（`<t-select-input>`）

上游接口 `TdSelectInputProps`；上游属性 43、已对齐 31（72.1%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `allowInput` | boolean | false | 是否允许输入 |
| `autoWidth` | boolean | false | 宽度自适应 |
| `autofocus` | boolean | false | 自动聚焦 |
| `borderless` | boolean | false | 无边框 |
| `clearable` | boolean | false | 可清空 |
| `collapsedItems` | TemplateRef<SelectInputCollapsedItemsContext> \| undefined | undefined | 折叠标签模板 |
| `disabled` | boolean | false | 禁用 |
| `inputProps` | InputOptions \| undefined | undefined | 原生输入区的受支持配置 |
| `tagInputProps` | SelectInputTagInputProps \| undefined | undefined | 多选标签区的受支持配置，仅 multiple 时生效 |
| `inputValue` | string \| number \| undefined | undefined | 输入框文本 |
| `defaultInputValue` | string \| number \| undefined | undefined | 默认输入框文本 |
| `keys` | SelectInputKeys \| undefined | undefined | 字段映射 |
| `label` | SelectInputContent | undefined | 标签文字 |
| `loading` | boolean | false | 加载中 |
| `minCollapsedNum` | number | 0 | 折叠数量 |
| `multiple` | boolean | false | 多选 |
| `panel` | SelectInputContent | undefined | 下拉面板 |
| `placeholder` | string | '' | 占位文字 |
| `popupProps` | SelectInputPopupProps \| undefined | undefined | 弹层属性 |
| `popupVisible` | boolean \| undefined | undefined | 弹层展开 |
| `defaultPopupVisible` | boolean | false | 默认弹层展开 |
| `readonly` | boolean | false | 只读 |
| `reserveKeyword` | boolean | false | 保留关键字 |
| `size` | SelectInputSize | 'medium' | 尺寸 |
| `status` | SelectInputStatus | 'default' | 状态 |
| `suffix` | SelectInputContent | undefined | 后缀内容 |
| `tag` | TemplateRef<SelectInputTagContext> \| string \| undefined | undefined | 自定义标签 |
| `tagProps` | SelectInputTagProps \| undefined | undefined | 标签属性 |
| `tips` | SelectInputContent | undefined | 提示文字 |
| `value` | SelectInputValue \| undefined | undefined | 当前值 |
| `valueDisplay` | TemplateRef<SelectInputValueDisplayContext> \| string \| undefined | undefined | 值展示模板 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `blur` | SelectInputBlurEvent | 失焦 |
| `clear` | SelectInputClearEvent | 清空 |
| `enter` | SelectInputEnterEvent | 回车 |
| `focus` | SelectInputFocusEvent | 聚焦 |
| `inputChange` | SelectInputInputChangeEvent | 输入变化 |
| `paste` | SelectInputPasteEvent | 粘贴 |
| `popupVisibleChange` | boolean | 弹层展开变化 |
| `tagChange` | SelectInputTagChangeEvent | 标签变化 |
| `valueChange` | SelectInputValue | 值变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onClear` | Angular 惯用映射 | Angular 用 (clear) 输出 |
| `onEnter` | Angular 惯用映射 | Angular 用 (enter) 输出 |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onInputChange` | Angular 惯用映射 | Angular 用 (inputChange) 输出 |
| `onMouseenter` | Angular 惯用映射 | Angular 用宿主原生 (mouseenter)，参数 MouseEvent，包含提示区 |
| `onMouseleave` | Angular 惯用映射 | Angular 用宿主原生 (mouseleave)，参数 MouseEvent，包含提示区 |
| `onPaste` | Angular 惯用映射 | Angular 用 (paste) 输出 |
| `onPopupVisibleChange` | Angular 惯用映射 | Angular 用 (popupVisibleChange) 输出，支持 [(popupVisible)] |
| `onTagChange` | Angular 惯用映射 | Angular 用 (tagChange) 输出 |
| `prefixIcon` | Angular 惯用映射 | Angular 用内容投影指令 [tSelectInputPrefixIcon] 传入模板，避免与字符串类 input 冲突 |
| `suffixIcon` | Angular 惯用映射 | Angular 用内容投影指令 [tSelectInputSuffixIcon] 传入模板，同上 |

## 文档示例

- `packages/docs/src/app/docs/select-input/demos/select-input-basic.ts`
- `packages/docs/src/app/docs/select-input/demos/select-input-options.ts`
- `packages/docs/src/app/docs/select-input/demos/select-input-panel.ts`
- `packages/docs/src/app/docs/select-input/demos/select-input-tag.ts`
