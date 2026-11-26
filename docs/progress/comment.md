# 评论 Comment · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/comment/`
- 文档页：`/comment`（`packages/docs/src/app/docs/comment/comment.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 7 |
| 已对齐 | 7 |
| 覆盖率 | 100.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 0（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TComment`（`<t-comment>`）

上游接口 `TdCommentProps`；上游属性 7、已对齐 7（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `actions` | CommentActions | undefined | 操作区 |
| `author` | CommentContent | undefined | 作者 |
| `avatar` | CommentContent | undefined | 头像 |
| `content` | CommentContent | undefined | 正文内容 |
| `datetime` | CommentContent | undefined | 评论时间 |
| `quote` | CommentContent | undefined | 引用内容 |
| `reply` | CommentContent | undefined | 回复内容 |

## 文档示例

- `packages/docs/src/app/docs/comment/demos/comment-actions.ts`
- `packages/docs/src/app/docs/comment/demos/comment-base.ts`
- `packages/docs/src/app/docs/comment/demos/comment-reply.ts`
