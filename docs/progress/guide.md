# Guide 引导 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/guide/`
- 文档页：`/guide`（`packages/docs/src/app/docs/guide/guide.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 21 |
| 已对齐 | 15 |
| 覆盖率 | 71.4% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 6（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TGuide`（`<t-guide>`）

上游接口 `TdGuideProps`；上游属性 21、已对齐 15（71.4%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `counter` | GuideContent | undefined | 计数器 |
| `current` | number \| undefined | undefined | 当前步骤 |
| `defaultCurrent` | number \| undefined | undefined | 默认步骤 |
| `finishButtonProps` | GuideButtonProps \| undefined | undefined | 完成按钮 |
| `hideCounter` | boolean | false | 隐藏计数器 |
| `hidePrev` | boolean | false | 隐藏上一步 |
| `hideSkip` | boolean | false | 隐藏跳过 |
| `highlightPadding` | number | 8 | 高亮内边距 |
| `mode` | GuideMode | popup | 展示模式 |
| `nextButtonProps` | GuideButtonProps \| undefined | undefined | 下一步按钮 |
| `prevButtonProps` | GuideButtonProps \| undefined | undefined | 上一步按钮 |
| `showOverlay` | boolean | true | 展示遮罩 |
| `skipButtonProps` | GuideButtonProps \| undefined | undefined | 跳过按钮 |
| `steps` | GuideStep[] \| undefined | undefined | 步骤列表 |
| `zIndex` | number | 999999 | 层级 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | GuideChangeContext | 步骤变化 |
| `currentChange` | number | 当前步骤变化 |
| `finish` | GuideFinishContext | 完成 |
| `next` | GuideNextContext | 下一步 |
| `prev` | GuidePrevContext | 上一步 |
| `skip` | GuideSkipContext | 跳过 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `modelValue` | Angular 惯用映射 | [D3] Angular 用 current 单项绑定 + (change)/(currentChange) 表达向导当前步，未提供双向绑定语法糖 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数 GuideChangeContext |
| `onFinish` | Angular 惯用映射 | Angular 用 (finish) 输出，参数 GuideFinishContext |
| `onNextStepClick` | Angular 惯用映射 | Angular 用 (next) 输出 |
| `onPrevStepClick` | Angular 惯用映射 | Angular 用 (prev) 输出 |
| `onSkip` | Angular 惯用映射 | Angular 用 (skip) 输出 |

## 文档示例

- `packages/docs/src/app/docs/guide/demos/guide-base.ts`
- `packages/docs/src/app/docs/guide/demos/guide-custom.ts`
- `packages/docs/src/app/docs/guide/demos/guide-mode.ts`
