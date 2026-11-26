# 文本域 Textarea · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/textarea/`
- 文档页：`/textarea`（`packages/docs/src/app/docs/textarea/textarea.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 21 |
| 已对齐 | 12 |
| 覆盖率 | 57.1% |
| 深度债 | 2（D1 0 / D2 2 / D3 0） |
| Angular 惯用映射 | 7（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TTextarea`（`<t-textarea>`）

上游接口 `TdTextareaProps`；上游属性 21、已对齐 12（57.1%）；深度债 2 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | TextareaValue | '' | 输入框的值 |
| `placeholder` | string \| undefined | undefined | 占位文字 |
| `status` | TextareaStatus | 'default' | 输入框状态 |
| `disabled` | boolean | false | 是否禁用 |
| `readonly` | boolean | false | 是否只读 |
| `autofocus` | boolean | false | 自动聚焦 |
| `autosize` | boolean \| TextareaAutosize | false | 是否根据内容自动撑高，可传 `{ minRows, maxRows }` |
| `maxcharacter` | number \| undefined | undefined | 最大字符数，按字符（而非字节）计算，超出时截断 |
| `maxlength` | string \| number \| undefined | undefined | 原生 maxlength，超出时浏览器直接阻止输入 |
| `allowInputOverMax` | boolean | false | 是否允许输入超过最大字符数 |
| `name` | string \| undefined | undefined | 原生的 name 属性 |
| `tips` | string \| undefined | undefined | 输入框下方的提示文字 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | TextareaValue | 值变化事件，用于双向绑定 |
| `change` | TextareaChangeEvent | 值变化事件，携带原始事件 |
| `focus` | FocusEvent | 获得焦点 |
| `blur` | FocusEvent | 失去焦点 |
| `keydown` | KeyboardEvent | 键盘按下 |
| `keyup` | KeyboardEvent | 键盘抬起 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `defaultValue` | Angular 惯用映射 | Angular 用 [value] 初始值 + ControlValueAccessor |
| `modelValue` | Angular 惯用映射 | Angular 用 [(value)] 双向绑定 + ControlValueAccessor |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onKeydown` | Angular 惯用映射 | Angular 用 (keydown) 输出 |
| `onKeypress` | D2 录入与反馈线 | 已由 (keydown)/(keyup) 覆盖 |
| `onKeyup` | Angular 惯用映射 | Angular 用 (keyup) 输出 |
| `onValidate` | D2 录入与反馈线 | 数值越界校验由 t-form 承担，P2 表单落地后再补 |

## 文档示例

- `packages/docs/src/app/docs/textarea/demos/textarea-autosize.ts`
- `packages/docs/src/app/docs/textarea/demos/textarea-basic.ts`
- `packages/docs/src/app/docs/textarea/demos/textarea-disabled.ts`
- `packages/docs/src/app/docs/textarea/demos/textarea-limit.ts`
- `packages/docs/src/app/docs/textarea/demos/textarea-status.ts`
