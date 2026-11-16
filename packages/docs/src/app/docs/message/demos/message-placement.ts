import { Component, inject } from '@angular/core';
import { TButtonModule, TMessageService, TSpaceModule, type MessagePlacement } from '@tdesign-ng/components';

@Component({
  selector: 'demo-message-placement',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (item of placements; track item) {
        <t-button variant="outline" (click)="open(item)">{{ item }}</t-button>
      }
      <t-button variant="outline" (click)="closeAll()">全部关闭</t-button>
    </t-space>
    <p class="demo-hint">placement 决定消息出现的位置，同一位置的多个消息会依次排开。</p>
  `,
})
export class DemoMessagePlacement {
  private readonly message = inject(TMessageService);

  protected readonly placements: MessagePlacement[] = ['top', 'top-right', 'bottom', 'center'];

  protected open(placement: MessagePlacement): void {
    this.message.success({ content: `${placement} 位置的消息`, placement, duration: 0, closeBtn: true });
  }

  protected closeAll(): void {
    this.message.closeAll();
  }
}
