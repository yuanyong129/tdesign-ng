import { Component } from '@angular/core';
import { TCheckTagModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-check-tag-disabled',
  imports: [TCheckTagModule, TSpaceModule],
  template: `
    <t-space [size]="12" [breakLine]="true">
      <t-check-tag [defaultChecked]="true" disabled>选中禁用</t-check-tag>
      <t-check-tag disabled>未选中禁用</t-check-tag>
      <t-check-tag size="large">大尺寸</t-check-tag>
      <t-check-tag size="small">小尺寸</t-check-tag>
    </t-space>
  `,
})
export class DemoCheckTagDisabled {}
