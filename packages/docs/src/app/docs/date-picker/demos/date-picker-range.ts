import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-range',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 240px"
        [value]="windowed()"
        [range]="windowRange"
        [clearable]="true"
        (change)="handleWindowChange($event)"
      />
      <t-date-picker
        style="width: 240px"
        [value]="weekdaysOnly()"
        [range]="onlyWeekdays"
        [clearable]="true"
        (change)="handleWeekdayChange($event)"
      />
    </div>
    <p class="demo-hint">
      range 传 [start, end] 时只有窗口内的日期可选，传函数时按返回值决定是否可选：第一个限定
      2024-05-10 ~ 2024-05-20（当前 {{ windowed() || '（空）' }}），第二个只允许周一至周五（当前
      {{ weekdaysOnly() || '（空）' }}）。
    </p>
  `,
})
export class DemoDatePickerRange {
  protected readonly windowed = signal<DateValue | undefined>('2024-05-15');
  protected readonly weekdaysOnly = signal<DateValue | undefined>(undefined);

  protected readonly windowRange: DateValue[] = ['2024-05-10', '2024-05-20'];

  protected readonly onlyWeekdays = (value: DateValue): boolean => {
    const day = new Date(value as string).getDay();
    return day !== 0 && day !== 6;
  };

  protected handleWindowChange(event: DatePickerChangeEvent): void {
    this.windowed.set(event.value);
  }

  protected handleWeekdayChange(event: DatePickerChangeEvent): void {
    this.weekdaysOnly.set(event.value);
  }
}
