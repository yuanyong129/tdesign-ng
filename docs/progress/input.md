# 输入框 Input · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/input/`
- 文档页：`/input`（`packages/docs/src/app/docs/input/input.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 46 |
| 已对齐 | 26 |
| 覆盖率 | 56.5% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 20（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 10 个 |

## 组件明细

### `TInput`（`<t-input>`）

上游接口 `TdInputProps`；上游属性 45、已对齐 25（55.6%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | InputValue \| undefined | undefined | 受控输入值，未设置时使用非受控状态 |
| `defaultValue` | InputValue | '' | 非受控初始值，仅初始化时读取 |
| `autoWidth` | boolean | false | 根据内容自动调整宽度 |
| `inputClass` | string \| string[] \| Record<string, boolean> \| undefined | undefined | 内层输入框容器的类名 |
| `size` | InputSize | 'medium' | 输入框尺寸 |
| `status` | InputStatus | 'default' | 输入框状态 |
| `align` | InputAlign | 'left' | 文本对齐方式 |
| `type` | InputType | 'text' | 输入框类型 |
| `placeholder` | string \| undefined | undefined | 占位文字 |
| `disabled` | boolean | false | 是否禁用 |
| `readonly` | boolean | false | 是否只读 |
| `clearable` | boolean | false | 是否可清空 |
| `showClearIconOnEmpty` | boolean | false | 值为空时是否也显示清空图标 |
| `borderless` | boolean | false | 是否无边框 |
| `autofocus` | boolean | false | 自动聚焦 |
| `spellCheck` | boolean | true | 原生的 spellcheck 属性 |
| `autocomplete` | string \| undefined | undefined | 原生的 autocomplete 属性 |
| `name` | string \| undefined | undefined | 原生的 name 属性 |
| `maxcharacter` | number \| undefined | undefined | 最大加权长度，ASCII 计 1，非 ASCII 每个 UTF-16 单元计 2 |
| `maxlength` | string \| number \| undefined | undefined | 最大 Unicode 码点数，由组件限制以保留完整 emoji 和组合输入 |
| `allowInputOverMax` | boolean | false | 是否允许输入超过最大字符数 |
| `showLimitNumber` | boolean | false | 是否显示字数统计 |
| `format` | ((value: string) => string) \| undefined | undefined | 格式化函数，在写入值之前调用 |
| `tips` | string \| undefined | undefined | 输入框下方的提示文字 |
| `label` | string \| undefined | undefined | 输入框左侧的标签文字 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | InputValue | 值变化事件，用于双向绑定 |
| `change` | InputChangeEvent | 值变化事件，携带触发来源 |
| `focus` | FocusEvent | 获得焦点 |
| `blur` | FocusEvent | 失去焦点 |
| `enter` | KeyboardEvent | 按下回车 |
| `keydown` | KeyboardEvent | 键盘按下 |
| `keyup` | KeyboardEvent | 键盘抬起 |
| `clear` | MouseEvent | 点击清空图标 |
| `keypress` | KeyboardEvent | 原生字符按键事件 |
| `compositionstart` | InputCompositionEvent | 组合输入开始 |
| `compositionend` | InputCompositionEvent | 组合输入结束 |
| `paste` | InputPasteEvent | 粘贴事件与纯文本内容 |
| `wheel` | { e: WheelEvent } | 滚轮事件 |
| `validate` | InputValidateEvent | 超过长度限制或恢复正常时触发 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `modelValue` | Angular 惯用映射 | Angular 用 [(value)] 双向绑定 + ControlValueAccessor |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |
| `onClear` | Angular 惯用映射 | Angular 用 (clear) 输出 |
| `onClick` | Angular 惯用映射 | Angular 用 (click) 输出 |
| `onCompositionend` | Angular 惯用映射 | Angular 用 (compositionend) 输出 { value, e } |
| `onCompositionstart` | Angular 惯用映射 | Angular 用 (compositionstart) 输出 { value, e } |
| `onEnter` | Angular 惯用映射 | Angular 用 (enter) 输出 |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onKeydown` | Angular 惯用映射 | Angular 用 (keydown) 输出 |
| `onKeypress` | Angular 惯用映射 | Angular 用 (keypress) 输出原生 KeyboardEvent，内部阻止冒泡避免重复触发 |
| `onKeyup` | Angular 惯用映射 | Angular 用 (keyup) 输出 |
| `onMouseenter` | Angular 惯用映射 | Angular 用宿主原生 (mouseenter) 监听，参数 MouseEvent，包含标签和提示区域 |
| `onMouseleave` | Angular 惯用映射 | Angular 用宿主原生 (mouseleave) 监听，参数 MouseEvent，包含标签和提示区域 |
| `onPaste` | Angular 惯用映射 | Angular 用 (paste) 输出 { e, pasteValue } |
| `onValidate` | Angular 惯用映射 | Angular 用 (validate) 输出 { error }，长度超限状态切换时触发 |
| `onWheel` | Angular 惯用映射 | Angular 用 (wheel) 输出 { e } |
| `prefixIcon` | Angular 惯用映射 | Angular 用 <t-icon tInputPrefixIcon> 投影，不是输入属性 |
| `suffix` | Angular 惯用映射 | Angular 用 <ng-content select="[tInputSuffix]"> 承载任意后置内容 |
| `suffixIcon` | Angular 惯用映射 | Angular 用 <t-icon tInputSuffixIcon> 投影到后缀图标区 |

### `TInputGroup`（`<t-input-group>`）

上游接口 `TdInputGroupProps`；上游属性 1、已对齐 1（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `separate` | boolean | false | 是否在输入框之间显示间距 |

## 文档示例

- `packages/docs/src/app/docs/input/demos/input-basic.ts`
- `packages/docs/src/app/docs/input/demos/input-clearable.ts`
- `packages/docs/src/app/docs/input/demos/input-editing.ts`
- `packages/docs/src/app/docs/input/demos/input-group.ts`
- `packages/docs/src/app/docs/input/demos/input-icon.ts`
- `packages/docs/src/app/docs/input/demos/input-label.ts`
- `packages/docs/src/app/docs/input/demos/input-limit.ts`
- `packages/docs/src/app/docs/input/demos/input-size.ts`
- `packages/docs/src/app/docs/input/demos/input-state.ts`
- `packages/docs/src/app/docs/input/demos/input-status.ts`
