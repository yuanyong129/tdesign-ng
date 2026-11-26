# 单选框 Radio · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/radio/`
- 文档页：`/radio`（`packages/docs/src/app/docs/radio/radio.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 25 |
| 已对齐 | 17 |
| 覆盖率 | 68.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 8（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 7 个 |

## 组件明细

### `TRadio`（`<t-radio>`）

上游接口 `TdRadioProps`；上游属性 12、已对齐 7（58.3%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | boolean | false | 是否选中，独立使用时生效 |
| `value` | RadioValue | true | 单选框的值，在单选框组中用于匹配 |
| `disabled` | boolean | false | 是否禁用 |
| `readonly` | boolean | false | 是否只读 |
| `allowUncheck` | boolean | false | 再次点击已选中的单选框时是否允许取消选中 |
| `name` | string \| undefined | undefined | 原生 name 属性，未设置时继承单选框组的 name |
| `label` | string \| undefined | undefined | 单选框文字 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `checkedChange` | boolean | 选中状态变化事件 |
| `change` | RadioChangeEvent | 值变化事件 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | 内容通过 ng-content 投影，无需 default 插槽属性 |
| `defaultChecked` | Angular 惯用映射 | Angular 用 [checked] 作为受控初始值 |
| `modelValue` | Angular 惯用映射 | Angular 用 [(checked)] 双向绑定 + ControlValueAccessor |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |
| `onClick` | Angular 惯用映射 | Angular 用 (click) 输出 |

### `TRadioGroup`（`<t-radio-group>`）

上游接口 `TdRadioGroupProps`；上游属性 13、已对齐 10（76.9%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | RadioValue \| undefined | undefined | 选中的值 |
| `options` | RadioOption[] \| undefined | undefined | 选项列表，也可以用内容投影声明单选框 |
| `direction` | RadioDirection | horizontal | 排列方向 |
| `theme` | RadioTheme | radio | 形态：普通单选框或按钮式单选框 |
| `variant` | RadioVariant | outline | 按钮式单选框的样式变体 |
| `size` | RadioSize | medium | 尺寸，只在按钮式形态下生效 |
| `disabled` | boolean | false | 是否禁用整组 |
| `readonly` | boolean | false | 是否只读整组 |
| `name` | string \| undefined | undefined | 原生 name 属性，会下发给组内的单选框 |
| `allowUncheck` | boolean | false | 再次点击已选中的单选框时是否允许取消选中 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | RadioValue \| undefined | 选中值变化事件，用于双向绑定 |
| `change` | RadioGroupChangeEvent | 值变化事件 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `defaultValue` | Angular 惯用映射 | Angular 用 [value] 作为受控初始值 |
| `modelValue` | Angular 惯用映射 | Angular 用 [(value)] 双向绑定 + ControlValueAccessor |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |

## 文档示例

- `packages/docs/src/app/docs/radio/demos/radio-basic.ts`
- `packages/docs/src/app/docs/radio/demos/radio-button.ts`
- `packages/docs/src/app/docs/radio/demos/radio-direction.ts`
- `packages/docs/src/app/docs/radio/demos/radio-filled.ts`
- `packages/docs/src/app/docs/radio/demos/radio-group.ts`
- `packages/docs/src/app/docs/radio/demos/radio-options.ts`
- `packages/docs/src/app/docs/radio/demos/radio-state.ts`
