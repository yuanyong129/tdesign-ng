import { Component, signal } from '@angular/core';
import { TRate } from '@tdesign-ng/components';

@Component({
  selector: 'demo-rate-half',
  imports: [TRate],
  template: `
    <div class="demo-rate-row">
      <t-rate [allowHalf]="true" [value]="value()" (change)="value.set($event.value)" />
    </div>
    <p class="demo-hint">allowHalf 允许半星，当前值 {{ value() }}（鼠标靠近图标左半边即可选中半星）。</p>
  `,
})
export class DemoRateHalf {
  protected readonly value = signal(2.5);
}
