# Grid 栅格 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/grid/`
- 文档页：`/grid`（`packages/docs/src/app/docs/grid/grid.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 17 |
| 已对齐 | 15 |
| 覆盖率 | 88.2% |
| 深度债 | 2（D1 0 / D2 0 / D3 2） |
| Angular 惯用映射 | 0（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TCol`（`<t-col>`）

上游接口 `TdColProps`；上游属性 13、已对齐 12（92.3%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `flex` | string \| number \| undefined | undefined | 列宽度 |
| `span` | number \| undefined | undefined | 占位格数 |
| `offset` | number \| undefined | undefined | 偏移格数 |
| `order` | number \| undefined | undefined | 排序 |
| `pull` | number \| undefined | undefined | 向右移动格数 |
| `push` | number \| undefined | undefined | 向左移动格数 |
| `xs` | ColSize \| undefined | undefined | 视口 ≥ 320px |
| `sm` | ColSize \| undefined | undefined | 视口 ≥ 768px |
| `md` | ColSize \| undefined | undefined | 视口 ≥ 992px |
| `lg` | ColSize \| undefined | undefined | 视口 ≥ 1200px |
| `xl` | ColSize \| undefined | undefined | 视口 ≥ 1400px |
| `xxl` | ColSize \| undefined | undefined | 视口 ≥ 1880px |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `tag` | D3 其余组件与边角能力 | [D3] Angular 组件宿主标签固定为 <t-col>，自定义标签需要改用指令形态（<div tCol>） |

### `TRow`（`<t-row>`）

上游接口 `TdRowProps`；上游属性 4、已对齐 3（75.0%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `justify` | RowJustify \| undefined | undefined | 水平排列方式 |
| `align` | RowAlign \| undefined | undefined | 垂直对齐方式 |
| `gutter` | RowGutter | 0 | 栅格间距 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `tag` | D3 其余组件与边角能力 | [D3] Angular 组件宿主标签固定为 <t-row>，自定义标签需要改用指令形态（<div tRow>） |

## 文档示例

- `packages/docs/src/app/docs/grid/demos/grid-basic.ts`
- `packages/docs/src/app/docs/grid/demos/grid-gutter.ts`
- `packages/docs/src/app/docs/grid/demos/grid-offset.ts`
- `packages/docs/src/app/docs/grid/demos/grid-responsive.ts`
