import { Component, signal } from '@angular/core';
import { TRangeInput } from '@tdesign-ng/components';
import type { RangeInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-range-input-basic',
  imports: [TRangeInput],
  template: `
    <div class="demo-range-input-list">
      <t-range-input [(value)]="value" />
      <t-range-input
        [defaultValue]="['2024-01', '2024-12']"
        [separator]="'~'"
        [placeholder]="['开始月份', '结束月份']"
      />
    </div>
    <p class="demo-hint">第一个为受控用法，当前值：{{ value()[0] }} 到 {{ value()[1] }}。</p>
  `,
  styles: [
    `
      .demo-range-input-list {
        display: grid;
        gap: 16px;
        max-width: 460px;
      }
    `,
  ],
})
export class DemoRangeInputBasic {
  protected readonly value = signal<RangeInputValue>(['2024-01', '2024-12']);
}
