import { Component } from '@angular/core';
import { TGridModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-grid-offset',
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
      <t-col span="4"><div class="cell">span 4</div></t-col>
      <t-col span="4" offset="4"><div class="cell">span 4 offset 4</div></t-col>
    </t-row>
    <t-row style="margin-top: 12px;">
      <t-col span="4" push="4"><div class="cell">push 4</div></t-col>
      <t-col span="4" pull="4"><div class="cell">pull 4</div></t-col>
    </t-row>
    <t-row style="margin-top: 12px;">
      <t-col span="4" order="2"><div class="cell">order 2</div></t-col>
      <t-col span="4" order="1"><div class="cell">order 1</div></t-col>
    </t-row>
  `,
})
export class DemoGridOffset {}
