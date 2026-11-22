import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue, DisableDate } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-disabled',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 240px"
        [value]="weekendValue()"
        [disableDate]="disableWeekend"
        [clearable]="true"
        (change)="setWeekend($event)"
      />
      <t-date-picker
        style="width: 240px"
        [value]="listValue()"
        [disableDate]="disabledDates"
        [clearable]="true"
        (change)="setList($event)"
      />
      <t-date-picker
        style="width: 260px"
        [value]="rangeValue()"
        [disableDate]="disabledRange"
        [clearable]="true"
        (change)="setRange($event)"
      />
    </div>
    <p class="demo-hint">
      第一个用函数禁用周末；第二个用日期数组禁用 2024-05-15 / 2024-05-16；第三个用范围对象只允许 2024-05-10 ~ 2024-05-25。
      当前分别选中：{{ weekendValue() || '（空）' }} / {{ listValue() || '（空）' }} / {{ rangeValue() || '（空）' }}。
    </p>
  `,
})
export class DemoDatePickerDisabled {
  protected readonly weekendValue = signal<DateValue | undefined>(undefined);
  protected readonly listValue = signal<DateValue | undefined>(undefined);
  protected readonly rangeValue = signal<DateValue | undefined>('2024-05-18');

  protected readonly disableWeekend = (date: Date): boolean =>
    date.getDay() === 0 || date.getDay() === 6;

  protected readonly disabledDates: DisableDate = ['2024-05-15', '2024-05-16'];

  protected readonly disabledRange: DisableDate = { from: '2024-05-10', to: '2024-05-25' };

  protected setWeekend(event: DatePickerChangeEvent): void {
    this.weekendValue.set(event.value as DateValue);
  }

  protected setList(event: DatePickerChangeEvent): void {
    this.listValue.set(event.value as DateValue);
  }

  protected setRange(event: DatePickerChangeEvent): void {
    this.rangeValue.set(event.value as DateValue);
  }
}
