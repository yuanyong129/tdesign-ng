import { Component, signal } from '@angular/core';
import { TDateRangePicker } from '@tdesign-ng/components';
import type { DateRangePickerChangeEvent, DateRangeValue, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-range-picker-state',
  imports: [TDateRangePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-range-picker
        style="width: 400px"
        label="日期"
        status="success"
        tips="仅可选择 2024 年 5 月内的日期"
        [value]="value()"
        [range]="mayRange"
        [clearable]="true"
        (change)="handleChange($event)"
      />
      <t-date-range-picker
        style="width: 360px"
        [borderless]="true"
        [value]="borderlessValue()"
        (change)="handleBorderless($event)"
      />
      <t-date-range-picker style="width: 360px" [readonly]="true" [value]="readonlyValue" />
    </div>
    <p class="demo-hint">
      第一个用 range 限定只能选 2024 年 5 月，并演示 label / tips / status；第二个是无边框模式；第三个是只读状态（不可展开面板）。
      当前：{{ value()[0] || '（空）' }} ~ {{ value()[1] || '（空）' }}。
    </p>
  `,
})
export class DemoDateRangePickerState {
  protected readonly value = signal<DateRangeValue>(['2024-05-06', '2024-05-12']);
  protected readonly borderlessValue = signal<DateRangeValue>(['2024-05-01', '2024-05-31']);
  protected readonly readonlyValue: DateRangeValue = ['2024-05-06', '2024-05-12'];

  protected readonly mayRange: DateValue[] = ['2024-05-01', '2024-05-31'];

  protected handleChange(event: DateRangePickerChangeEvent): void {
    this.value.set(event.value);
  }

  protected handleBorderless(event: DateRangePickerChangeEvent): void {
    this.borderlessValue.set(event.value);
  }
}
