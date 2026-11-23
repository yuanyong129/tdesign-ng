import { Component } from '@angular/core';
import { TRangeInput } from '@tdesign-ng/components';

@Component({
  selector: 'demo-range-input-disabled',
  imports: [TRangeInput],
  template: `
    <div class="demo-range-input-list">
      <t-range-input [defaultValue]="['1', '2']" [disabled]="true" />
      <t-range-input [defaultValue]="['1', '2']" [disabled]="[true, false]" />
      <t-range-input [defaultValue]="['1', '2']" [clearable]="true" />
      <t-range-input [defaultValue]="['1', '2']" [borderless]="true" [readonly]="true" />
    </div>
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
export class DemoRangeInputDisabled {}
