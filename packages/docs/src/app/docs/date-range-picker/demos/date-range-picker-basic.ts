import { Component, signal } from '@angular/core';
import { TDateRangePicker } from '@tdesign-ng/components';
import type { DateRangePickerChangeEvent, DateRangeValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-range-picker-basic',
  imports: [TDateRangePicker],
  template: `
    <div style="width: 360px">
      <t-date-range-picker [value]="value()" [clearable]="true" (change)="handleChange($event)" />
    </div>
    <p class="demo-hint">
      当前范围：{{ value()[0] || '（空）' }} ~ {{ value()[1] || '（空）' }}。打开面板后先点开始日期、再点结束日期，
      两次点击后立即提交并收起。
    </p>
  `,
})
export class DemoDateRangePickerBasic {
  protected readonly value = signal<DateRangeValue>(['2024-05-10', '2024-05-20']);

  protected handleChange(event: DateRangePickerChangeEvent): void {
    this.value.set(event.value);
  }
}
