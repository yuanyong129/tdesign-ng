# 开关 Switch · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/switch/`
- 文档页：`/switch`（`packages/docs/src/app/docs/switch/switch.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 10 |
| 已对齐 | 7 |
| 覆盖率 | 70.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TSwitch`（`<t-switch>`）

上游接口 `TdSwitchProps`；上游属性 10、已对齐 7（70.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | SwitchValue | false | 开关的值 |
| `size` | SwitchSize | 'medium' | 开关尺寸 |
| `disabled` | boolean | false | 是否禁用 |
| `loading` | boolean | false | 是否加载中 |
| `label` | string \| [string, string] \| undefined | undefined | 开关文字，传数组时第一项是选中态、第二项是未选中态 |
| `customValue` | [SwitchValue, SwitchValue] \| undefined | [true, false] | 自定义开关值，`[选中值, 未选中值]` |
| `beforeChange` | (() => boolean \| Promise<boolean>) \| undefined | undefined | 切换前拦截，返回 false 或 resolve 为 false 时不切换 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | SwitchValue | 值变化事件，用于双向绑定 |
| `change` | SwitchChangeEvent | 值变化事件，携带原始事件 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `defaultValue` | Angular 惯用映射 | Angular 用 [value] 初始值 + ControlValueAccessor |
| `modelValue` | Angular 惯用映射 | Angular 用 [(value)] 双向绑定 + ControlValueAccessor |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |

## 文档示例

- `packages/docs/src/app/docs/switch/demos/switch-basic.ts`
- `packages/docs/src/app/docs/switch/demos/switch-custom.ts`
- `packages/docs/src/app/docs/switch/demos/switch-label.ts`
- `packages/docs/src/app/docs/switch/demos/switch-size.ts`
- `packages/docs/src/app/docs/switch/demos/switch-state.ts`
