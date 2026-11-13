import { Component } from '@angular/core';
import { TRadioModule, TSpaceModule, type RadioOption, type RadioValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-radio-options',
  imports: [TRadioModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-radio-group [options]="options" [(value)]="value" />
      <p class="demo-hint">选中：{{ value }}</p>
    </t-space>
  `,
})
export class DemoRadioOptions {
  protected value: RadioValue = 'apple';
  protected readonly options: RadioOption[] = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橘子（不可选）', value: 'orange', disabled: true },
  ];
}
