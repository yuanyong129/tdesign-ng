import { Component, signal } from '@angular/core';
import { TSlider } from '@tdesign-ng/components';
import type { SliderMarks, SliderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-slider-marks',
  imports: [TSlider],
  template: `
    <div class="demo-slider-list demo-slider-list--marks">
      <t-slider [value]="value()" [step]="10" [showStep]="true" [marks]="marks" [label]="true" (change)="value.set($event)" />
    </div>
    <p class="demo-hint">step 为 10、showStep 显示步长点，marks 定义带文案的刻度；当前值 {{ value() }}。</p>
  `,
})
export class DemoSliderMarks {
  protected readonly value = signal<SliderValue>(50);

  protected readonly marks: SliderMarks = { 0: '0°C', 25: '25°C', 50: '50°C', 75: '75°C', 100: '100°C' };
}
