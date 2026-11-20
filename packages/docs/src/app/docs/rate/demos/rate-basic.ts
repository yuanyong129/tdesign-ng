import { Component, signal } from '@angular/core';
import { TRate } from '@tdesign-ng/components';

@Component({
  selector: 'demo-rate-basic',
  imports: [TRate],
  template: `
    <div class="demo-rate-row">
      <t-rate [value]="value()" (change)="value.set($event.value)" />
    </div>
    <p class="demo-hint">当前评分：{{ value() }}；value 为受控值，(change) 抛出 &#123;value&#125; 对象。</p>
  `,
})
export class DemoRateBasic {
  protected readonly value = signal(3);
}
