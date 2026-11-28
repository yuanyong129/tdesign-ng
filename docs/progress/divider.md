# Divider 分割线 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/divider/`
- 文档页：`/divider`（`packages/docs/src/app/docs/divider/divider.component.ts`）
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
| 文档示例 | 4 个 |

## 组件明细

### `TDivider`（`<t-divider>`）

上游接口 `TdDividerProps`；上游属性 6、已对齐 4（66.7%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `layout` | DividerLayout | horizontal | 方向 |
| `dashed` | boolean | false | 是否为虚线 |
| `align` | DividerAlign | center | 文字位置 |
| `size` | string \| number \| undefined | undefined | 间距 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `content` | Angular 惯用映射 | Angular 用 <ng-content> 承载分割线文字 |
| `default` | Angular 惯用映射 | 同 content，Vue 的默认插槽 |

## 文档示例

- `packages/docs/src/app/docs/divider/demos/divider-align.ts`
- `packages/docs/src/app/docs/divider/demos/divider-horizontal.ts`
- `packages/docs/src/app/docs/divider/demos/divider-margin.ts`
- `packages/docs/src/app/docs/divider/demos/divider-vertical.ts`
