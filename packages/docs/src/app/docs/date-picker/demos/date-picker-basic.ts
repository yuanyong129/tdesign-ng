import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-basic',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-row" style="width: 260px">
      <t-date-picker style="width: 100%" [value]="value()" (change)="handleChange($event)" />
      <p class="demo-hint">当前选中：{{ value() || '（空）' }}；点击日历图标打开面板，选中日期后自动收起。</p>
    </div>
  `,
})
export class DemoDatePickerBasic {
  protected readonly value = signal<DateValue | undefined>('2024-05-20');

  protected handleChange(event: DatePickerChangeEvent): void {
    this.value.set(event.value);
  }
}
