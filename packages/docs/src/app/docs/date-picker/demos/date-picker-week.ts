import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-week',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 240px"
        mode="week"
        [value]="week()"
        [clearable]="true"
        (change)="handleChange($event)"
      />
    </div>
    <p class="demo-hint">
      mode="week"：面板每行是一整周，首列显示 ISO 周号，点任意一天即选中整周，回传 YYYY-[W]WW（当前
      {{ week() || '（空）' }}）。
    </p>
  `,
})
export class DemoDatePickerWeek {
  protected readonly week = signal<DateValue | undefined>('2024-W23');

  protected handleChange(event: DatePickerChangeEvent): void {
    this.week.set(event.value as DateValue);
  }
}

