# BackTop 回到顶部 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/back-top/`
- 文档页：`/back-top`（`packages/docs/src/app/docs/back-top/back-top.component.ts`）
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

### `TBackTop`（`<t-back-top>`）

上游接口 `TdBackTopProps`；上游属性 11、已对齐 9（81.8%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `container` | BackTopAttachNode | body | 监听滚动的容器 |
| `content` | BackTopContent | undefined | 内容 |
| `duration` | number | 200 | 滚动时长 |
| `offset` | Array<string \| number> | ['24px','80px'] | 偏移 |
| `shape` | BackTopShape | square | 形状 |
| `size` | BackTopSize | medium | 尺寸 |
| `target` | BackTopAttachNode | body | 回滚目标 |
| `theme` | BackTopTheme | light | 主题 |
| `visibleHeight` | string \| number | 200px | 显示阈值 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载自定义按钮内容 |
| `onClick` | Angular 惯用映射 | Angular 用宿主原生 (click)，避免与内部按钮双触发 |

## 文档示例

- `packages/docs/src/app/docs/back-top/demos/back-top-base.ts`
- `packages/docs/src/app/docs/back-top/demos/back-top-duration.ts`
- `packages/docs/src/app/docs/back-top/demos/back-top-theme.ts`
