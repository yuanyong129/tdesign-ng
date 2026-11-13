import { Component } from '@angular/core';
import { TCheckboxModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-checkbox-basic',
  imports: [TCheckboxModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-space [size]="24">
        <t-checkbox [(checked)]="checked">选项</t-checkbox>
        <t-checkbox [(checked)]="checked2">默认选中</t-checkbox>
      </t-space>
      <p class="demo-hint">当前值：{{ checked }} / {{ checked2 }}</p>
    </t-space>
  `,
})
export class DemoCheckboxBasic {
  protected checked = false;
  protected checked2 = true;
}
