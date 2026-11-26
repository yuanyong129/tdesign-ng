# 骨架屏 Skeleton · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/skeleton/`
- 文档页：`/skeleton`（`packages/docs/src/app/docs/skeleton/skeleton.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 7 |
| 已对齐 | 5 |
| 覆盖率 | 71.4% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TSkeleton`（`<t-skeleton>`）

上游接口 `TdSkeletonProps`；上游属性 7、已对齐 5（71.4%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `animation` | SkeletonAnimation | none | 动画效果 |
| `delay` | number | 0 | 延迟时间 |
| `loading` | boolean | true | 是否加载中 |
| `rowCol` | SkeletonRowCol \| undefined | undefined | 行列配置 |
| `theme` | SkeletonTheme | text | 主题 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `content` | Angular 惯用映射 | Angular 用 <ng-content> 承载被包裹的内容 |
| `default` | Angular 惯用映射 | 同 content，Vue 的默认插槽 |

## 文档示例

- `packages/docs/src/app/docs/skeleton/demos/skeleton-loading.ts`
- `packages/docs/src/app/docs/skeleton/demos/skeleton-row-col.ts`
- `packages/docs/src/app/docs/skeleton/demos/skeleton-theme.ts`
