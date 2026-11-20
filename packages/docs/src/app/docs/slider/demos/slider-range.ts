import { Component, signal } from '@angular/core';
import { TSlider } from '@tdesign-ng/components';
import type { SliderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-slider-range',
  imports: [TSlider],
  template: `
    <div class="demo-slider-list">
      <t-slider range [value]="value()" [label]="'{value}%'" (change)="value.set($event)" />
    </div>
    <p class="demo-hint">区间选择：当前 {{ text() }}，两个滑块靠近时会自动交换顺序。</p>
  `,
})
export class DemoSliderRange {
  protected readonly value = signal<SliderValue>([20, 60]);

  protected text(): string {
    const value = this.value();
    return Array.isArray(value) ? `${value[0]}% - ${value[1]}%` : `${value}%`;
  }
}
