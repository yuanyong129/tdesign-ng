# 折叠面板 Collapse · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/collapse/`
- 文档页：`/collapse`（`packages/docs/src/app/docs/collapse/collapse.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 11 |
| 已对齐 | 9 |
| 覆盖率 | 81.8% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TCollapse`（`<t-collapse>`）

上游接口 `TdCollapseProps`；上游属性 11、已对齐 9（81.8%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `borderless` | boolean | false | 是否无边框 |
| `defaultExpandAll` | boolean | false | 是否默认展开全部面板，仅在非受控时生效 |
| `disabled` | boolean | false | 是否禁用全部面板 |
| `expandIcon` | boolean \| TemplateRef<unknown> | true | 展开图标；传 false 隐藏，传模板自定义 |
| `expandIconPlacement` | CollapseExpandIconPlacement | 'left' | 展开图标位置 |
| `expandMutex` | boolean | false | 是否只允许同时展开一个面板（手风琴） |
| `expandOnRowClick` | boolean | false | 是否点击整行展开 / 收起 |
| `value` | CollapseValue \| undefined | undefined | 当前展开的面板值，受控时以它为准 |
| `defaultValue` | CollapseValue | [] | 默认展开的面板值 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | CollapseValue | 展开面板变化时触发 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `modelValue` | Angular 惯用映射 | Angular 用 value（受控）/ defaultValue |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |

## 文档示例

- `packages/docs/src/app/docs/collapse/demos/collapse-accordion.ts`
- `packages/docs/src/app/docs/collapse/demos/collapse-basic.ts`
- `packages/docs/src/app/docs/collapse/demos/collapse-options.ts`
