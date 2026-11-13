import { Component } from '@angular/core';
import { TRadioModule, TSpaceModule, type RadioValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-radio-direction',
  imports: [TRadioModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-radio-group direction="vertical" [(value)]="value">
        <t-radio value="1">选项一</t-radio>
        <t-radio value="2">选项二</t-radio>
        <t-radio value="3">选项三</t-radio>
      </t-radio-group>
      <p class="demo-hint">direction="vertical" 时纵向排列。</p>
    </t-space>
  `,
})
export class DemoRadioDirection {
  protected value: RadioValue = '2';
}
