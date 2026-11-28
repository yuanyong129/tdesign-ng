import { Component, inject, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TCard, TInput, TNotificationService, NOTIFICATION_CONFIG, type NotificationAttachNode } from '@tdesign-ng/components';

@Component({
  selector: 'demo-notification-attachment',
  imports: [TButton, TCard, TInput],
  providers: [TNotificationService, { provide: NOTIFICATION_CONFIG, useValue: { attach: '#notification-attach-a', duration: 0, zIndex: 7000, style: { '--feedback-default': 'ready' } } }],
  template: `
    <ng-template #content><span class="attached-notification-label">{{ label() }}</span><label>草稿<t-input class="attached-notification-draft" size="small" style="width:120px" /></label></ng-template>
    <ng-template #footer><t-button class="attached-notification-action" size="small" variant="outline" (click)="count.set(count() + 1)">计数 {{ count() }}</t-button></ng-template>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
      @if (showA()) { <t-card id="notification-attach-a" class="feedback-target-a" title="挂载区 A" bordered [bodyStyle]="{height:'180px'}" style="display:block;transform:translateZ(0)">此区域可独立销毁</t-card> }
      <t-card id="notification-attach-b" class="feedback-target-b" title="挂载区 B" bordered [bodyStyle]="{height:'180px'}" style="display:block;transform:translateZ(0)">不同挂载点各自分组</t-card>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
      <t-button variant="outline" (click)="open('#notification-attach-a')">挂载 A</t-button>
      <t-button variant="outline" (click)="open('#notification-attach-b')">挂载 B</t-button>
      <t-button variant="outline" (click)="open(null)">挂载 body</t-button>
      <t-button variant="outline" (click)="label.set('内容已更新')">更新模板</t-button>
      <t-button variant="outline" (click)="showA.set(!showA())">创建/移除 A</t-button>
      <t-button variant="outline" (click)="service.closeAll()">关闭本组通知</t-button>
    </div>
    <p class="demo-hint">同一挂载点内，位置、zIndex 或边距不同会使用独立容器。此例使用 TCard、TInput 和 TButton 组合业务内容。</p>
  `,
})
export class DemoNotificationAttachment {
  readonly service = inject(TNotificationService);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
  readonly footer = viewChild.required<TemplateRef<unknown>>('footer');
  readonly label = signal('模板通知');
  readonly count = signal(0);
  readonly showA = signal(true);
  open(attach: NotificationAttachNode): void {
    this.service.info({ attach, content: this.content(), footer: this.footer(), title: '局部通知', closeBtn: true,
      placement: 'top-right', offset: [12, 48], style: { width: '260px', '--feedback-demo': 'notification' } });
  }
}
