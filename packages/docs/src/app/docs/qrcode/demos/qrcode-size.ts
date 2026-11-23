import { Component } from '@angular/core';
import { TQRCodeModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-qrcode-size',
  imports: [TQRCodeModule],
  template: `
    <div class="qrcode-row">
      <div class="qrcode-item">
        <t-qrcode value="https://tdesign.tencent.com/angular" [size]="100" level="L" />
        <p class="qrcode-label">size 100 / level L</p>
      </div>
      <div class="qrcode-item">
        <t-qrcode value="https://tdesign.tencent.com/angular" [size]="160" level="M" />
        <p class="qrcode-label">size 160 / level M</p>
      </div>
      <div class="qrcode-item">
        <t-qrcode value="https://tdesign.tencent.com/angular" [size]="160" level="H" type="svg" color="#0052d9" />
        <p class="qrcode-label">size 160 / level H / svg</p>
      </div>
    </div>
  `,
  styles: [
    `
      .qrcode-row {
        display: flex;
        gap: 24px;
        align-items: flex-start;
      }
      .qrcode-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .qrcode-label {
        margin: 0;
        color: var(--td-text-color-secondary);
        font-size: 12px;
      }
    `,
  ],
})
export class DemoQRCodeSize {}
