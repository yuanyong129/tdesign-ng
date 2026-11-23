import { Component } from '@angular/core';
import { TCommentModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-comment-base',
  imports: [TCommentModule],
  template: `
    <t-comment
      [avatar]="avatar"
      author="张三"
      datetime="2024-01-01 12:00"
      content="评论内容：这个组件的 API 设计得很清楚，文档也写得很细。"
      [actions]="actions"
    />
  `,
})
export class DemoCommentBase {
  protected readonly avatar =
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%230052d9'/%3E%3C/svg%3E";

  protected readonly actions = ['回复', '点赞'];
}
