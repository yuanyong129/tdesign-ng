import { Component, signal } from '@angular/core';
import { TDatePicker } from '@tdesign-ng/components';
import type {
  DatePickerChangeEvent,
  DateValue,
  PanelActiveDate,
  PresetDate,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-picker-presets',
  imports: [TDatePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-picker
        style="width: 240px"
        [value]="bottomValue()"
        [presets]="bottomPresets"
        [clearable]="true"
        (change)="setBottom($event)"
      />
      <t-date-picker
        style="width: 240px"
        [value]="rightValue()"
        [presets]="rightPresets"
        presetsPlacement="right"
        [clearable]="true"
        (change)="setRight($event)"
      />
      <t-date-picker
        style="width: 280px"
        [value]="inputValue()"
        [allowInput]="true"
        [panelActiveDate]="activeDate"
        placeholder="输入 2024-05-20 后回车"
        (change)="setInput($event)"
      />
    </div>
    <p class="demo-hint">
      第一个预设放在底部（昨天 / 今天 / 固定日期），第二个放在右侧（本月第一天），点预设直接提交；
      第三个允许手输，并用 panelActiveDate 指定初始显示 2024 年 5 月。当前选中：{{ bottomValue() || '（空）' }} /
      {{ rightValue() || '（空）' }} / {{ inputValue() || '（空）' }}。
    </p>
  `,
})
export class DemoDatePickerPresets {
  protected readonly bottomValue = signal<DateValue | undefined>(undefined);
  protected readonly rightValue = signal<DateValue | undefined>(undefined);
  protected readonly inputValue = signal<DateValue | undefined>(undefined);

  protected readonly activeDate: PanelActiveDate = { year: '2024', month: 5 };

  protected readonly bottomPresets: PresetDate = {
    昨天: () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    },
    今天: () => new Date(),
    '2024-05-20': '2024-05-20',
  };

  protected readonly rightPresets: PresetDate = {
    本月第一天: () => {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    本月最后一天: () => {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    },
  };

  protected setBottom(event: DatePickerChangeEvent): void {
    this.bottomValue.set(event.value as DateValue);
  }

  protected setRight(event: DatePickerChangeEvent): void {
    this.rightValue.set(event.value as DateValue);
  }

  protected setInput(event: DatePickerChangeEvent): void {
    this.inputValue.set(event.value as DateValue);
  }
}
