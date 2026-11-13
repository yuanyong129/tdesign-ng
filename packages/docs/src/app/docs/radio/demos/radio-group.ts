import { Component } from '@angular/core';
import { TRadioModule, TSpaceModule, type RadioValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-radio-group',
  imports: [TRadioModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-radio-group [(value)]="value">
        <t-radio value="1">选项一</t-radio>
        <t-radio value="2">选项二</t-radio>
        <t-radio value="3">选项三</t-radio>
      </t-radio-group>
      <p class="demo-hint">选中：{{ value }}</p>
    </t-space>
  `,
})
export class DemoRadioGroup {
  protected value: RadioValue = '1';
}
