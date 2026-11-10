import { Component } from '@angular/core';
import { TLinkModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-link-base',
  imports: [TLinkModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-link href="#basic">默认链接</t-link>
      <t-link href="#basic" theme="primary">主要链接</t-link>
      <t-link href="#basic" theme="danger">危险链接</t-link>
      <t-link href="#basic" theme="warning">警告链接</t-link>
      <t-link href="#basic" theme="success">成功链接</t-link>
    </t-space>
  `,
})
export class DemoLinkBase {}
