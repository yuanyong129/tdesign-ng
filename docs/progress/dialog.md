# Dialog 对话框 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/dialog/`
- 文档页：`/dialog`（`packages/docs/src/app/docs/dialog/dialog.component.ts`）
- 状态：🚧 有深度债 3 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 37 |
| 已对齐 | 23 |
| 覆盖率 | 62.2% |
| 深度债 | 3（D1 0 / D2 3 / D3 0） |
| Angular 惯用映射 | 11（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 6 个 |

## 组件明细

### `TDialog`（`<t-dialog>`）

上游接口 `TdDialogProps`；上游属性 37、已对齐 23（62.2%）；深度债 3 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `visible` | boolean \| undefined | undefined | 受控显隐，未传时由实例方法管理，缺省关闭 |
| `header` | boolean \| DialogContent | '' | 标题文本或模板，false 隐藏标题但保留关闭入口 |
| `body` | DialogContent | undefined | 正文字符串或模板，显式值优先于投影 |
| `footer` | boolean \| DialogContent | true | 底部内容，true 使用默认/投影底部，false 隐藏，文本/模板覆盖投影 |
| `closeBtn` | boolean \| DialogContent | true | 关闭入口，支持布尔值、文本或模板 |
| `confirmBtn` | DialogActionButton | '确定' | 确认按钮文本、配置或替换模板，null 隐藏 |
| `cancelBtn` | DialogActionButton | '取消' | 取消按钮文本、配置或替换模板，null 隐藏 |
| `confirmLoading` | boolean | false | 确认按钮是否加载中 |
| `confirmOnEnter` | boolean | false | 是否允许非编辑区域按 Enter 确认 |
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
| `confirm` | MouseEvent \| KeyboardEvent | 点击确认 |
| `cancel` | MouseEvent | 点击取消 |
| `overlayClick` | MouseEvent | 点击遮罩 |
| `closeBtnClick` | MouseEvent \| KeyboardEvent | 点击或键盘激活关闭入口 |
| `escKeydown` | KeyboardEvent | 顶层对话框收到 Esc |
| `beforeOpen` | void | 实际打开前通知，不用于拦截 |
| `beforeClose` | void | 实际关闭前通知，不用于拦截 |
| `opened` | void | 打开状态渲染完成 |
| `closed` | void | 关闭状态渲染完成 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `attach` | D2 录入与反馈线 | [D2] 当前在原模板位置渲染，尚未接入自定义挂载点 |
| `default` | Angular 惯用映射 | 内容通过 ng-content 投影，不需要 default 插槽属性 |
| `draggable` | D2 录入与反馈线 | [D2] 对话框拖动尚未实现，留到挂载和内容配置之后 |
| `onBeforeClose` | Angular 惯用映射 | Angular 用 (beforeClose) 输出，通知实际状态变化，不是拦截器 |
| `onBeforeOpen` | Angular 惯用映射 | Angular 用 (beforeOpen) 输出，通知实际状态变化，不是拦截器 |
| `onCancel` | Angular 惯用映射 | Angular 用 (cancel) 输出 |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出，携带 trigger 与原始事件 |
| `onCloseBtnClick` | Angular 惯用映射 | Angular 用独立 (closeBtnClick) 输出，键盘激活也携带原事件 |
| `onClosed` | Angular 惯用映射 | Angular 用 (closed) 输出，表示关闭状态渲染完成，不承诺退出动画时长 |
| `onConfirm` | Angular 惯用映射 | Angular 用 (confirm) 输出 |
| `onEscKeydown` | Angular 惯用映射 | Angular 用独立 (escKeydown) 输出，禁用 Esc 关闭时仍通知 |
| `onOpened` | Angular 惯用映射 | Angular 用 (opened) 输出，表示打开状态渲染完成，不承诺退出动画时长 |
| `onOverlayClick` | Angular 惯用映射 | Angular 用 (overlayClick) 输出 |
| `showInAttachedElement` | D2 录入与反馈线 | [D2] 依赖 attach 的局部显示与定位，后续挂载批次实现 |

## 文档示例

- `packages/docs/src/app/docs/dialog/demos/dialog-basic.ts`
- `packages/docs/src/app/docs/dialog/demos/dialog-content.ts`
- `packages/docs/src/app/docs/dialog/demos/dialog-custom.ts`
- `packages/docs/src/app/docs/dialog/demos/dialog-lifecycle.ts`
- `packages/docs/src/app/docs/dialog/demos/dialog-placement.ts`
- `packages/docs/src/app/docs/dialog/demos/dialog-theme.ts`
