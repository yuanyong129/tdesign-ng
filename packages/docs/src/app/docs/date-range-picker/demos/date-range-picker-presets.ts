import { Component, signal } from '@angular/core';
import { TDateRangePicker } from '@tdesign-ng/components';
import type {
  DateRangePickerChangeEvent,
  DateRangeValue,
  PresetDateRange,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-range-picker-presets',
  imports: [TDateRangePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-range-picker
        style="width: 380px"
        [value]="value()"
        [presets]="presets"
        [clearable]="true"
        (change)="handleChange($event)"
      />
      <t-date-range-picker
        style="width: 400px"
        [value]="typed()"
        [allowInput]="true"
        separator="至"
        [clearable]="true"
        (change)="handleTyped($event)"
      />
    </div>
    <p class="demo-hint">
      第一个用 presets 提供「近 7 天 / 本月 / 固定一周」快捷范围，点预设直接提交并收起（当前
      {{ value()[0] || '（空）' }} ~ {{ value()[1] || '（空）' }}）；第二个 allowInput
      可直接输入两个日期、分隔符改成「至」，输入后按 Enter 或失焦提交（当前 {{ typed()[0] || '（空）' }} ~
      {{ typed()[1] || '（空）' }}）。
    </p>
  `,
})
export class DemoDateRangePickerPresets {
  protected readonly value = signal<DateRangeValue>(['2024-05-06', '2024-05-12']);
  protected readonly typed = signal<DateRangeValue>([]);

  protected readonly presets: PresetDateRange = {
    近7天: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
      const format = (date: Date): string =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return [format(start), format(end)];
    },
    本月: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const format = (date: Date): string =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return [format(start), format(end)];
    },
    固定一周: ['2024-05-06', '2024-05-12'],
  };

  protected handleChange(event: DateRangePickerChangeEvent): void {
    this.value.set(event.value);
  }

  protected handleTyped(event: DateRangePickerChangeEvent): void {
    this.typed.set(event.value);
  }
}
