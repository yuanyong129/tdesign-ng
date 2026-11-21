import { Component, signal } from '@angular/core';
import { TDateRangePicker } from '@tdesign-ng/components';
import type {
  DateRangePickerChangeEvent,
  DateRangeValue,
  DisableDate,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-range-picker-options',
  imports: [TDateRangePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-range-picker
        style="width: 360px"
        size="small"
        [value]="value()"
        [disableDate]="disableWeekend"
        [clearable]="true"
        (change)="handleChange($event)"
      />
      <t-date-range-picker
        style="width: 380px"
        size="large"
        [value]="second()"
        [disableDate]="disableArray"
        [clearable]="true"
        (change)="handleSecond($event)"
      />
    </div>
    <p class="demo-hint">
      第一个 small 尺寸、disableDate 禁用周末，当前 {{ value()[0] || '（空）' }} ~ {{ value()[1] || '（空）' }}；
      第二个 large 尺寸、禁用 2024-05-15 / 2024-05-16，当前 {{ second()[0] || '（空）' }} ~
      {{ second()[1] || '（空）' }}。
    </p>
  `,
})
export class DemoDateRangePickerOptions {
  protected readonly value = signal<DateRangeValue>([]);
  protected readonly second = signal<DateRangeValue>(['2024-05-10', '2024-05-20']);

  protected readonly disableWeekend: DisableDate = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  protected readonly disableArray: DisableDate = ['2024-05-15', '2024-05-16'];

  protected handleChange(event: DateRangePickerChangeEvent): void {
    this.value.set(event.value);
  }

  protected handleSecond(event: DateRangePickerChangeEvent): void {
    this.second.set(event.value);
  }
}
