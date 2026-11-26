# 通知 Notification · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/notification/`
- 文档页：`/notification`（`packages/docs/src/app/docs/notification/notification.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 11 |
| 已对齐 | 7 |
| 覆盖率 | 63.6% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TNotification`（`<t-notification>`）

上游接口 `TdNotificationProps`；上游属性 11、已对齐 7（63.6%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | string | '' | 标题 |
| `content` | string | '' | 内容 |
| `footer` | string \| undefined | undefined | 底部补充内容 |
| `theme` | NotificationTheme | 'info' | 通知主题 |
| `duration` | number | 3000 | 自动关闭的毫秒数，0 表示不自动关闭 |
| `icon` | boolean | true | 是否显示图标 |
| `closeBtn` | boolean | true | 是否显示关闭按钮 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `close` | NotificationCloseEvent | 通知关闭 |
| `closeBtnClick` | MouseEvent | 点击关闭按钮 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | 内容通过 ng-content 与 content 输入提供 |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出，携带 trigger 与原始事件 |
| `onCloseBtnClick` | Angular 惯用映射 | Angular 用 (closeBtnClick) 输出 |
| `onDurationEnd` | D3 其余组件与边角能力 | 到时关闭会触发 (close)，trigger 为 duration-end |

## 文档示例

- `packages/docs/src/app/docs/notification/demos/notification-basic.ts`
- `packages/docs/src/app/docs/notification/demos/notification-custom.ts`
- `packages/docs/src/app/docs/notification/demos/notification-placement.ts`
