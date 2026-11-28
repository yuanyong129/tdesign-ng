# Watermark 水印 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/watermark/`
- 文档页：`/watermark`（`packages/docs/src/app/docs/watermark/watermark.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 17 |
| 已对齐 | 16 |
| 覆盖率 | 94.1% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TWatermark`（`<t-watermark>`）

上游接口 `TdWatermarkProps`；上游属性 17、已对齐 16（94.1%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `alpha` | number | 1 | 透明度 |
| `content` | WatermarkNode | undefined | 内容 |
| `height` | number \| undefined | undefined | 高度 |
| `isRepeat` | boolean | true | 是否重复 |
| `layout` | WatermarkLayout | rectangular | 排布方式 |
| `lineSpace` | number | 16 | 行间距 |
| `movable` | boolean | false | 是否移动 |
| `moveInterval` | number | 3000 | 移动周期 |
| `offset` | number[] \| undefined | undefined | 偏移 |
| `removable` | boolean | true | 是否允许删除 |
| `rotate` | number | -22 | 旋转角度 |
| `watermarkContent` | WatermarkContent \| undefined | undefined | 水印内容 |
| `width` | number \| undefined | undefined | 宽度 |
| `x` | number \| undefined | undefined | 水平间距 |
| `y` | number \| undefined | undefined | 垂直间距 |
| `zIndex` | number \| undefined | undefined | 层级 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载被水印覆盖的内容 |

## 文档示例

- `packages/docs/src/app/docs/watermark/demos/watermark-base.ts`
- `packages/docs/src/app/docs/watermark/demos/watermark-movable.ts`
- `packages/docs/src/app/docs/watermark/demos/watermark-multi.ts`
