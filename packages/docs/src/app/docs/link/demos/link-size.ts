import { Component } from '@angular/core';
import { TLinkModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-link-size',
  imports: [TLinkModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true" align="center">
      <t-link href="#size" size="small">小尺寸链接</t-link>
      <t-link href="#size" size="medium">中尺寸链接</t-link>
      <t-link href="#size" size="large">大尺寸链接</t-link>
    </t-space>
  `,
})
export class DemoLinkSize {}
