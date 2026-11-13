import { Component } from '@angular/core';
import {
  TSelectModule,
  TSpaceModule,
  type SelectMultipleValue,
  type SelectOptionObj,
  type SelectSingleValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-size',
  imports: [TSelectModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-select size="small" [options]="options" [(value)]="small" placeholder="小尺寸" />
      <t-select [options]="options" [(value)]="medium" placeholder="中尺寸（默认）" />
      <t-select size="large" [options]="options" [(value)]="large" placeholder="大尺寸" />
    </t-space>
  `,
})
export class DemoSelectSize {
  protected readonly options: SelectOptionObj[] = [
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
  ];

  protected small: SelectSingleValue | SelectMultipleValue = null;

  protected medium: SelectSingleValue | SelectMultipleValue = null;

  protected large: SelectSingleValue | SelectMultipleValue = null;
}
