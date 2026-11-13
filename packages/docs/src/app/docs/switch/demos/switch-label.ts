import { Component } from '@angular/core';
import { TSpaceModule, TSwitchModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-switch-label',
  imports: [TSwitchModule, TSpaceModule],
  template: `
    <t-space [size]="24">
      <t-switch [(value)]="single" label="开" />
      <t-switch [(value)]="pair" label="开" [label]="['开', '关']" />
      <t-switch [(value)]="off" label="关" [label]="['开', '关']" />
    </t-space>
  `,
})
export class DemoSwitchLabel {
  protected single = true;
  protected pair = true;
  protected off = false;
}
