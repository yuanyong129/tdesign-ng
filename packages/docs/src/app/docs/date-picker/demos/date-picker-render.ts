import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-render',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 240px"
        [value]="date()"
        [cell]="renderCell"
        [valueDisplay]="renderValue"
        [clearable]="true"
        (change)="handleChange($event)"
      />
    </div>
    <p class="demo-hint">
      cell 回调收到每个日期格的值，返回值替代默认的几号；valueDisplay 回调收到当前值与默认回显，返回值作为输入框文案（当前
      {{ date() || '（空）' }}）。
    </p>
  `,
})
export class DemoDatePickerRender {
  protected readonly date = signal<DateValue | undefined>('2024-05-20');

  /** 2 号标记为「会」，周末标记为「休」，其余保持默认几号。 */
  protected readonly renderCell = (value: DateValue): string => {
    const date = new Date(value as string);
    const day = date.getDate();
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) return '休';
    return day === 2 ? '会' : String(day);
  };

  protected readonly renderValue = (value: DateValue, displayValue: string): string =>
    `📅 ${displayValue}`;

  protected handleChange(event: DatePickerChangeEvent): void {
    this.date.set(event.value);
  }
}
