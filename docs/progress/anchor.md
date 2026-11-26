# 锚点 Anchor · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/anchor/`
- 文档页：`/anchor`（`packages/docs/src/app/docs/anchor/anchor.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 12 |
| 已对齐 | 10 |
| 覆盖率 | 83.3% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TAnchor`（`<t-anchor>`）

上游接口 `TdAnchorProps`；上游属性 8、已对齐 6（75.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `affixProps` | AnchorAffixProps \| undefined | undefined | 固钉参数 |
| `bounds` | number | 5 | 判定激活项的偏移 |
| `container` | AnchorScrollContainer | window | 滚动容器 |
| `cursor` | AnchorContent | undefined | 自定义游标 |
| `size` | SizeType | medium | 尺寸 |
| `targetOffset` | number | 0 | 滚动目标偏移 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | AnchorChangeEvent | 激活链接变化 |
| `click` | AnchorClickEvent | 点击链接 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数 { href, previousHref } |
| `onClick` | Angular 惯用映射 | Angular 用 (click) 输出，参数 { href, e } |

### `TAnchorItem`（`<t-anchor-item>`）

上游接口 `TdAnchorItemProps`；上游属性 4、已对齐 4（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `href` | string |  | 链接 |
| `target` | AnchorTarget | _self | 跳转方式 |
| `title` | AnchorContent | '' | 链接文本 |
| `customScroll` | boolean | false | 是否自定义滚动 |

## 文档示例

- `packages/docs/src/app/docs/anchor/demos/anchor-base.ts`
- `packages/docs/src/app/docs/anchor/demos/anchor-container.ts`
- `packages/docs/src/app/docs/anchor/demos/anchor-offset.ts`
