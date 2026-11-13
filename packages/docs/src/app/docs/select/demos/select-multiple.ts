import { Component } from '@angular/core';
import {
  TSelectModule,
  TSpaceModule,
  type SelectMultipleValue,
  type SelectOptionObj,
  type SelectSingleValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-multiple',
  imports: [TSelectModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-select [multiple]="true" [options]="options" [(value)]="value" placeholder="请选择" [clearable]="true" />
      <p class="demo-hint">选中：{{ value }}</p>
    </t-space>
  `,
})
export class DemoSelectMultiple {
  protected readonly options: SelectOptionObj[] = [
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
    { label: '选项三', value: '3' },
  ];

  protected value: SelectSingleValue | SelectMultipleValue = ['1'];
}
