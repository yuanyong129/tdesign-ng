import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-time',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 280px"
        [value]="value()"
        [enableTimePicker]="true"
        [clearable]="true"
        (change)="setValue($event)"
      />
      <t-date-picker
        style="width: 280px"
        [value]="instantValue()"
        [enableTimePicker]="true"
        [needConfirm]="false"
        [defaultTime]="'09:00:00'"
        [clearable]="true"
        (change)="setInstant($event)"
      />
    </div>
    <p class="demo-hint">
      第一个开启 enableTimePicker：右侧出现时分秒列，选完日期和时间点「确定」才提交（当前
      {{ value() || '（空）' }}）；第二个 needConfirm=false，点日期即提交，未指定时间时用 defaultTime 09:00:00（当前
      {{ instantValue() || '（空）' }}）。
    </p>
  `,
})
export class DemoDatePickerTime {
  protected readonly value = signal<DateValue | undefined>('2024-05-20 12:30:00');
  protected readonly instantValue = signal<DateValue | undefined>(undefined);

  protected setValue(event: DatePickerChangeEvent): void {
    this.value.set(event.value as DateValue);
  }

  protected setInstant(event: DatePickerChangeEvent): void {
    this.instantValue.set(event.value as DateValue);
  }
}
