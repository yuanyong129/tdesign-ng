import { Component, inject } from '@angular/core';
import { TButtonModule, TNotificationService, TSpaceModule, type NotificationPlacement } from '@tdesign-ng/components';

@Component({
  selector: 'demo-notification-placement',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (item of placements; track item) {
        <t-button variant="outline" (click)="open(item)">{{ item }}</t-button>
      }
    </t-space>
    <p class="demo-hint">四个角都可以作为通知的容器，同一位置的多个通知会依次堆叠。</p>
  `,
})
export class DemoNotificationPlacement {
  private readonly notify = inject(TNotificationService);

  protected readonly placements: NotificationPlacement[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  protected open(placement: NotificationPlacement): void {
    this.notify.info({
      title: placement,
      content: '这条通知出现在指定角落。',
      placement,
      duration: 0,
    });
  }
}
