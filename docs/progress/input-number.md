# 数字输入框 InputNumber · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/input-number/`
- 文档页：`/input-number`（`packages/docs/src/app/docs/input-number/input-number.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 31 |
| 已对齐 | 21 |
| 覆盖率 | 67.7% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 9（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TInputNumber`（`<t-input-number>`）

上游接口 `TdInputNumberProps`；上游属性 31、已对齐 21（67.7%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `align` | InputNumberAlign \| undefined | undefined | 对齐方式 |
| `allowInputOverLimit` | boolean | true | 允许超限输入 |
| `autoWidth` | boolean | false | 自适应宽度 |
| `autofocus` | boolean | false | 自动聚焦 |
| `decimalPlaces` | InputNumberDecimalPlaces \| undefined | undefined | 小数位数 |
| `disabled` | boolean | false | 禁用 |
| `format` | InputNumberFormat \| undefined | undefined | 格式化函数 |
| `label` | string \| TemplateRef<unknown> \| undefined | undefined | 前缀内容 |
| `largeNumber` | boolean | false | 大数模式 |
| `max` | InputNumberValue | Infinity | 最大值 |
| `min` | InputNumberValue | -Infinity | 最小值 |
| `placeholder` | string \| undefined | undefined | 占位文本 |
| `readonly` | boolean | false | 只读 |
| `size` | InputNumberSize | medium | 尺寸 |
| `status` | InputNumberStatus | default | 状态 |
| `step` | InputNumberValue | 1 | 步长 |
| `suffix` | string \| TemplateRef<unknown> \| undefined | undefined | 后缀内容 |
| `theme` | InputNumberTheme | row | 主题 |
| `tips` | string \| TemplateRef<unknown> \| undefined | undefined | 提示内容 |
| `value` | InputNumberValue \| undefined | undefined | 值 |
| `defaultValue` | InputNumberValue \| undefined | undefined | 默认值 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | InputNumberValue \| undefined | 值变化 |
| `change` | InputNumberChangeEvent | 值变化 |
| `blur` | InputNumberFocusEvent | 失焦 |
| `enter` | InputNumberKeyboardEvent | 回车 |
| `focus` | InputNumberFocusEvent | 聚焦 |
| `keydown` | InputNumberKeyboardEvent | 按键按下 |
| `keypress` | InputNumberKeyboardEvent | 按键输入 |
| `keyup` | InputNumberKeyboardEvent | 按键抬起 |
| `validate` | InputNumberValidateEvent | 数值校验 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `inputProps` | D3 其余组件与边角能力 | [D3] Vue 的 InputProps 任意透传在 Angular 无等价物（inputs 编译期声明） |
| `modelValue` | Angular 惯用映射 | [D3] Angular 用 [(value)] 双向绑定表达 v-model |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onEnter` | Angular 惯用映射 | Angular 用 (enter) 输出 |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onKeydown` | Angular 惯用映射 | Angular 用 (keydown) 输出 |
| `onKeypress` | Angular 惯用映射 | Angular 用 (keypress) 输出 |
| `onKeyup` | Angular 惯用映射 | Angular 用 (keyup) 输出 |
| `onValidate` | Angular 惯用映射 | Angular 用 (validate) 输出，参数 { error } |

## 文档示例

- `packages/docs/src/app/docs/input-number/demos/input-number-advanced.ts`
- `packages/docs/src/app/docs/input-number/demos/input-number-basic.ts`
- `packages/docs/src/app/docs/input-number/demos/input-number-disabled.ts`
