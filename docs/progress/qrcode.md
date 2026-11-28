# QRCode 二维码 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/qrcode/`
- 文档页：`/qrcode`（`packages/docs/src/app/docs/qrcode/qrcode.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 12 |
| 已对齐 | 11 |
| 覆盖率 | 91.7% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TQRCode`（`<t-qrcode>`）

上游接口 `TdQRCodeProps`；上游属性 12、已对齐 11（91.7%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `bgColor` | string | '' | 背景色 |
| `borderless` | boolean | false | 无边框 |
| `color` | string | '' | 前景色 |
| `icon` | string | '' | 图标地址 |
| `iconSize` | number \| QRIconSize | 40 | 图标尺寸 |
| `level` | QRLevel | 'M' | 纠错级别 |
| `size` | number | 160 | 尺寸 |
| `status` | QRStatus | 'active' | 状态 |
| `statusRender` | TemplateRef<QRStatusRenderContext> \| undefined | undefined | 自定义状态内容 |
| `type` | QRType | 'canvas' | 渲染方式 |
| `value` | string | '' | 二维码内容 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `refresh` | void | 刷新 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onRefresh` | Angular 惯用映射 | Angular 用 (refresh) 输出，过期遮罩里的刷新按钮触发 |

## 文档示例

- `packages/docs/src/app/docs/qrcode/demos/qrcode-base.ts`
- `packages/docs/src/app/docs/qrcode/demos/qrcode-size.ts`
- `packages/docs/src/app/docs/qrcode/demos/qrcode-status.ts`
