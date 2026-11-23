import { Component, signal } from '@angular/core';
import { TInputNumber } from '@tdesign-ng/components';
import type { InputNumberValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-number-advanced',
  imports: [TInputNumber],
  template: `
    <div class="demo-input-number-row">
      <t-input-number
        [defaultValue]="0"
        [step]="0.1"
        [decimalPlaces]="1"
        [min]="0"
        [max]="10"
        suffix="元"
        tips="step 为 0.1，最多保留 1 位小数"
      />
      <t-input-number
        [defaultValue]="100"
        [step]="10"
        [allowInputOverLimit]="false"
        [min]="0"
        [max]="100"
        label="数量"
      />
      <t-input-number
        [value]="big()"
        [largeNumber]="true"
        [step]="1"
        (valueChange)="big.set($event)"
      />
    </div>
    <p class="demo-hint">大数当前值：{{ big() ?? '空' }}</p>
  `,
  styles: [
    `
      .demo-input-number-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: flex-start;
      }
    `,
  ],
})
export class DemoInputNumberAdvanced {
  protected readonly big = signal<InputNumberValue | undefined>('123456789012345678901');
}
