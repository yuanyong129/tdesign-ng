import { Component } from '@angular/core';
import { TConfigProviderModule, TQRCodeModule, TSpaceModule } from '@tdesign-ng/components';
import type { TGlobalConfig } from '@tdesign-ng/components';

@Component({
  selector: 'demo-config-provider-base',
  imports: [TConfigProviderModule, TQRCodeModule, TSpaceModule],
  template: `
    <t-config-provider [globalConfig]="globalConfig">
      <t-space size="24px">
        <t-qrcode value="https://tdesign.tencent.com/angular" status="expired" />
        <t-qrcode value="https://tdesign.tencent.com/angular" status="scanned" />
      </t-space>
    </t-config-provider>
  `,
})
export class DemoConfigProviderBase {
  protected readonly globalConfig: TGlobalConfig = {
    qrcode: {
      expiredText: '链接已失效，请重新获取',
      refreshText: '重新获取',
      scannedText: '该二维码已被扫描',
    },
  };
}
