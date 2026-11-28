# Loading 加载 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/loading/`
- 文档页：`/loading`（`packages/docs/src/app/docs/loading/loading.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 13 |
| 已对齐 | 12 |
| 覆盖率 | 92.3% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TLoading`（`<t-loading>`）

上游接口 `TdLoadingProps`；上游属性 13、已对齐 12（92.3%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | LoadingContent | undefined | 包裹的业务内容，字符串或模板，优先于默认投影 |
| `indicator` | boolean \| LoadingContent | true | 加载图标，true 为默认、false 隐藏，也支持文本或模板 |
| `attach` | LoadingAttachNode | undefined | 挂载节点、选择器或函数，仅无包裹内容或全屏时生效 |
| `loading` | boolean | true | 是否处于加载状态 |
| `text` | LoadingContent | undefined | 加载提示文字 |
| `size` | LoadingSize | 'medium' | 图标尺寸，支持预设或 CSS 尺寸 |
| `fullscreen` | boolean | false | 是否全屏 |
| `showOverlay` | boolean | true | 是否显示全屏、包裹或挂载模式的遮罩 |
| `inheritColor` | boolean | false | 图标是否继承文字颜色 |
| `delay` | number | 0 | 延迟显示的毫秒数 |
| `preventScrollThrough` | boolean | true | 是否禁止背景滚动，仅全屏时生效 |
| `zIndex` | number \| undefined | undefined | 层级 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用常驻 ng-content 包裹业务内容，显式 content 优先 |

## 文档示例

- `packages/docs/src/app/docs/loading/demos/loading-basic.ts`
- `packages/docs/src/app/docs/loading/demos/loading-content.ts`
- `packages/docs/src/app/docs/loading/demos/loading-fullscreen.ts`
