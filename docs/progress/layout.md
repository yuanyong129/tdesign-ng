# Layout 布局 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/layout/`
- 文档页：`/layout`（`packages/docs/src/app/docs/layout/layout.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 6 |
| 已对齐 | 4 |
| 覆盖率 | 66.7% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TAside`（`<t-aside>`）

上游接口 `TdAsideProps`；上游属性 1、已对齐 1（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `width` | string \| undefined | undefined | 宽度 |

### `TContent`（`<t-content>`）

上游接口 `TdContentProps`；上游属性 2、已对齐 0（0.0%）；深度债 0 项；未登记缺失 0 项。

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `content` | Angular 惯用映射 | Angular 用 <ng-content> 承载内容 |
| `default` | Angular 惯用映射 | 同 content，Vue 的默认插槽 |

### `TFooter`（`<t-footer>`）

上游接口 `TdFooterProps`；上游属性 1、已对齐 1（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `height` | string \| undefined | undefined | 高度 |

### `THeader`（`<t-header>`）

上游接口 `TdHeaderProps`；上游属性 1、已对齐 1（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `height` | string \| undefined | undefined | 高度 |

### `TLayout`（`<t-layout>`）

上游接口 `TdLayoutProps`；上游属性 1、已对齐 1（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | LayoutDirection \| undefined | undefined | 布局方向 |

## 文档示例

- `packages/docs/src/app/docs/layout/demos/layout-aside.ts`
- `packages/docs/src/app/docs/layout/demos/layout-basic.ts`
- `packages/docs/src/app/docs/layout/demos/layout-nested.ts`
