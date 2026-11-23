import { Component } from '@angular/core';
import { TGridModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-grid-gutter',
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
    <p style="margin: 0 0 8px; color: var(--td-text-color-secondary);">水平间距 24px：</p>
    <t-row [gutter]="24">
      <t-col span="6"><div class="cell">span 6</div></t-col>
      <t-col span="6"><div class="cell">span 6</div></t-col>
    </t-row>

    <p style="margin: 24px 0 8px; color: var(--td-text-color-secondary);">
      水平与垂直间距 16px（两列 span 8 会折行，用于看清垂直间距）：
    </p>
    <t-row [gutter]="[16, 16]">
      <t-col span="12"><div class="cell">span 12</div></t-col>
      <t-col span="8"><div class="cell">span 8</div></t-col>
      <t-col span="8"><div class="cell">span 8</div></t-col>
    </t-row>
  `,
})
export class DemoGridGutter {}
