# 间距 Space · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/space/`
- 文档页：`/space`（`packages/docs/src/app/docs/space/space.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 5 |
| 已对齐 | 5 |
| 覆盖率 | 100.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 0（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 6 个 |

## 组件明细

### `TSpace`（`<t-space>`）

上游接口 `TdSpaceProps`；上游属性 5、已对齐 5（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | SpaceDirection | horizontal | 间距方向 |
| `size` | SpaceSize | medium | 间距大小 |
| `align` | SpaceAlign \| undefined | undefined | 交叉轴对齐 |
| `breakLine` | boolean | false | 是否自动换行 |
| `separator` | string \| undefined | undefined | 分隔符 |

## 文档示例

- `packages/docs/src/app/docs/space/demos/space-align.ts`
- `packages/docs/src/app/docs/space/demos/space-break-line.ts`
- `packages/docs/src/app/docs/space/demos/space-horizontal.ts`
- `packages/docs/src/app/docs/space/demos/space-separator.ts`
- `packages/docs/src/app/docs/space/demos/space-size.ts`
- `packages/docs/src/app/docs/space/demos/space-vertical.ts`
