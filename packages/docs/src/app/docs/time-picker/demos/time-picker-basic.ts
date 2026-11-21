import { Component, signal } from '@angular/core';
import { TTimePicker } from '@tdesign-ng/components';
import type { TimePickerChangeEvent, TimePickerValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-time-picker-basic',
  imports: [TTimePicker],
  template: `
    <div class="demo-time-picker-row" style="width: 240px">
      <t-time-picker [value]="value()" (change)="handleChange($event)" />
      <p class="demo-hint">当前选中：{{ value() || '（空）' }}；滚动点击时 / 分 / 秒后点「确定」提交。</p>
    </div>
  `,
})
export class DemoTimePickerBasic {
  protected readonly value = signal<TimePickerValue | undefined>('12:30:00');

  protected handleChange(event: TimePickerChangeEvent): void {
    this.value.set(event.value ?? '');
  }
}
