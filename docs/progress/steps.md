# 步骤条 Steps · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/steps/`
- 文档页：`/steps`（`packages/docs/src/app/docs/steps/steps.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 17 |
| 已对齐 | 13 |
| 覆盖率 | 76.5% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TStepItem`（`<t-step-item>`）

上游接口 `TdStepItemProps`；上游属性 7、已对齐 6（85.7%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | StepContent | undefined | 步骤描述 |
| `extra` | StepContent | undefined | 附加内容 |
| `icon` | StepIcon | undefined | 图标 |
| `status` | StepStatus | default | 状态 |
| `title` | StepContent | undefined | 标题 |
| `value` | StepValue \| undefined | undefined | 唯一标识 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载步骤描述 |

### `TSteps`（`<t-steps>`）

上游接口 `TdStepsProps`；上游属性 10、已对齐 7（70.0%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `current` | StepValue \| undefined | undefined | 当前步骤 |
| `defaultCurrent` | StepValue \| undefined | undefined | 默认当前步骤 |
| `layout` | StepLayout | horizontal | 排列方向 |
| `options` | StepOption[] \| undefined | undefined | 选项列表 |
| `readonly` | boolean | false | 是否只读 |
| `separator` | StepSeparator | line | 连接线样式 |
| `theme` | StepTheme | default | 主题 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `currentChange` | StepValue | 步骤变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `modelValue` | Angular 惯用映射 | Angular 用 [(current)] 双向绑定 |
| `onChange` | Angular 惯用映射 | Angular 用 (currentChange) 输出，参数为新的 current |
| `sequence` | D3 其余组件与边角能力 | [D3] 依赖反转渲染顺序，投影内容无法重排且会错位连接线伪元素 |

## 文档示例

- `packages/docs/src/app/docs/steps/demos/steps-base.ts`
- `packages/docs/src/app/docs/steps/demos/steps-dot.ts`
- `packages/docs/src/app/docs/steps/demos/steps-vertical.ts`
