import { Component } from '@angular/core';
import { TStatisticModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-statistic-trend',
  imports: [TStatisticModule],
  template: `
    <div style="display: flex; gap: 32px; align-items: flex-start">
      <t-statistic title="周同比" [value]="12.5" trend="increase" color="red" extra="较上周上涨" />
      <t-statistic
        title="日环比"
        [value]="8.1"
        trend="decrease"
        trend-placement="right"
        extra="较昨日下降"
      />
      <t-statistic title="加载中" [value]="9999" loading extra="数值加载时显示骨架屏" />
    </div>
  `,
})
export class DemoStatisticTrend {}
