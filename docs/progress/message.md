# Message 全局提示 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/message/`
- 文档页：`/message`（`packages/docs/src/app/docs/message/message.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 8 |
| 已对齐 | 5 |
| 覆盖率 | 62.5% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TMessage`（`<t-message>`）

上游接口 `TdMessageProps`；上游属性 8、已对齐 5（62.5%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | string | '' | 消息文字 |
| `theme` | MessageTheme | 'info' | 消息主题 |
| `duration` | number | 3000 | 自动关闭的毫秒数，0 表示不自动关闭 |
| `icon` | boolean | true | 是否显示图标 |
| `closeBtn` | boolean | false | 是否显示关闭按钮 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `close` | MessageCloseEvent | 消息关闭 |
| `closeBtnClick` | MouseEvent | 点击关闭按钮 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出，携带 trigger 与原始事件 |
| `onCloseBtnClick` | Angular 惯用映射 | Angular 用 (closeBtnClick) 输出 |
| `onDurationEnd` | D3 其余组件与边角能力 | 到时关闭会触发 (close)，trigger 为 duration-end |

## 文档示例

- `packages/docs/src/app/docs/message/demos/message-basic.ts`
- `packages/docs/src/app/docs/message/demos/message-duration.ts`
- `packages/docs/src/app/docs/message/demos/message-placement.ts`
