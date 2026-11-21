import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-mode',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 240px"
        mode="month"
        [value]="month()"
        [clearable]="true"
        (change)="handleMonth($event)"
      />
      <t-date-picker
        style="width: 240px"
        mode="year"
        [value]="year()"
        [clearable]="true"
        (change)="handleYear($event)"
      />
    </div>
    <p class="demo-hint">
      第一个 mode="month"：面板只展示 12 个月，选中后回传 YYYY-MM（当前 {{ month() || '（空）' }}）；第二个
      mode="year"：面板展示 12 个年份，选中后回传 YYYY（当前 {{ year() || '（空）' }}）。
    </p>
  `,
})
export class DemoDatePickerMode {
  protected readonly month = signal<DateValue | undefined>('2024-05');
  protected readonly year = signal<DateValue | undefined>('2024');

  protected handleMonth(event: DatePickerChangeEvent): void {
    this.month.set(event.value);
  }

  protected handleYear(event: DatePickerChangeEvent): void {
    this.year.set(event.value);
  }
}
