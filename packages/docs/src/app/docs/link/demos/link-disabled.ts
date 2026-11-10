import { Component } from '@angular/core';
import { TLinkModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-link-disabled',
  imports: [TLinkModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-link href="#disabled" [disabled]="true">禁用链接</t-link>
      <t-link href="#disabled" [disabled]="true" [underline]="true">禁用且带下划线</t-link>
    </t-space>
  `,
})
export class DemoLinkDisabled {}
