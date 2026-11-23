import { Component } from '@angular/core';
import { TRangeInput } from '@tdesign-ng/components';

@Component({
  selector: 'demo-range-input-advanced',
  imports: [TRangeInput],
  template: `
    <div class="demo-range-input-list">
      <t-range-input
        [prefixIcon]="prefix"
        label="金额"
        suffix="元"
        tips="支持两位小数，例如 0.00 到 9999.99"
        [defaultValue]="[0, 100]"
        [separator]="'—'"
      />
      <t-range-input
        [status]="'success'"
        [tips]="'输入合法'"
        [size]="'large'"
        [defaultValue]="['10', '20']"
      />
      <t-range-input [size]="'small'" [tips]="'小尺寸'" [defaultValue]="['1', '2']" />
    </div>
    <ng-template #prefix><span>¥</span></ng-template>
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
export class DemoRangeInputAdvanced {}
