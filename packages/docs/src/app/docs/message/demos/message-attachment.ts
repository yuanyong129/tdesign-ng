import { Component, inject, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TCard, TInput, TMessageService, MESSAGE_CONFIG, type MessageAttachNode } from '@tdesign-ng/components';

@Component({
  selector: 'demo-message-attachment',
  imports: [TButton, TCard, TInput],
  providers: [TMessageService, { provide: MESSAGE_CONFIG, useValue: { attach: '#message-attach-a', duration: 0, zIndex: 7000, style: { '--feedback-default': 'ready' } } }],
  template: `
    <ng-template #content>
      <span class="attached-message-label">{{ label() }}</span>
      <t-button class="attached-message-action" size="small" variant="text" (click)="count.set(count() + 1)">计数 {{ count() }}</t-button>
      <label>草稿<t-input class="attached-message-draft" size="small" style="width:120px" /></label>
    </ng-template>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
      @if (showA()) { <t-card id="message-attach-a" class="feedback-target-a" title="挂载区 A" bordered [bodyStyle]="{height:'180px'}" style="display:block;transform:translateZ(0)">此区域可独立销毁</t-card> }
      <t-card id="message-attach-b" class="feedback-target-b" title="挂载区 B" bordered [bodyStyle]="{height:'180px'}" style="display:block;transform:translateZ(0)">不同挂载点各自分组</t-card>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
      <t-button variant="outline" (click)="open('#message-attach-a')">挂载 A</t-button>
      <t-button variant="outline" (click)="open('#message-attach-b')">挂载 B</t-button>
      <t-button variant="outline" (click)="open(null)">挂载 body</t-button>
      <t-button variant="outline" (click)="label.set('内容已更新')">更新模板</t-button>
      <t-button variant="outline" (click)="showA.set(!showA())">创建/移除 A</t-button>
      <t-button variant="outline" (click)="service.closeAll()">关闭本组消息</t-button>
    </div>
    <p class="demo-hint">挂载点、位置和 zIndex 相同才共享本服务容器。此例为卡片设置 transform，使 fixed 提示相对卡片定位。</p>
  `,
})
export class DemoMessageAttachment {
  readonly service = inject(TMessageService);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
  readonly label = signal('模板消息');
  readonly count = signal(0);
  readonly showA = signal(true);
  open(attach: MessageAttachNode): void {
    this.service.info({ attach, content: this.content(), closeBtn: true, placement: 'top', style: { maxWidth: '240px', '--feedback-demo': 'message' } });
  }
}
