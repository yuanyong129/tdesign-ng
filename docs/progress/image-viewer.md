# ImageViewer 图片预览 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/image-viewer/`
- 文档页：`/image-viewer`（`packages/docs/src/app/docs/image-viewer/image-viewer.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 23 |
| 已对齐 | 17 |
| 覆盖率 | 73.9% |
| 深度债 | 2（D1 0 / D2 1 / D3 1） |
| Angular 惯用映射 | 4（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TImageViewer`（`<t-image-viewer>`）

上游接口 `TdImageViewerProps`；上游属性 23、已对齐 17（73.9%）；深度债 2 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `closeBtn` | boolean \| ImageViewerContent | true | 关闭按钮 |
| `closeOnEscKeydown` | boolean | true | 是否允许按 Esc 关闭 |
| `closeOnOverlay` | boolean | false | 是否允许点击遮罩关闭 |
| `draggable` | boolean \| undefined | undefined | 是否允许拖拽 |
| `imageReferrerpolicy` | ImageViewerReferrerpolicy \| undefined | undefined | referrer 策略 |
| `imageScale` | Partial<ImageScale> \| undefined | undefined | 缩放配置 |
| `images` | ImageViewerImage[] | [] | 图片列表 |
| `index` | number \| undefined | undefined | 当前图片序号 |
| `defaultIndex` | number | 0 | 当前图片序号初始值 |
| `mode` | ImageViewerMode | 'modal' | 展示形态 |
| `navigationArrow` | boolean \| ImageViewerContent | true | 切换箭头 |
| `showOverlay` | boolean \| undefined | undefined | 是否显示遮罩 |
| `title` | ImageViewerContent | undefined | 标题 |
| `trigger` | ImageViewerContent | undefined | 自定义触发器 |
| `visible` | boolean \| undefined | undefined | 是否显示预览器 |
| `defaultVisible` | boolean | false | 是否默认显示 |
| `zIndex` | number \| undefined | undefined | 层级 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `visibleChange` | boolean | 显示状态变化 |
| `close` | ImageViewerCloseEvent | 关闭 |
| `indexChange` | ImageViewerIndexChangeEvent | 当前图片变化 |
| `download` | string \| File | 下载 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `attach` | D2 录入与反馈线 | [D2] Angular 不做 Teleport，预览层本身就是 position: fixed 全屏层 |
| `modelValue` | Angular 惯用映射 | Angular 用 [(visible)] 双向绑定 + (visibleChange) 表达同一语义 |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出，参数 { trigger, e } |
| `onDownload` | Angular 惯用映射 | Angular 用 (download) 输出，参数 string \| File |
| `onIndexChange` | Angular 惯用映射 | Angular 用 (indexChange) 输出，参数 { index, trigger } |
| `viewerScale` | D3 其余组件与边角能力 | [D3] 上游桌面端 image-viewer 未消费该属性，属旧版死配置 |

## 文档示例

- `packages/docs/src/app/docs/image-viewer/demos/image-viewer-base.ts`
- `packages/docs/src/app/docs/image-viewer/demos/image-viewer-keyboard.ts`
- `packages/docs/src/app/docs/image-viewer/demos/image-viewer-tools.ts`
