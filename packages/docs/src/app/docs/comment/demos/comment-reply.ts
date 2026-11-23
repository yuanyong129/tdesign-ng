import { Component } from '@angular/core';
import { TAvatarModule, TCommentModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-comment-reply',
  imports: [TCommentModule, TAvatarModule],
  template: `
    <ng-template #avatarTpl>
      <t-avatar content="张" />
    </ng-template>

    <ng-template #quoteTpl>
      <t-comment
        [avatar]="avatarTpl"
        author="张三"
        datetime="2024-01-01 11:30"
        content="被引用的评论内容，样式会自动降级为次要文字颜色。"
      />
    </ng-template>

    <ng-template #replyTpl>
      <t-comment
        [avatar]="avatarTpl"
        author="王五"
        datetime="2024-01-01 12:30"
        content="这是嵌套在 reply 里的回复内容。"
      />
    </ng-template>

    <t-comment
      [avatar]="avatarTpl"
      author="李四"
      datetime="2024-01-01 12:00"
      content="评论正文：quote 用于展示被引用的内容，reply 用于展示回复框或嵌套评论。"
      [quote]="quoteTpl"
      [reply]="replyTpl"
    />
  `,
})
export class DemoCommentReply {}
