# Alert 警告提醒 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/alert/`
- 文档页：`/alert`（`packages/docs/src/app/docs/alert/alert.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 11 |
| 已对齐 | 8 |
| 覆盖率 | 72.7% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TAlert`（`<t-alert>`）

上游接口 `TdAlertProps`；上游属性 11、已对齐 8（72.7%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `close` | string \| boolean | false | 关闭按钮 |
| `closeBtn` | string \| boolean | false | 是否显示关闭按钮 |
| `icon` | AlertContent | undefined | 自定义图标 |
| `maxLine` | number | 0 | 消息最多行数 |
| `message` | AlertContent | undefined | 消息正文 |
| `operation` | AlertContent | undefined | 操作区 |
| `theme` | AlertTheme | info | 主题 |
| `title` | AlertContent | undefined | 标题 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `close` | AlertCloseEvent | 点击关闭按钮 |
| `closed` | AlertClosedEvent | 关闭动画结束 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载消息主体 |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出，参数为 { e } |
| `onClosed` | Angular 惯用映射 | Angular 用 (closed) 输出，参数为 { e } |

## 文档示例

- `packages/docs/src/app/docs/alert/demos/alert-close.ts`
- `packages/docs/src/app/docs/alert/demos/alert-theme.ts`
- `packages/docs/src/app/docs/alert/demos/alert-title.ts`
