# Progress 进度条 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/progress/`
- 文档页：`/progress`（`packages/docs/src/app/docs/progress/progress.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 8 |
| 已对齐 | 8 |
| 覆盖率 | 100.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 0（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TProgress`（`<t-progress>`）

上游接口 `TdProgressProps`；上游属性 8、已对齐 8（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `percentage` | number | 0 | 进度百分比，0 - 100 |
| `theme` | ProgressTheme | 'line' | 进度条主题 |
| `status` | ProgressStatus \| undefined | undefined | 进度条状态，不传时百分比达到 100 自动显示为 success |
| `color` | ProgressColor \| undefined | undefined | 进度条颜色，支持单色、渐变色数组与按百分比分段的颜色对象 |
| `trackColor` | string \| undefined | undefined | 轨道颜色 |
| `strokeWidth` | string \| number \| undefined | undefined | 线宽，line / plump 下为高度，circle 下为圆环宽度 |
| `size` | string \| number \| undefined | undefined | 尺寸，circle 支持 small / medium / large 或自定义像素，line / plump 支持 small |
| `label` | string \| boolean \| undefined | true | 标签内容，传 false 隐藏标签 |

## 文档示例

- `packages/docs/src/app/docs/progress/demos/progress-basic.ts`
- `packages/docs/src/app/docs/progress/demos/progress-circle.ts`
- `packages/docs/src/app/docs/progress/demos/progress-color.ts`
- `packages/docs/src/app/docs/progress/demos/progress-plump.ts`
- `packages/docs/src/app/docs/progress/demos/progress-status.ts`
