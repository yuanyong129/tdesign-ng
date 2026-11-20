import { Component, signal } from '@angular/core';
import { TRate } from '@tdesign-ng/components';

@Component({
  selector: 'demo-rate-text',
  imports: [TRate],
  template: `
    <div class="demo-rate-list">
      <t-rate [showText]="true" [value]="value()" (change)="value.set($event.value)" />
      <t-rate
        [showText]="true"
        [texts]="texts"
        [defaultValue]="4"
        [size]="'20px'"
      />
    </div>
    <p class="demo-hint">showText 在当前评分右侧显示文案，texts 可自定义每一档的文案；不传 texts 时使用内置文案。</p>
  `,
})
export class DemoRateText {
  protected readonly value = signal(3);
  protected readonly texts = ['很差', '较差', '一般', '不错', '很好'];
}
