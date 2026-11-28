# Checkbox 多选框 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/checkbox/`
- 文档页：`/checkbox`（`packages/docs/src/app/docs/checkbox/checkbox.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 24 |
| 已对齐 | 17 |
| 覆盖率 | 70.8% |
| 深度债 | 2（D1 0 / D2 0 / D3 2） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 7 个 |

## 组件明细

### `TCheckbox`（`<t-checkbox>`）

上游接口 `TdCheckboxProps`；上游属性 14、已对齐 10（71.4%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | boolean \| undefined | undefined | 是否选中，独立使用时生效 |
| `defaultChecked` | boolean | false | 非受控初始选中态，仅初始化时读取 |
| `value` | CheckboxValue | true | 复选框的值，在复选框组中用于匹配 |
| `disabled` | boolean | false | 是否禁用 |
| `readonly` | boolean | false | 是否只读 |
| `indeterminate` | boolean | false | 是否显示为半选状态 |
| `checkAll` | boolean | false | 作为全选开关使用，只对复选框组有效 |
| `name` | string \| undefined | undefined | 原生 name 属性 |
| `label` | string \| undefined | undefined | 复选框文字 |
| `title` | string \| undefined | undefined | 原生 title 属性 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `checkedChange` | boolean | 选中状态变化事件，用于双向绑定 |
| `change` | CheckboxChangeEvent | 值变化事件 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | 内容通过 ng-content 投影，无需 default 插槽属性 |
| `lazyLoad` | D3 其余组件与边角能力 | Angular 组件按需渲染，没有延迟加载的等价概念 |
| `modelValue` | Angular 惯用映射 | Angular 用 [(checked)] 双向绑定 + ControlValueAccessor |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |

### `TCheckboxGroup`（`<t-checkbox-group>`）

上游接口 `TdCheckboxGroupProps`；上游属性 10、已对齐 7（70.0%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | CheckboxGroupValue \| undefined | undefined | 选中的值集合 |
| `defaultValue` | CheckboxGroupValue | [] | 非受控初始值，仅初始化时读取 |
| `options` | CheckboxOption[] \| undefined | undefined | 选项列表，配置后用 options 渲染；不配置时使用内容投影 |
| `max` | number \| undefined | undefined | 最多可选中个数 |
| `disabled` | boolean | false | 是否禁用整组 |
| `readonly` | boolean | false | 是否只读整组 |
| `name` | string \| undefined | undefined | 原生 name 属性 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | CheckboxGroupValue | 值变化事件，用于双向绑定 |
| `change` | CheckboxGroupChangeEvent | 变更事件，附带本次变化的选项信息 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `lazyLoad` | D3 其余组件与边角能力 | Angular 组件按需渲染，没有延迟加载的等价概念 |
| `modelValue` | Angular 惯用映射 | Angular 用 [(value)] 双向绑定 + ControlValueAccessor |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |

## 文档示例

- `packages/docs/src/app/docs/checkbox/demos/checkbox-basic.ts`
- `packages/docs/src/app/docs/checkbox/demos/checkbox-check-all.ts`
- `packages/docs/src/app/docs/checkbox/demos/checkbox-group.ts`
- `packages/docs/src/app/docs/checkbox/demos/checkbox-max.ts`
- `packages/docs/src/app/docs/checkbox/demos/checkbox-options.ts`
- `packages/docs/src/app/docs/checkbox/demos/checkbox-state.ts`
- `packages/docs/src/app/docs/checkbox/demos/checkbox-stateful.ts`
