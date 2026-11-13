import { Component } from '@angular/core';
import { TSpaceModule, TSwitchModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-switch-size',
  imports: [TSwitchModule, TSpaceModule],
  template: `
    <t-space [size]="24" align="center">
      <t-switch [(value)]="small" size="small" />
      <t-switch [(value)]="medium" size="medium" />
      <t-switch [(value)]="large" size="large" />
    </t-space>
  `,
})
export class DemoSwitchSize {
  protected small = true;
  protected medium = true;
  protected large = true;
}
