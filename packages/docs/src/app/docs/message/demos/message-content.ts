import { Component, inject, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TMessage, TMessageService, MESSAGE_CONFIG, type MessageContent, type MessageCloseEvent } from '@tdesign-ng/components';

@Component({
  selector: 'demo-message-scope',
  providers: [TMessageService],
  imports: [TButton],
  template: `<t-button size="small" variant="outline" (click)="service.info({ content: '随区域销毁的消息', duration: 0 })">局部服务消息</t-button>`,
})
export class DemoMessageScope { readonly service = inject(TMessageService); }

@Component({
  selector: 'demo-message-content',
  imports: [TButton, TMessage, DemoMessageScope],
  providers: [TMessageService, { provide: MESSAGE_CONFIG, useValue: { duration: 0, closeBtn: true, className: 'message-configured' } }],
  template: `
    <ng-template #content><span class="message-live">{{ label() }}</span><t-button class="message-action" size="small" variant="text" (click)="count.set(count() + 1)">重试 {{ count() }}</t-button></ng-template>
    <ng-template #icon><span class="message-custom-icon">★</span></ng-template>
    <ng-template #close><span class="message-custom-close">关闭</span></ng-template>
    @if (mounted()) { <demo-message-scope /> }
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
      <t-button class="message-open" variant="outline" (click)="open()">模板消息</t-button>
      <t-button variant="outline" (click)="label.set('数据已更新')">更新内容</t-button>
      <t-button variant="outline" (click)="service.closeAll()">关闭本服务消息</t-button>
      <t-button variant="outline" (click)="mounted.set(!mounted())">创建/销毁局部服务</t-button>
    </div>
    <p class="demo-hint">模板操作 {{ count() }} 次；关闭 {{ closes() }} 次，按钮 {{ clicks() }} 次，到时 {{ expired() }} 次。悬停暂停计时，离开后重新计时。</p>
    @if (staticShown()) {
      <t-message class="message-static" [content]="contentValue()" [duration]="duration()" [closeBtn]="true" (close)="record($event)" (durationEnd)="expired.set(expired() + 1)" />
    }
  `,
})
export class DemoMessageContent {
  readonly service = inject(TMessageService);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
  readonly icon = viewChild.required<TemplateRef<unknown>>('icon');
  readonly close = viewChild.required<TemplateRef<unknown>>('close');
  readonly mounted = signal(true);
  readonly staticShown = signal(true);
  readonly contentValue = signal<MessageContent>('组件式消息');
  readonly duration = signal(0);
  readonly label = signal('正在同步');
  readonly count = signal(0);
  readonly closes = signal(0);
  readonly clicks = signal(0);
  readonly expired = signal(0);
  readonly events: MessageCloseEvent[] = [];
  open(): void {
    this.service.info({ content: this.content(), icon: this.icon(), closeBtn: this.close(),
      onCloseBtnClick: () => this.clicks.update(n => n + 1),
      onDurationEnd: () => this.expired.update(n => n + 1),
      onClose: () => this.closes.update(n => n + 1) });
  }
  record(event: MessageCloseEvent): void { this.events.push(event); }
}
