import { Component, signal } from '@angular/core';
import { TRate } from '@tdesign-ng/components';

@Component({
  selector: 'demo-rate-options',
  imports: [TRate],
  template: `
    <div class="demo-rate-list">
      <t-rate
        [clearable]="true"
        [count]="10"
        [gap]="6"
        [color]="['#0052d9', '#e7e7e7']"
        [value]="value()"
        (change)="value.set($event.value)"
      />
      <t-rate [disabled]="true" [defaultValue]="3.5" [allowHalf]="true" />
    </div>
    <p class="demo-hint">clearable 时再次点击当前评分会清空（当前 {{ value() }}）；count / gap / color 可调数量、间距与选色；第二个为禁用态。</p>
  `,
})
export class DemoRateOptions {
  protected readonly value = signal(4);
}
