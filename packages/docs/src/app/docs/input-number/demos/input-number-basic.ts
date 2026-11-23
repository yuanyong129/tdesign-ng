import { Component, signal } from '@angular/core';
import { TInputNumber } from '@tdesign-ng/components';
import type { InputNumberValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-number-basic',
  imports: [TInputNumber],
  template: `
    <div class="demo-input-number-row">
      <t-input-number [(value)]="value" />
      <t-input-number [defaultValue]="3" [min]="0" [max]="10" />
      <t-input-number [defaultValue]="2" [theme]="'column'" />
      <t-input-number [defaultValue]="4" [theme]="'normal'" />
    </div>
    <p class="demo-hint">受控示例当前值：{{ value() ?? '空' }}</p>
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
export class DemoInputNumberBasic {
  protected readonly value = signal<InputNumberValue | undefined>(3);
}
