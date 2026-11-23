import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoCommentActions } from './demos/comment-actions';
import { DemoCommentBase } from './demos/comment-base';
import { DemoCommentReply } from './demos/comment-reply';

@Component({
  selector: 'comment-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoCommentActions, DemoCommentBase, DemoCommentReply],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">评论 Comment</h1>
      <p class="docs-page__lead">
        评论用于展示单条用户评论：头像、作者与时间、正文、引用内容、操作区，以及可选的回复区。
      </p>

      <docs-demo
        id="comment-base"
        title="基础用法"
        description="avatar 传图片地址时渲染为头像图片，author 与 datetime 组成作者信息；actions 传数组时每一项渲染为文字按钮。"
      >
        <demo-comment-base />
      </docs-demo>

      <docs-demo
        id="comment-reply"
        title="引用与回复"
        description="quote 展示被引用的评论，样式自动降级为次要文字颜色；reply 渲染在根节点下方的回复区，可以嵌套另一个 t-comment。"
      >
        <demo-comment-reply />
      </docs-demo>

      <docs-demo
        id="comment-actions"
        title="自定义操作区"
        description="actions 也可以是模板，此时整体渲染，可以放任意按钮。"
      >
        <demo-comment-actions />
      </docs-demo>

      <h2 class="docs-section__title" id="comment-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TComment" />
      </div>

      <docs-page-nav current="/comment" />
    </article>
  `,
})
export class CommentDocs {}
