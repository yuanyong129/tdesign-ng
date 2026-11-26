# 标签 Tag · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/tag/`
- 文档页：`/tag`（`packages/docs/src/app/docs/tag/tag.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 14 |
| 已对齐 | 10 |
| 覆盖率 | 71.4% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 4（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TTag`（`<t-tag>`）

上游接口 `TdTagProps`；上游属性 14、已对齐 10（71.4%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | string | '' | 标签文字 |
| `theme` | TagTheme | 'default' | 标签主题 |
| `variant` | TagVariant | 'dark' | 标签变体 |
| `shape` | TagShape | 'square' | 标签形状 |
| `size` | TagSize | 'medium' | 标签尺寸 |
| `closable` | boolean | false | 是否可关闭 |
| `disabled` | boolean | false | 是否禁用 |
| `maxWidth` | string \| number \| undefined | undefined | 文字最大宽度，超出省略 |
| `color` | string \| undefined | undefined | 自定义颜色，会按亮度自动选择文字颜色 |
| `title` | string \| boolean \| undefined | undefined | title 提示，false 关闭、true 使用文字内容 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `close` | MouseEvent | 关闭标签 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | 内容通过 ng-content 与 content 输入提供 |
| `icon` | Angular 惯用映射 | Angular 用 <t-icon tTagIcon> 投影，不是输入属性 |
| `onClick` | Angular 惯用映射 | Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出 |
| `onClose` | Angular 惯用映射 | Angular 用 (close) 输出 |

## 文档示例

- `packages/docs/src/app/docs/tag/demos/tag-basic.ts`
- `packages/docs/src/app/docs/tag/demos/tag-closable.ts`
- `packages/docs/src/app/docs/tag/demos/tag-color.ts`
- `packages/docs/src/app/docs/tag/demos/tag-shape.ts`
- `packages/docs/src/app/docs/tag/demos/tag-variant.ts`
