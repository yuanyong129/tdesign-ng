import { Component } from '@angular/core';
import {
  TCheckTagModule,
  TSpaceModule,
  type CheckTagGroupOption,
  type CheckTagGroupValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-check-tag-group',
  imports: [TCheckTagModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-check-tag-group [options]="options" [(value)]="single" />
      <t-check-tag-group [options]="options" [(value)]="multiple" [multiple]="true" />
    </t-space>
    <p class="demo-hint">单选「{{ single.join('、') }}」，多选「{{ multiple.join('、') }}」。</p>
  `,
})
export class DemoCheckTagGroup {
  protected readonly options: CheckTagGroupOption[] = [
    { value: '1', label: '选项一' },
    { value: '2', label: '选项二' },
    { value: '3', label: '选项三' },
  ];

  protected single: CheckTagGroupValue = ['1'];

  protected multiple: CheckTagGroupValue = ['1', '3'];
}
