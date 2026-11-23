import { Component, signal } from '@angular/core';
import { QRStatus, TButton, TQRCodeModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-qrcode-status',
  imports: [TQRCodeModule, TButton],
  template: `
    <div class="qrcode-status">
      <t-qrcode
        value="https://tdesign.tencent.com/angular"
        [status]="status()"
        (refresh)="handleRefresh()"
      />
      <div class="qrcode-status__actions">
        <t-button size="small" variant="outline" (click)="setStatus('expired')">过期</t-button>
        <t-button size="small" variant="outline" (click)="setStatus('scanned')">已扫描</t-button>
        <t-button size="small" variant="outline" (click)="setStatus('loading')">加载中</t-button>
        <t-button size="small" variant="outline" (click)="setStatus('active')">正常</t-button>
      </div>
      <p class="demo-hint">当前状态：{{ status() }}，refresh 触发 {{ refreshCount() }} 次。</p>
    </div>
  `,
  styles: [
    `
      .qrcode-status {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      .qrcode-status__actions {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class DemoQRCodeStatus {
  protected readonly status = signal<QRStatus>('expired');

  protected readonly refreshCount = signal(0);

  protected setStatus(status: QRStatus): void {
    this.status.set(status);
  }

  protected handleRefresh(): void {
    this.refreshCount.update((count) => count + 1);
    this.status.set('active');
  }
}
