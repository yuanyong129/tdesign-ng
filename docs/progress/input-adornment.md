# 前后缀 InputAdornment · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/input-adornment/`
- 文档页：`/input-adornment`（`packages/docs/src/app/docs/input-adornment/input-adornment.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 2 |
| 已对齐 | 2 |
| 覆盖率 | 100.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 0（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 2 个 |

## 组件明细

### `TInputAdornment`（`<t-input-adornment>`）

上游接口 `TdInputAdornmentProps`；上游属性 2、已对齐 2（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `append` | InputAdornmentContent | undefined | 后缀 |
| `prepend` | InputAdornmentContent | undefined | 前缀 |

## 文档示例

- `packages/docs/src/app/docs/input-adornment/demos/input-adornment-base.ts`
- `packages/docs/src/app/docs/input-adornment/demos/input-adornment-template.ts`
