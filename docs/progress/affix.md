# Affix 固钉 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/affix/`
- 文档页：`/affix`（`packages/docs/src/app/docs/affix/affix.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 7 |
| 已对齐 | 5 |
| 覆盖率 | 71.4% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TAffix`（`<t-affix>`）

上游接口 `TdAffixProps`；上游属性 7、已对齐 5（71.4%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `container` | AffixScrollContainer | window | 滚动容器 |
| `content` | AffixContent | undefined | 内容 |
| `offsetBottom` | number \| null | 0 | 距离底部的偏移 |
| `offsetTop` | number \| null | 0 | 距离顶部的偏移 |
| `zIndex` | number \| undefined | undefined | 吸附时的层级 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `fixedChange` | AffixFixedChangeEvent | 吸附状态变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载被吸附的内容 |
| `onFixedChange` | Angular 惯用映射 | Angular 用 (fixedChange) 输出 { affixed, top }，且只在吸附状态翻转时派发（避免滚动期间反复变更检测） |

## 文档示例

- `packages/docs/src/app/docs/affix/demos/affix-base.ts`
- `packages/docs/src/app/docs/affix/demos/affix-container.ts`
- `packages/docs/src/app/docs/affix/demos/affix-fixed-change.ts`
