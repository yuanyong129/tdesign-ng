# 输入框 Input · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/input/`
- 文档页：`/input`（`packages/docs/src/app/docs/input/input.component.ts`）
- 状态：🚧 有深度债 11 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 46 |
| 已对齐 | 22 |
| 覆盖率 | 47.8% |
| 深度债 | 11（D1 0 / D2 11 / D3 0） |
| Angular 惯用映射 | 13（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 8 个 |

## 组件明细

### `TInput`（`<t-input>`）

上游接口 `TdInputProps`；上游属性 46、已对齐 22（47.8%）；深度债 11 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | InputValue | '' | 输入框的值 |
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
| `maxcharacter` | number \| undefined | undefined | 最大字符数，按字符（而非字节）计算，超出时截断 |
| `maxlength` | string \| number \| undefined | undefined | 原生 maxlength，超出时浏览器直接阻止输入 |
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

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `autoWidth` | D2 录入与反馈线 | 暂未实现，用 style 指定宽度即可 |
| `defaultValue` | Angular 惯用映射 | Angular 用 [value] 初始值 + ControlValueAccessor |
| `inputClass` | Angular 惯用映射 | Angular 用 [class] 直接传，或在外层包一个元素 |
| `modelValue` | Angular 惯用映射 | Angular 用 [(value)] 双向绑定 + ControlValueAccessor |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |
| `onClear` | Angular 惯用映射 | Angular 用 (clear) 输出 |
| `onClick` | Angular 惯用映射 | Angular 用 (click) 输出 |
| `onCompositionend` | D2 录入与反馈线 | 同上 |
| `onCompositionstart` | D2 录入与反馈线 | 组合输入事件暂未单独暴露，可用 (keydown)/(change) 覆盖 |
| `onEnter` | Angular 惯用映射 | Angular 用 (enter) 输出 |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onKeydown` | Angular 惯用映射 | Angular 用 (keydown) 输出 |
| `onKeypress` | D2 录入与反馈线 | 已由 (keydown)/(keyup) 覆盖 |
| `onKeyup` | Angular 惯用映射 | Angular 用 (keyup) 输出 |
| `onMouseenter` | D2 录入与反馈线 | Angular 可直接在原生的宿主元素上监听 |
| `onMouseleave` | D2 录入与反馈线 | 同上 |
| `onPaste` | D2 录入与反馈线 | 暂未单独暴露，需要时可监听原生 paste 事件 |
| `onValidate` | D2 录入与反馈线 | 数值越界校验由 t-form 承担，P2 表单落地后再补 |
| `onWheel` | D2 录入与反馈线 | 暂未暴露，需要时可监听原生 wheel 事件 |
| `prefixIcon` | Angular 惯用映射 | Angular 用 <t-icon tInputPrefixIcon> 投影，不是输入属性 |
| `separate` | D2 录入与反馈线 | input-group 的属性，P2 做 t-input-group 时处理 |
| `suffix` | Angular 惯用映射 | Angular 用 <ng-content select="[tInputSuffix]"> 承载任意后置内容 |
| `suffixIcon` | D2 录入与反馈线 | 同 prefixIcon，用 <t-icon tInputSuffixIcon> 投影 |

## 文档示例

- `packages/docs/src/app/docs/input/demos/input-basic.ts`
- `packages/docs/src/app/docs/input/demos/input-clearable.ts`
- `packages/docs/src/app/docs/input/demos/input-icon.ts`
- `packages/docs/src/app/docs/input/demos/input-label.ts`
- `packages/docs/src/app/docs/input/demos/input-limit.ts`
- `packages/docs/src/app/docs/input/demos/input-size.ts`
- `packages/docs/src/app/docs/input/demos/input-state.ts`
- `packages/docs/src/app/docs/input/demos/input-status.ts`
