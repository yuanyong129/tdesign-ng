import { Component } from '@angular/core';
import { TSpaceModule, TSwitchModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-switch-custom',
  imports: [TSwitchModule, TSpaceModule],
  template: `
    <t-space [size]="24" align="center">
      <t-switch [(value)]="status" [customValue]="['on', 'off']" />
      <t-switch [(value)]="level" [customValue]="[1, 0]" />
      <span class="demo-hint">status：{{ status }}，level：{{ level }}</span>
    </t-space>
  `,
})
export class DemoSwitchCustom {
  protected status: string | number | boolean = 'on';
  protected level: string | number | boolean = 1;
}
