# 徽标 Badge · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/badge/`
- 文档页：`/badge`（`packages/docs/src/app/docs/badge/badge.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 10 |
| 已对齐 | 9 |
| 覆盖率 | 90.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 2 个 |

## 组件明细

### `TBadge`（`<t-badge>`）

上游接口 `TdBadgeProps`；上游属性 10、已对齐 9（90.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | string \| undefined | undefined | 徽标内容，传字符串时直接显示 |
| `count` | string \| number \| undefined | undefined | 徽标数字 |
| `maxCount` | number | 99 | 封顶数字，超出显示 `${maxCount}+` |
| `dot` | boolean | false | 是否显示为小红点 |
| `shape` | BadgeShape | 'circle' | 徽标形状 |
| `size` | BadgeSize | 'medium' | 徽标尺寸 |
| `showZero` | boolean | false | 数字为 0 时是否显示 |
| `color` | string \| undefined | undefined | 自定义背景色 |
| `offset` | Array<string \| number> \| undefined | undefined | 徽标偏移量，[x, y] |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | 内容通过 ng-content 与 content 输入提供 |

## 文档示例

- `packages/docs/src/app/docs/badge/demos/badge-basic.ts`
- `packages/docs/src/app/docs/badge/demos/badge-shape.ts`
