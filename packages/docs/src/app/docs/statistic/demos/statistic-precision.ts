import { Component } from '@angular/core';
import { TStatisticModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-statistic-precision',
  imports: [TStatisticModule],
  template: `
    <div style="display: flex; gap: 32px; align-items: flex-start">
      <t-statistic title="保留 2 位小数" [value]="1234.5678" [decimalPlaces]="2" />
      <t-statistic title="保留 4 位小数" [value]="1234.5678" [decimalPlaces]="4" />
      <t-statistic title="关闭千分位" [value]="12345678.9" separator="" [decimalPlaces]="2" />
      <t-statistic title="自定义格式化" [value]="1234.5678" [format]="formatValue" />
    </div>
  `,
})
export class DemoStatisticPrecision {
  /** format 完全接管格式化，decimalPlaces 与 separator 不再生效。 */
  protected readonly formatValue = (value: number): number => Math.round(value);
}
