import { Component, inject } from '@angular/core';
import { TButtonModule, TMessageService, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-message-duration',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      <t-button variant="outline" (click)="openPersistent()">不自动关闭</t-button>
      <t-button variant="outline" (click)="openClosable()">带关闭按钮</t-button>
      <t-button variant="outline" (click)="openLoading()">加载中</t-button>
    </t-space>
    <p class="demo-hint">duration 为 0 时不会自动消失，需要手动 close 或 closeAll。</p>
  `,
})
export class DemoMessageDuration {
  private readonly message = inject(TMessageService);

  protected openPersistent(): void {
    this.message.info({ content: '这条消息不会自动关闭', duration: 0, closeBtn: true });
  }

  protected openClosable(): void {
    this.message.warning({ content: '库存不足，请及时补货', closeBtn: true });
  }

  protected openLoading(): void {
    const instance = this.message.loading('正在保存…');
    setTimeout(() => instance.close(), 2000);
  }
}
