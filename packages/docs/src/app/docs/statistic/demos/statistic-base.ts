import { Component } from '@angular/core';
import { TStatisticModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-statistic-base',
  imports: [TStatisticModule],
  template: `
    <t-statistic title="本月成交额" prefix="￥" [value]="1234567.89" unit="元" />
  `,
})
export class DemoStatisticBase {}
