import { Component, signal } from '@angular/core';
import { TSlider } from '@tdesign-ng/components';
import type { SliderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-slider-vertical',
  imports: [TSlider],
  template: `
    <div class="demo-slider-row">
      <t-slider class="demo-slider-vertical" layout="vertical" [value]="value()" [label]="true" (change)="value.set($event)" />
      <t-slider class="demo-slider-vertical" layout="vertical" range [value]="rangeValue()" [label]="true" (change)="rangeValue.set($event)" />
      <p class="demo-hint">竖向布局需要给宿主元素设定高度；当前单值 {{ text(value()) }}，区间 {{ rangeText() }}。</p>
    </div>
  `,
})
export class DemoSliderVertical {
  protected readonly value = signal<SliderValue>(40);
  protected readonly rangeValue = signal<SliderValue>([30, 80]);

  protected text(value: SliderValue): string {
    return Array.isArray(value) ? value.join(', ') : String(value);
  }

  protected rangeText(): string {
    const value = this.rangeValue();
    return Array.isArray(value) ? value.join(' - ') : String(value);
  }
}
