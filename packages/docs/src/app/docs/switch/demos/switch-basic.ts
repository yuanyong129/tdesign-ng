import { Component } from '@angular/core';
import { TSwitchModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-switch-basic',
  imports: [TSwitchModule],
  template: `
    <t-switch [(value)]="checked" />
    <p class="demo-hint">当前值：{{ checked }}</p>
  `,
})
export class DemoSwitchBasic {
  protected checked = true;
}
