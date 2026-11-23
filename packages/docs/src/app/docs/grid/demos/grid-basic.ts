import { Component } from '@angular/core';
import { TGridModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-grid-basic',
  imports: [TGridModule],
  styles: [
    `
      .cell {
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        background: var(--td-brand-color-light);
      }
    `,
  ],
  template: `
    <t-row>
      <t-col span="12"><div class="cell">span 12</div></t-col>
    </t-row>
    <t-row style="margin-top: 12px;">
      <t-col span="6"><div class="cell">span 6</div></t-col>
      <t-col span="6"><div class="cell">span 6</div></t-col>
    </t-row>
    <t-row style="margin-top: 12px;">
      <t-col span="4"><div class="cell">span 4</div></t-col>
      <t-col span="4"><div class="cell">span 4</div></t-col>
      <t-col span="4"><div class="cell">span 4</div></t-col>
    </t-row>
  `,
})
export class DemoGridBasic {}
