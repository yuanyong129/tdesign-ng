import { Component } from '@angular/core';
import {
  TSelectModule,
  TSpaceModule,
  type SelectMultipleValue,
  type SelectOptionGroupObj,
  type SelectOptionInput,
  type SelectSingleValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-group',
  imports: [TSelectModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-select [options]="options" [(value)]="value" placeholder="请选择城市" [clearable]="true" />
      <p class="demo-hint">选中：{{ value }}</p>
    </t-space>
  `,
})
export class DemoSelectGroup {
  protected readonly groups: SelectOptionGroupObj[] = [
    {
      group: '华东',
      children: [
        { label: '上海', value: 'shanghai' },
        { label: '杭州', value: 'hangzhou' },
      ],
    },
    {
      group: '华南',
      children: [
        { label: '广州', value: 'guangzhou' },
        { label: '深圳', value: 'shenzhen' },
      ],
    },
  ];

  protected readonly options: SelectOptionInput[] = this.groups;

  protected value: SelectSingleValue | SelectMultipleValue = null;
}
