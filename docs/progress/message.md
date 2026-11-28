# Message 全局提示 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/message/`
- 文档页：`/message`（`packages/docs/src/app/docs/message/message.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 8 |
| 已对齐 | 5 |
| 覆盖率 | 62.5% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TMessage`（`<t-message>`）

上游接口 `TdMessageProps`；上游属性 8、已对齐 5（62.5%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | MessageContent | '' | 消息内容，支持字符串或模板 |
| `theme` | MessageTheme | 'info' | 消息主题 |
| `duration` | number | 3000 | 自动关闭的毫秒数，0 表示不自动关闭 |
| `icon` | boolean \| MessageContent | true | 图标，布尔值控制默认图标，也支持字符串或模板 |
| `closeBtn` | boolean \| MessageContent | false | 关闭入口，布尔值控制默认按钮，也支持字符串或模板 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `close` | MessageCloseEvent | 消息关闭 |
| `closeBtnClick` | MouseEvent \| KeyboardEvent | 点击关闭按钮 |
| `durationEnd` | void | 自动关闭倒计时结束 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出，携带 trigger 与原始事件 |
| `onCloseBtnClick` | Angular 惯用映射 | Angular 用 (closeBtnClick) 输出 |
| `onDurationEnd` | Angular 惯用映射 | Angular 用独立 (durationEnd) 输出，仅自动到时触发 |

## 文档示例

- `packages/docs/src/app/docs/message/demos/message-attachment.ts`
- `packages/docs/src/app/docs/message/demos/message-basic.ts`
- `packages/docs/src/app/docs/message/demos/message-content.ts`
- `packages/docs/src/app/docs/message/demos/message-duration.ts`
- `packages/docs/src/app/docs/message/demos/message-placement.ts`
