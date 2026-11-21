import { Component, signal } from '@angular/core';
import { TTimePicker, TTimePickerValueDisplay } from '@tdesign-ng/components';
import type {
  DisableTime,
  PresetTime,
  TimePickerChangeEvent,
  TimePickerValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-time-picker-presets',
  imports: [TTimePicker, TTimePickerValueDisplay],
  template: `
    <div class="demo-time-picker-list">
      <t-time-picker
        style="width: 220px"
        [value]="presetValue()"
        [presets]="presets"
        [clearable]="true"
        (change)="setPreset($event)"
      />
      <t-time-picker
        style="width: 220px"
        [value]="disabledValue()"
        [disableTime]="disableTime"
        [hideDisabledTime]="false"
        defaultValue="09:00:00"
        [clearable]="true"
        (change)="setDisabled($event)"
      />
      <t-time-picker
        style="width: 220px"
        format="HH:mm"
        [allowInput]="true"
        [value]="inputValue()"
        placeholder="输入 09:15"
        (change)="setInput($event)"
      />
      <t-time-picker style="width: 240px" [value]="displayValue()" (change)="setDisplay($event)">
        <ng-template tTimePickerValueDisplay let-value>
          <span class="demo-time-display">已选 {{ value || '（空）' }}</span>
        </ng-template>
      </t-time-picker>
    </div>
    <p class="demo-hint">
      第一个用 presets 提供「早餐 / 午餐 / 下班」快捷时间（仍需点确定）；第二个 disableTime 禁用 0~8 点并置灰显示；第三个
      allowInput 可直接输入 HH:mm；第四个用 tTimePickerValueDisplay 自定义回显。当前：{{ presetValue() || '（空）' }} /
      {{ disabledValue() || '（空）' }} / {{ inputValue() || '（空）' }} / {{ displayValue() || '（空）' }}。
    </p>
  `,
})
export class DemoTimePickerPresets {
  protected readonly presetValue = signal<TimePickerValue | undefined>(undefined);
  protected readonly disabledValue = signal<TimePickerValue | undefined>(undefined);
  protected readonly inputValue = signal<TimePickerValue | undefined>(undefined);
  protected readonly displayValue = signal<TimePickerValue | undefined>('12:30:00');

  protected readonly presets: PresetTime = {
    早餐: '08:00:00',
    午餐: '12:00:00',
    下班: () => '18:30:00',
  };

  protected readonly disableTime: DisableTime = (hour) =>
    hour < 9 ? { hour: [0, 1, 2, 3, 4, 5, 6, 7, 8] } : undefined;

  protected setPreset(event: TimePickerChangeEvent): void {
    this.presetValue.set(event.value ?? '');
  }

  protected setDisabled(event: TimePickerChangeEvent): void {
    this.disabledValue.set(event.value ?? '');
  }

  protected setInput(event: TimePickerChangeEvent): void {
    this.inputValue.set(event.value ?? '');
  }

  protected setDisplay(event: TimePickerChangeEvent): void {
    this.displayValue.set(event.value ?? '');
  }
}
