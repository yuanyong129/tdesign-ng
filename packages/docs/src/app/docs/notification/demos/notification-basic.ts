import { Component, inject } from '@angular/core';
import { TButtonModule, TNotificationService, TSpaceModule, type NotificationTheme } from '@tdesign-ng/components';

@Component({
  selector: 'demo-notification-basic',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (theme of themes; track theme) {
        <t-button variant="outline" (click)="open(theme)">{{ theme }}</t-button>
      }
    </t-space>
    <p class="demo-hint">通知默认出现在右上角，3 秒后自动关闭。</p>
  `,
})
export class DemoNotificationBasic {
  private readonly notify = inject(TNotificationService);

  protected readonly themes: NotificationTheme[] = ['info', 'success', 'warning', 'error'];

  protected open(theme: NotificationTheme): void {
    this.notify.show(theme, { title: `${theme} 通知`, content: '通知内容可以更长一些，用于承载操作结果的说明。' });
  }
}
