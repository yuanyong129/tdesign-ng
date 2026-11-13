import { Component } from '@angular/core';
import {
  TSelectModule,
  TSpaceModule,
  type SelectMultipleValue,
  type SelectOptionObj,
  type SelectSingleValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-creatable',
  imports: [TSelectModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-select
        [creatable]="true"
        [filterable]="true"
        [options]="options"
        [(value)]="value"
        placeholder="输入后回车创建"
        (create)="handleCreate($event)"
      />
      <p class="demo-hint">选中：{{ value }}｜新建过：{{ created.join('、') || '（无）' }}</p>
    </t-space>
  `,
})
export class DemoSelectCreatable {
  protected readonly options: SelectOptionObj[] = [
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
  ];

  protected created: string[] = [];

  protected value: SelectSingleValue | SelectMultipleValue = null;

  protected handleCreate(value: string): void {
    this.created = [...this.created, value];
  }
}
