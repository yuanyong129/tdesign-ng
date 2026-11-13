import { Component } from '@angular/core';
import { TSpaceModule, TSwitchModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-switch-state',
  imports: [TSwitchModule, TSpaceModule],
  template: `
    <t-space [size]="24">
      <t-switch [value]="true" [disabled]="true" />
      <t-switch [value]="false" [disabled]="true" />
      <t-switch [value]="true" [loading]="true" />
      <t-switch [value]="false" [loading]="true" />
    </t-space>
  `,
})
export class DemoSwitchState {}
