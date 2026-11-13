import { Component } from '@angular/core';
import {
  TSelectModule,
  TSpaceModule,
  type SelectMultipleValue,
  type SelectOptionObj,
  type SelectSingleValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-filterable',
  imports: [TSelectModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-select
        [filterable]="true"
        [clearable]="true"
        [options]="options"
        [(value)]="value"
        placeholder="输入关键字搜索"
      />
      <p class="demo-hint">选中：{{ value }}</p>
    </t-space>
  `,
})
export class DemoSelectFilterable {
  protected readonly options: SelectOptionObj[] = [
    { label: '北京', value: 'beijing' },
    { label: '上海', value: 'shanghai' },
    { label: '广州', value: 'guangzhou' },
    { label: '深圳', value: 'shenzhen' },
    { label: '杭州', value: 'hangzhou' },
  ];

  protected value: SelectSingleValue | SelectMultipleValue = null;
}
