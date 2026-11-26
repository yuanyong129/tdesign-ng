# 对话框 Dialog · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/dialog/`
- 文档页：`/dialog`（`packages/docs/src/app/docs/dialog/dialog.component.ts`）
- 状态：🚧 有深度债 10 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 37 |
| 已对齐 | 22 |
| 覆盖率 | 59.5% |
| 深度债 | 10（D1 0 / D2 10 / D3 0） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TDialog`（`<t-dialog>`）

上游接口 `TdDialogProps`；上游属性 37、已对齐 22（59.5%）；深度债 10 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `visible` | boolean | false | 是否显示对话框，用于双向绑定 |
| `header` | string \| boolean | '' | 标题，传 false 隐藏头部 |
| `body` | string \| undefined | undefined | 内容文本 |
| `footer` | boolean | true | 是否显示底部操作区 |
| `closeBtn` | boolean | true | 是否显示关闭按钮 |
| `confirmBtn` | string \| null | '确定' | 确认按钮文案，null 隐藏 |
| `cancelBtn` | string \| null | '取消' | 取消按钮文案，null 隐藏 |
| `confirmLoading` | boolean | false | 确认按钮是否加载中 |
| `closeOnEscKeydown` | boolean | true | 是否允许按 Esc 关闭 |
| `closeOnOverlayClick` | boolean | true | 是否允许点击遮罩关闭 |
| `showOverlay` | boolean | true | 是否显示遮罩 |
| `theme` | DialogTheme | 'default' | 主题，非 default 时头部显示对应图标 |
| `placement` | DialogPlacement | 'top' | 垂直位置 |
| `top` | string \| number | '10vh' | 距顶部的距离，placement 为 top 时生效 |
| `width` | string \| number | '480px' | 对话框宽度 |
| `mode` | DialogMode | 'modal' | 展示形态 |
| `destroyOnClose` | boolean | false | 关闭时是否销毁内容 |
| `lazy` | boolean | false | 是否懒渲染，首次打开前不创建 DOM |
| `preventScrollThrough` | boolean | true | 是否禁止背景滚动 |
| `zIndex` | number \| undefined | undefined | 层级 |
| `dialogClassName` | string \| string[] \| Record<string, boolean> \| null | null | 对话框元素的附加类名 |
| `dialogStyle` | Record<string, string> \| null | null | 对话框元素的行内样式 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `visibleChange` | boolean | 显示状态变化，用于双向绑定 |
| `close` | DialogCloseEvent | 关闭事件，携带关闭来源 |
| `confirm` | MouseEvent | 点击确认 |
| `cancel` | MouseEvent | 点击取消 |
| `overlayClick` | MouseEvent | 点击遮罩 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `attach` | D2 录入与反馈线 | 对话框固定挂到 body 层级的 fixed 容器，暂不支持自定义挂载点 |
| `confirmOnEnter` | D2 录入与反馈线 | 回车确认尚未实现 |
| `default` | Angular 惯用映射 | 内容通过 ng-content 投影，不需要 default 插槽属性 |
| `draggable` | D2 录入与反馈线 | 拖拽尚未实现，需要时可在外层自行实现 |
| `onBeforeClose` | D2 录入与反馈线 | 暂未暴露关闭前钩子 |
| `onBeforeOpen` | D2 录入与反馈线 | 暂未暴露打开前钩子 |
| `onCancel` | Angular 惯用映射 | Angular 用 (cancel) 输出 |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出，携带 trigger 与原始事件 |
| `onCloseBtnClick` | D2 录入与反馈线 | 关闭按钮会触发 (close)，trigger 为 close-btn |
| `onClosed` | D2 录入与反馈线 | 暂未暴露关闭后回调，可用 (visibleChange) 判断 |
| `onConfirm` | Angular 惯用映射 | Angular 用 (confirm) 输出 |
| `onEscKeydown` | D2 录入与反馈线 | Esc 关闭会触发 (close)，trigger 为 esc |
| `onOpened` | D2 录入与反馈线 | 暂未暴露打开后回调，可用 (visibleChange) 判断 |
| `onOverlayClick` | Angular 惯用映射 | Angular 用 (overlayClick) 输出 |
| `showInAttachedElement` | D2 录入与反馈线 | 同 attach，暂不支持挂到指定元素内 |

## 文档示例

- `packages/docs/src/app/docs/dialog/demos/dialog-basic.ts`
- `packages/docs/src/app/docs/dialog/demos/dialog-custom.ts`
- `packages/docs/src/app/docs/dialog/demos/dialog-placement.ts`
- `packages/docs/src/app/docs/dialog/demos/dialog-theme.ts`
