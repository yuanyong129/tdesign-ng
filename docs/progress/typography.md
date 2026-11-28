# Typography 排版 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/typography/`
- 文档页：`/typography`（`packages/docs/src/app/docs/typography/typography.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 20 |
| 已对齐 | 17 |
| 覆盖率 | 85.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TParagraph`（`<t-paragraph>`）

上游接口 `TdParagraphProps`；上游属性 3、已对齐 2（66.7%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | TypographyContent | undefined | 段落内容 |
| `ellipsis` | boolean \| TypographyEllipsis | false | 省略 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载段落文本 |

### `TText`（`<t-text>`）

上游接口 `TdTextProps`；上游属性 13、已对齐 12（92.3%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | TypographyContent | undefined | 文本内容 |
| `copyable` | boolean \| TypographyCopyable | false | 是否显示复制按钮，可配置复制文本、后缀模板、提示及成功回调 |
| `code` | boolean | false | 代码样式 |
| `delete` | boolean | false | 删除线 |
| `disabled` | boolean | false | 禁用 |
| `ellipsis` | boolean \| TypographyEllipsis | false | 省略 |
| `italic` | boolean | false | 斜体 |
| `keyboard` | boolean | false | 键盘样式 |
| `mark` | string \| boolean | false | 标记 |
| `strong` | boolean | false | 加粗 |
| `theme` | TypographyTheme \| undefined | undefined | 文本主题 |
| `underline` | boolean | false | 下划线 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载文本内容 |

### `TTitle`（`<t-title>`）

上游接口 `TdTitleProps`；上游属性 4、已对齐 3（75.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | TypographyContent | undefined | 标题内容 |
| `ellipsis` | boolean \| TypographyEllipsis | false | 省略 |
| `level` | TypographyLevel | h1 | 层级 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载标题文本 |

## 文档示例

- `packages/docs/src/app/docs/typography/demos/typography-base.ts`
- `packages/docs/src/app/docs/typography/demos/typography-copyable.ts`
- `packages/docs/src/app/docs/typography/demos/typography-paragraph.ts`
- `packages/docs/src/app/docs/typography/demos/typography-slot.ts`
- `packages/docs/src/app/docs/typography/demos/typography-title.ts`
