import { Component } from '@angular/core';
import { TButtonModule, TCommentModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-comment-actions',
  imports: [TCommentModule, TButtonModule],
  template: `
    <ng-template #actionsTpl>
      <t-button size="small" variant="text">回复</t-button>
      <t-button size="small" variant="text">点赞</t-button>
      <t-button size="small" variant="text">收藏</t-button>
    </ng-template>

    <t-comment
      author="张三"
      datetime="2024-01-01 12:00"
      content="actions 传模板时整体渲染，可以放任意操作按钮；传数组时每一项会渲染成文字按钮。"
      [actions]="actionsTpl"
    />
  `,
})
export class DemoCommentActions {}
