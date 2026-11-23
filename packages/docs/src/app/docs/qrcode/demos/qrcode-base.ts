import { Component } from '@angular/core';
import { TQRCodeModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-qrcode-base',
  imports: [TQRCodeModule],
  template: ` <t-qrcode value="https://tdesign.tencent.com/angular" /> `,
})
export class DemoQRCodeBase {}
