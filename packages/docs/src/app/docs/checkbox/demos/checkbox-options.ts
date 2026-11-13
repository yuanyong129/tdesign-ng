import { Component } from '@angular/core';
import {
  TCheckboxModule,
  TSpaceModule,
  type CheckboxGroupValue,
  type CheckboxOption,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-checkbox-options',
  imports: [TCheckboxModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-checkbox-group [options]="options" [(value)]="checked" />
      <p class="demo-hint">选中：{{ checked.join('、') || '（空）' }}</p>
    </t-space>
  `,
})
export class DemoCheckboxOptions {
  protected options: CheckboxOption[] = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橘子（不可选）', value: 'orange', disabled: true },
  ];
  protected checked: CheckboxGroupValue = ['apple'];
}
