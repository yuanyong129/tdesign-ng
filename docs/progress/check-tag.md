# CheckTag 可选标签 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/check-tag/`
- 文档页：`/check-tag`（`packages/docs/src/app/docs/check-tag/check-tag.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 20 |
| 已对齐 | 14 |
| 覆盖率 | 70.0% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TCheckTag`（`<t-check-tag>`）

上游接口 `TdCheckTagProps`；上游属性 12、已对齐 8（66.7%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | boolean \| undefined | undefined | 选中状态 |
| `defaultChecked` | boolean | false | 初始选中状态 |
| `content` | CheckTagContent | undefined | 标签内容 |
| `disabled` | boolean | false | 是否禁用 |
| `size` | CheckTagSize \| undefined | medium | 尺寸 |
| `checkedProps` | CheckTagTagProps \| undefined | undefined | 选中状态的 Tag 配置，不覆盖显式 size 和 disabled |
| `uncheckedProps` | CheckTagTagProps \| undefined | undefined | 未选中状态的 Tag 配置，不覆盖显式 size 和 disabled |
| `value` | CheckTagValue \| undefined | undefined | 标签的值 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `checkedChange` | boolean | 选中状态变化 |
| `change` | CheckTagChangeEvent | 选中状态变化（带上下文） |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content /> 投影内容，优先于 content |
| `modelValue` | Angular 惯用映射 | [D2] Angular 用 [(checked)] 双向绑定表达 v-model |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数 { checked, value, event? } |
| `onClick` | D3 其余组件与边角能力 | [D3] 宿主原生 (click) 已可监听，不再提供同名输出避免双触发 |

### `TCheckTagGroup`（`<t-check-tag-group>`）

上游接口 `TdCheckTagGroupProps`；上游属性 8、已对齐 6（75.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options` | ReadonlyArray<CheckTagGroupOption> \| undefined | undefined | 选项列表 |
| `value` | CheckTagGroupValue \| undefined | undefined | 选中的值列表 |
| `defaultValue` | CheckTagGroupValue | [] | 初始值列表 |
| `multiple` | boolean | false | 是否多选 |
| `checkedProps` | CheckTagTagProps \| undefined | undefined | 组内选中标签的 Tag 配置 |
| `uncheckedProps` | CheckTagTagProps \| undefined | undefined | 组内未选中标签的 Tag 配置 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | CheckTagGroupValue | 值变化 |
| `change` | CheckTagGroupChangeEvent | 值变化（带上下文） |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `modelValue` | Angular 惯用映射 | [D2] Angular 用 [(value)] 双向绑定表达 v-model |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数 { value, checked, type, current, event? } |

## 文档示例

- `packages/docs/src/app/docs/check-tag/demos/check-tag-basic.ts`
- `packages/docs/src/app/docs/check-tag/demos/check-tag-disabled.ts`
- `packages/docs/src/app/docs/check-tag/demos/check-tag-group.ts`
- `packages/docs/src/app/docs/check-tag/demos/check-tag-props.ts`
