# Calendar 日历 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/calendar/`
- 文档页：`/calendar`（`packages/docs/src/app/docs/calendar/calendar.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 22 |
| 已对齐 | 17 |
| 覆盖率 | 77.3% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TCalendar`（`<t-calendar>`）

上游接口 `TdCalendarProps`；上游属性 22、已对齐 17（77.3%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cell` | string \| TemplateRef<unknown> \| undefined | undefined | 自定义单元格 |
| `cellAppend` | string \| TemplateRef<unknown> \| undefined | undefined | 单元格附加内容 |
| `controllerConfig` | boolean \| CalendarController \| undefined | true | 控制区配置 |
| `fillWithZero` | boolean | true | 日期补零 |
| `firstDayOfWeek` | number \| undefined | undefined | 一周起始日 |
| `format` | string | YYYY-MM-DD | 日期格式 |
| `head` | string \| TemplateRef<unknown> \| undefined | undefined | 控制区标题 |
| `isShowWeekendDefault` | boolean | true | 默认展示周末 |
| `mode` | CalendarMode | month | 展示模式 |
| `month` | string \| number \| undefined | undefined | 月份 |
| `multiple` | boolean | false | 多选 |
| `preventCellContextmenu` | boolean | false | 阻止右键默认行为 |
| `range` | CalendarValue[] \| undefined | undefined | 日期范围 |
| `theme` | CalendarTheme | full | 风格 |
| `value` | CalendarValue \| CalendarValue[] \| undefined | undefined | 选中日期 |
| `week` | string[] \| TemplateRef<unknown> \| undefined | undefined | 自定义表头 |
| `year` | string \| number \| undefined | undefined | 年份 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `cellClick` | CalendarCellEvent | 点击单元格 |
| `cellDoubleClick` | CalendarCellEvent | 双击单元格 |
| `cellRightClick` | CalendarCellEvent | 右键单元格 |
| `controllerChange` | CalendarControllerOptions | 控制区变化 |
| `monthChange` | CalendarMonthChangeEvent | 年月变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onCellClick` | Angular 惯用映射 | Angular 用 (cellClick) 输出表达单元格点击事件 |
| `onCellDoubleClick` | Angular 惯用映射 | Angular 用 (cellDoubleClick) 输出表达单元格双击事件 |
| `onCellRightClick` | Angular 惯用映射 | Angular 用 (cellRightClick) 输出表达单元格右键事件 |
| `onControllerChange` | Angular 惯用映射 | Angular 用 (controllerChange) 输出表达视图切换 |
| `onMonthChange` | Angular 惯用映射 | Angular 用 (monthChange) 输出表达月份变化 |

## 文档示例

- `packages/docs/src/app/docs/calendar/demos/calendar-base.ts`
- `packages/docs/src/app/docs/calendar/demos/calendar-controlled.ts`
- `packages/docs/src/app/docs/calendar/demos/calendar-custom.ts`
