# Image 图片 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/image/`
- 文档页：`/image`（`packages/docs/src/app/docs/image/image.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 17 |
| 已对齐 | 15 |
| 覆盖率 | 88.2% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TImage`（`<t-image>`）

上游接口 `TdImageProps`；上游属性 17、已对齐 15（88.2%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `alt` | string | '' | 图片描述 |
| `error` | ImageContent | undefined | 加载失败提示 |
| `fallback` | string | '' | 备用图片地址 |
| `fit` | ImageFit | 'fill' | 图片填充方式 |
| `gallery` | boolean | false | 是否开启相册阴影 |
| `lazy` | boolean | false | 是否懒加载 |
| `loading` | ImageContent | undefined | 加载中提示 |
| `overlayContent` | ImageContent | undefined | 浮层内容 |
| `overlayTrigger` | ImageOverlayTrigger | 'always' | 浮层显示时机 |
| `placeholder` | ImageContent | undefined | 占位内容 |
| `position` | string | 'center' | 图片对齐位置 |
| `referrerpolicy` | ImageReferrerpolicy | 'strict-origin-when-cross-origin' | referrer 策略 |
| `shape` | ImageShape | 'square' | 图片形状 |
| `src` | string \| File \| undefined | undefined | 图片地址 |
| `srcset` | ImageSrcset \| undefined | undefined | 响应式图片地址 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `load` | ImageEvent | 图片加载完成 |
| `error` | ImageEvent | 图片加载失败 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onError` | Angular 惯用映射 | Angular 用 (error) 输出，参数 { e } |
| `onLoad` | Angular 惯用映射 | Angular 用 (load) 输出，参数 { e } |

## 文档示例

- `packages/docs/src/app/docs/image/demos/image-base.ts`
- `packages/docs/src/app/docs/image/demos/image-fit.ts`
- `packages/docs/src/app/docs/image/demos/image-preview.ts`
