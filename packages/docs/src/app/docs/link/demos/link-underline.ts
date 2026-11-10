import { Component } from '@angular/core';
import { TLinkModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-link-underline',
  imports: [TLinkModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-link href="#underline" [underline]="true">始终下划线</t-link>
      <t-link href="#underline" hover="underline">悬浮下划线</t-link>
      <t-link href="#underline" hover="color">悬浮变色</t-link>
    </t-space>
  `,
})
export class DemoLinkUnderline {}
