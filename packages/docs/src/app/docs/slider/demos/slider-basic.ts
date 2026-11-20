import { Component, signal } from '@angular/core';
import { TSlider } from '@tdesign-ng/components';
import type { SliderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-slider-basic',
  imports: [TSlider],
  template: `
    <div class="demo-slider-list">
      <t-slider [value]="value()" [label]="true" (change)="value.set($event)" />
      <t-slider [defaultValue]="40" [label]="'当前 {value}'" [disabled]="true" />
    </div>
    <p class="demo-hint">value 为 {{ current() }}；第二个滑块为禁用态，提示文案里的 &#123;value&#125; 会被替换成当前值。</p>
  `,
})
export class DemoSliderBasic {
  protected readonly value = signal<SliderValue>(30);

  protected current(): string {
    const value = this.value();
    return Array.isArray(value) ? value.join(', ') : String(value);
  }
}
