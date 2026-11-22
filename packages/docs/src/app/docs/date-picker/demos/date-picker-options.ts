import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type { DatePickerChangeEvent, DateValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-options',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 240px"
        [value]="clearableValue()"
        [clearable]="true"
        (change)="setClearable($event)"
      />
      <t-date-picker style="width: 240px" size="small" [disabled]="true" defaultValue="2024-05-08" />
      <t-date-picker style="width: 240px" size="large" placeholder="请选择入职日期" />
      <t-date-picker
        style="width: 240px"
        format="YYYY/MM/DD"
        valueType="time-stamp"
        [value]="timestampValue()"
        [clearable]="true"
        (change)="setTimestamp($event)"
      />
    </div>
    <p class="demo-hint">
      第一个可清空（当前 {{ clearableValue() || '（空）' }}），第二个禁用，第三个 large 尺寸与占位文案；
      第四个用 format="YYYY/MM/DD" 显示、valueType="time-stamp" 回传时间戳（当前 {{ timestampValue() || '（空）' }}）。
    </p>
  `,
})
export class DemoDatePickerOptions {
  protected readonly clearableValue = signal<DateValue | undefined>('2024-05-20');
  protected readonly timestampValue = signal<DateValue | undefined>(undefined);

  protected setClearable(event: DatePickerChangeEvent): void {
    this.clearableValue.set(event.value as DateValue);
  }

  protected setTimestamp(event: DatePickerChangeEvent): void {
    this.timestampValue.set(event.value as DateValue);
  }
}
