# 抽屉 Drawer · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/drawer/`
- 文档页：`/drawer`（`packages/docs/src/app/docs/drawer/drawer.component.ts`）
- 状态：🚧 有深度债 8 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 31 |
| 已对齐 | 18 |
| 覆盖率 | 58.1% |
| 深度债 | 8（D1 0 / D2 8 / D3 0） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TDrawer`（`<t-drawer>`）

上游接口 `TdDrawerProps`；上游属性 31、已对齐 18（58.1%）；深度债 8 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `visible` | boolean | false | 是否显示抽屉，用于双向绑定 |
| `header` | string \| boolean | '' | 标题，传 false 隐藏头部 |
| `body` | string \| undefined | undefined | 内容文本 |
| `footer` | boolean | true | 是否显示底部操作区 |
| `closeBtn` | boolean | true | 是否显示关闭按钮 |
| `confirmBtn` | string \| null | '确定' | 确认按钮文案，null 隐藏 |
| `cancelBtn` | string \| null | '取消' | 取消按钮文案，null 隐藏 |
| `closeOnEscKeydown` | boolean | true | 是否允许按 Esc 关闭 |
| `closeOnOverlayClick` | boolean | true | 是否允许点击遮罩关闭 |
| `showOverlay` | boolean | true | 是否显示遮罩 |
| `placement` | DrawerPlacement | 'right' | 出现方向 |
| `size` | string | '27.5%' | 抽屉尺寸，左右方向为宽度、上下方向为高度 |
| `mode` | DrawerMode | 'overlay' | 与页面的关系 |
| `destroyOnClose` | boolean | false | 关闭时是否销毁内容 |
| `lazy` | boolean | false | 是否懒渲染，首次打开前不创建 DOM |
| `preventScrollThrough` | boolean | true | 是否禁止背景滚动 |
| `zIndex` | number \| undefined | undefined | 层级 |
| `drawerClassName` | string \| string[] \| Record<string, boolean> \| null | null | 抽屉元素的附加类名 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `visibleChange` | boolean | 显示状态变化，用于双向绑定 |
| `close` | DrawerCloseEvent | 关闭事件，携带关闭来源 |
| `confirm` | MouseEvent | 点击确认 |
| `cancel` | MouseEvent | 点击取消 |
| `overlayClick` | MouseEvent | 点击遮罩 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `attach` | D2 录入与反馈线 | 抽屉固定挂到 body 层级的 fixed 容器，暂不支持自定义挂载点 |
| `default` | Angular 惯用映射 | 内容通过 ng-content 投影，不需要 default 插槽属性 |
| `onBeforeClose` | D2 录入与反馈线 | 暂未暴露关闭前钩子 |
| `onBeforeOpen` | D2 录入与反馈线 | 暂未暴露打开前钩子 |
| `onCancel` | Angular 惯用映射 | Angular 用 (cancel) 输出 |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出，携带 trigger 与原始事件 |
| `onCloseBtnClick` | D2 录入与反馈线 | 关闭按钮会触发 (close)，trigger 为 close-btn |
| `onConfirm` | Angular 惯用映射 | Angular 用 (confirm) 输出 |
| `onEscKeydown` | D2 录入与反馈线 | Esc 关闭会触发 (close)，trigger 为 esc |
| `onOverlayClick` | Angular 惯用映射 | Angular 用 (overlayClick) 输出 |
| `onSizeDragEnd` | D2 录入与反馈线 | 尺寸拖拽未实现，因此没有该事件 |
| `showInAttachedElement` | D2 录入与反馈线 | 同 attach，暂不支持挂到指定元素内 |
| `sizeDraggable` | D2 录入与反馈线 | 拖拽调整尺寸尚未实现 |

## 文档示例

- `packages/docs/src/app/docs/drawer/demos/drawer-basic.ts`
- `packages/docs/src/app/docs/drawer/demos/drawer-custom.ts`
- `packages/docs/src/app/docs/drawer/demos/drawer-placement.ts`
