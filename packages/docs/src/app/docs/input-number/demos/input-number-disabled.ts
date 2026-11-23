import { Component } from '@angular/core';
import { TInputNumber } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-number-disabled',
  imports: [TInputNumber],
  template: `
    <div class="demo-input-number-row">
      <t-input-number [defaultValue]="5" [disabled]="true" />
      <t-input-number [defaultValue]="5" [readonly]="true" />
      <t-input-number [defaultValue]="12" [max]="10" />
      <t-input-number [defaultValue]="5" [size]="'small'" />
      <t-input-number [defaultValue]="5" [size]="'large'" />
    </div>
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
export class DemoInputNumberDisabled {}
