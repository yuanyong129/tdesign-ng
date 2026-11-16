import { Component, inject } from '@angular/core';
import { TButtonModule, TNotificationService, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-notification-custom',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      <t-button variant="outline" (click)="openWithFooter()">带底部内容</t-button>
      <t-button variant="outline" (click)="openPersistent()">不自动关闭</t-button>
      <t-button variant="outline" (click)="closeAll()">全部关闭</t-button>
    </t-space>
    <p class="demo-hint">title、content、footer 都可以自由组合，duration 为 0 时不自动关闭。</p>
  `,
})
export class DemoNotificationCustom {
  private readonly notify = inject(TNotificationService);

  protected openWithFooter(): void {
    this.notify.success({
      title: '部署完成',
      content: '生产环境已更新到最新版本。',
      footer: '耗时 1 分 24 秒',
    });
  }

  protected openPersistent(): void {
    this.notify.warning({
      title: '需要处理',
      content: '有 3 条待审核的申请，请在今天内处理。',
      duration: 0,
    });
  }

  protected closeAll(): void {
    this.notify.closeAll();
  }
}
