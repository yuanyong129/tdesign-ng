import { Component } from '@angular/core';
import {
  TSelectModule,
  TSpaceModule,
  type SelectMultipleValue,
  type SelectOptionObj,
  type SelectSingleValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-state',
  imports: [TSelectModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-select [options]="options" [(value)]="disabledValue" placeholder="禁用" [disabled]="true" />
      <t-select [options]="options" [(value)]="readonlyValue" placeholder="只读" [readonly]="true" />
      <t-select
        status="error"
        [options]="options"
        [(value)]="errorValue"
        placeholder="错误状态"
        tips="请选择一项"
      />
      <t-select status="success" [options]="options" [(value)]="successValue" placeholder="成功状态" />
      <t-select [options]="options" [(value)]="loadingValue" placeholder="加载中" [loading]="true" />
    </t-space>
  `,
})
export class DemoSelectState {
  protected readonly options: SelectOptionObj[] = [
    { label: '选项一', value: '1' },
    { label: '选项二（禁用）', value: '2', disabled: true },
  ];

  protected disabledValue: SelectSingleValue | SelectMultipleValue = '1';

  protected readonlyValue: SelectSingleValue | SelectMultipleValue = '1';

  protected errorValue: SelectSingleValue | SelectMultipleValue = null;

  protected successValue: SelectSingleValue | SelectMultipleValue = '1';

  protected loadingValue: SelectSingleValue | SelectMultipleValue = null;
}
