# 空状态 Empty · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/empty/`
- 文档页：`/empty`（`packages/docs/src/app/docs/empty/empty.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 7 |
| 已对齐 | 6 |
| 覆盖率 | 85.7% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TEmpty`（`<t-empty>`）

上游接口 `TdEmptyProps`；上游属性 7、已对齐 6（85.7%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | EmptyType | 'empty' | 空状态类型 |
| `size` | EmptySize | 'medium' | 尺寸 |
| `title` | string \| undefined | undefined | 标题，不传时按 type 使用内置文案 |
| `description` | string \| undefined | undefined | 描述文字 |
| `image` | string \| undefined | undefined | 自定义图片地址，替换内置插图 |
| `imageStyle` | Record<string, string> \| undefined | undefined | 图片样式 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `action` | Angular 惯用映射 | Angular 用 <t-button tEmptyAction> 投影操作区，不是 TNode 属性 |

## 文档示例

- `packages/docs/src/app/docs/empty/demos/empty-basic.ts`
- `packages/docs/src/app/docs/empty/demos/empty-custom.ts`
- `packages/docs/src/app/docs/empty/demos/empty-size.ts`
- `packages/docs/src/app/docs/empty/demos/empty-type.ts`
