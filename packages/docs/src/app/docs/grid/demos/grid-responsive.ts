import { Component } from '@angular/core';
import { TGridModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-grid-responsive',
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
    <p style="margin: 0 0 8px; color: var(--td-text-color-secondary);">
      缩小窗口可见列宽变化：xs 12 格、md 8 格、lg 6 格、xxl 4 格。
    </p>
    <t-row>
      <t-col [xs]="12" [md]="8" [lg]="6" [xxl]="4"><div class="cell">1</div></t-col>
      <t-col [xs]="12" [md]="8" [lg]="6" [xxl]="4"><div class="cell">2</div></t-col>
      <t-col [xs]="12" [md]="8" [lg]="6" [xxl]="4"><div class="cell">3</div></t-col>
    </t-row>

    <p style="margin: 24px 0 8px; color: var(--td-text-color-secondary);">
      断点也可以传对象，例如 md 时 span 6 并偏移 3 格。
    </p>
    <t-row>
      <t-col [xs]="12" [md]="{ span: 6, offset: 3 }"><div class="cell">span 6 offset 3</div></t-col>
    </t-row>
  `,
})
export class DemoGridResponsive {}
