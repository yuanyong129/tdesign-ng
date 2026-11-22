import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-multiple',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-row" style="width: 320px">
      <t-date-picker
        style="width: 100%"
        [multiple]="true"
        [clearable]="true"
        [value]="values()"
        (change)="handleChange($event)"
      />
      <p class="demo-hint">
        当前已选 {{ values().length }} 个日期：{{ values().join('、') || '（空）' }}；点日期可多选，选中后标签可单独删除，面板不会自动收起。
      </p>
    </div>
  `,
})
export class DemoDatePickerMultiple {
  protected readonly values = signal<DateValue[]>(['2024-05-01', '2024-05-08']);

  protected handleChange(event: DatePickerChangeEvent): void {
    this.values.set(Array.isArray(event.value) ? event.value : []);
  }
}
