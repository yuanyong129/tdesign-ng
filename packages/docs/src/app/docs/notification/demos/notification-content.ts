import { Component, inject, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TNotification, TNotificationService, NOTIFICATION_CONFIG, type NotificationContent, type NotificationCloseEvent } from '@tdesign-ng/components';

@Component({
  selector: 'demo-notification-scope',
  providers: [TNotificationService],
  imports: [TButton],
  template: `<t-button size="small" variant="outline" (click)="service.info({ content: '随区域销毁的通知', duration: 0 })">局部服务通知</t-button>`,
})
export class DemoNotificationScope { readonly service = inject(TNotificationService); }

@Component({
  selector: 'demo-notification-content',
  imports: [TButton, TNotification, DemoNotificationScope],
  providers: [TNotificationService, { provide: NOTIFICATION_CONFIG, useValue: { duration: 0, icon: false, className: 'notification-configured' } }],
  template: `
    <ng-template #content><span class="notification-live">{{ label() }}</span></ng-template>
    <ng-template #title><strong class="notification-custom-title">模板标题 {{ count() }}</strong></ng-template>
    <ng-template #footer><t-button class="notification-action" size="small" variant="outline" (click)="count.set(count() + 1)">查看 {{ count() }}</t-button></ng-template>
    <ng-template #icon><span class="notification-custom-icon">★</span></ng-template>
    <ng-template #close><span class="notification-custom-close">关闭</span></ng-template>
    @if (mounted()) { <demo-notification-scope /> }
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
      <t-button class="notification-open" variant="outline" (click)="open()">模板通知</t-button>
      <t-button variant="outline" (click)="label.set('数据已更新')">更新内容</t-button>
      <t-button variant="outline" (click)="service.closeAll()">关闭本服务通知</t-button>
      <t-button variant="outline" (click)="mounted.set(!mounted())">创建/销毁局部服务</t-button>
    </div>
    <p class="demo-hint">模板操作 {{ count() }} 次；关闭 {{ closes() }} 次，按钮 {{ clicks() }} 次，到时 {{ expired() }} 次。底部操作使用库内 TButton。</p>
    @if (staticShown()) {
      <t-notification class="notification-static" title="组件式通知" [content]="contentValue()" [duration]="duration()" (close)="record($event)" (durationEnd)="expired.set(expired() + 1)">
        <t-button class="notification-projected" size="small" variant="text" (click)="count.set(count() + 1)">投影内容 {{ count() }}</t-button>
      </t-notification>
    }
  `,
})
export class DemoNotificationContent {
  readonly service = inject(TNotificationService);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
  readonly title = viewChild.required<TemplateRef<unknown>>('title');
  readonly footer = viewChild.required<TemplateRef<unknown>>('footer');
  readonly icon = viewChild.required<TemplateRef<unknown>>('icon');
  readonly close = viewChild.required<TemplateRef<unknown>>('close');
  readonly mounted = signal(true);
  readonly staticShown = signal(true);
  readonly contentValue = signal<NotificationContent>(undefined);
  readonly duration = signal(0);
  readonly label = signal('正在同步');
  readonly count = signal(0);
  readonly closes = signal(0);
  readonly clicks = signal(0);
  readonly expired = signal(0);
  readonly events: NotificationCloseEvent[] = [];
  open(): void {
    this.service.info({ title: this.title(), content: this.content(), footer: this.footer(), icon: this.icon(), closeBtn: this.close(),
      onCloseBtnClick: () => this.clicks.update(n => n + 1),
      onDurationEnd: () => this.expired.update(n => n + 1),
      onClose: () => this.closes.update(n => n + 1) });
  }
  record(event: NotificationCloseEvent): void { this.events.push(event); }
}
