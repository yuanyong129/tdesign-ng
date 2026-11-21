import { Component, signal } from '@angular/core';
import { TDateRangePicker } from '@tdesign-ng/components';
import type { DateRangePickerChangeEvent, DateRangeValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-date-range-picker-time',
  imports: [TDateRangePicker],
  template: `
    <div class="demo-date-picker-list">
      <t-date-range-picker
        style="width: 420px"
        [value]="value()"
        [enableTimePicker]="true"
        [clearable]="true"
        (change)="handleChange($event)"
      />
      <t-date-range-picker
        style="width: 420px"
        [value]="instant()"
        [enableTimePicker]="true"
        [needConfirm]="false"
        [defaultTime]="['09:00:00', '18:00:00']"
        [clearable]="true"
        (change)="handleInstant($event)"
      />
    </div>
    <p class="demo-hint">
      第一个开启 enableTimePicker：面板只展示当前一侧的日期 + 时分秒列，先点开始日期、再点结束日期，点「确定」提交（当前
      {{ value()[0] || '（空）' }} ~ {{ value()[1] || '（空）' }}）。第二个 needConfirm=false，选完结束日期立即用
      defaultTime 09:00:00 / 18:00:00 提交（当前 {{ instant()[0] || '（空）' }} ~ {{ instant()[1] || '（空）' }}）。
    </p>
  `,
})
export class DemoDateRangePickerTime {
  protected readonly value = signal<DateRangeValue>(['2024-05-10 08:00:00', '2024-05-20 18:00:00']);
  protected readonly instant = signal<DateRangeValue>([]);

  protected handleChange(event: DateRangePickerChangeEvent): void {
    this.value.set(event.value);
  }

  protected handleInstant(event: DateRangePickerChangeEvent): void {
    this.instant.set(event.value);
  }
}
