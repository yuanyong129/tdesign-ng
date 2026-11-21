import { Component, signal } from '@angular/core';
import { TTimePicker } from '@tdesign-ng/components';
import type { TimePickerChangeEvent, TimePickerValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-time-picker-options',
  imports: [TTimePicker],
  template: `
    <div class="demo-time-picker-list">
      <t-time-picker
        style="width: 220px"
        format="HH:mm"
        [steps]="quarterSteps"
        [value]="quarterValue()"
        [clearable]="true"
        (change)="setQuarter($event)"
      />
      <t-time-picker style="width: 220px" size="small" [disabled]="true" defaultValue="08:00:00" />
      <t-time-picker style="width: 220px" size="large" placeholder="请选择打卡时间" />
    </div>
    <p class="demo-hint">
      第一个 format="HH:mm" + steps=[1,15]，分钟只能选 00 / 15 / 30 / 45（当前
      {{ quarterValue() || '（空）' }}）；第二个禁用；第三个 large 尺寸与占位文案。
    </p>
  `,
})
export class DemoTimePickerOptions {
  protected readonly quarterValue = signal<TimePickerValue | undefined>(undefined);

  protected readonly quarterSteps = [1, 15];

  protected setQuarter(event: TimePickerChangeEvent): void {
    this.quarterValue.set(event.value ?? '');
  }
}
