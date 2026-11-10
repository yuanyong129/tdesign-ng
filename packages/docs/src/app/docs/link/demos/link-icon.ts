import { Component } from '@angular/core';
import { TLinkModule, TSpaceModule } from '@tdesign-ng/components';
import { TIcon } from '@tdesign-ng/icons';

@Component({
  selector: 'demo-link-icon',
  imports: [TLinkModule, TSpaceModule, TIcon],
  template: `
    <t-space [breakLine]="true" align="center">
      <t-link href="#icon" theme="primary" [hasPrefixIcon]="true">
        <t-icon name="link" tLinkPrefixIcon />带前缀图标
      </t-link>
      <t-link href="#icon" theme="primary" [hasSuffixIcon]="true">
        带后缀图标<t-icon name="arrow-right" tLinkSuffixIcon />
      </t-link>
    </t-space>
  `,
})
export class DemoLinkIcon {}
