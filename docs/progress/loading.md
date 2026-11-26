# 加载 Loading · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/loading/`
- 文档页：`/loading`（`packages/docs/src/app/docs/loading/loading.component.ts`）
- 状态：🚧 有深度债 3 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 13 |
| 已对齐 | 9 |
| 覆盖率 | 69.2% |
| 深度债 | 3（D1 0 / D2 0 / D3 3） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 2 个 |

## 组件明细

### `TLoading`（`<t-loading>`）

上游接口 `TdLoadingProps`；上游属性 13、已对齐 9（69.2%）；深度债 3 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `loading` | boolean | true | 是否处于加载状态 |
| `text` | string \| undefined | undefined | 加载提示文字 |
| `size` | LoadingSize | 'medium' | 图标尺寸 |
| `fullscreen` | boolean | false | 是否全屏 |
| `showOverlay` | boolean | true | 是否显示遮罩，仅全屏时生效 |
| `inheritColor` | boolean | false | 图标是否继承文字颜色 |
| `delay` | number | 0 | 延迟显示的毫秒数 |
| `preventScrollThrough` | boolean | true | 是否禁止背景滚动，仅全屏时生效 |
| `zIndex` | number \| undefined | undefined | 层级 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `attach` | D3 其余组件与边角能力 | 暂不支持挂到指定元素，全屏模式固定挂到 body |
| `content` | D3 其余组件与边角能力 | 需要把加载态包在内容外层时，用 flex/relative 容器自行组合 |
| `default` | Angular 惯用映射 | 同 content，暂未提供包裹内容的插槽 |
| `indicator` | D3 其余组件与边角能力 | 自定义加载图标尚未实现，使用内置的渐变环 |

## 文档示例

- `packages/docs/src/app/docs/loading/demos/loading-basic.ts`
- `packages/docs/src/app/docs/loading/demos/loading-fullscreen.ts`
