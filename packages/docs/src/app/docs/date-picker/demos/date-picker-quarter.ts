import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-quarter',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 240px"
        mode="quarter"
        [value]="quarter()"
        [clearable]="true"
        (change)="handleChange($event)"
      />
    </div>
    <p class="demo-hint">
      mode="quarter"：面板一行展示四个季度，选中后回传 YYYY-[Q]Q（当前 {{ quarter() || '（空）' }}）。
    </p>
  `,
})
export class DemoDatePickerQuarter {
  protected readonly quarter = signal<DateValue | undefined>('2024-Q2');

  protected handleChange(event: DatePickerChangeEvent): void {
    this.quarter.set(event.value);
  }
}

