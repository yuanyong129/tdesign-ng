import { Component } from '@angular/core';
import { TColorPickerModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-color-picker-base',
  imports: [TColorPickerModule],
  styles: [
    `
      .demo-color-picker-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .demo-color-picker-value {
        color: var(--td-text-color-secondary);
        font-size: 14px;
      }
    `,
  ],
  template: `
    <div class="demo-color-picker-row">
      <t-color-picker format="HEX" [value]="color" (change)="color = $event.value" />
      <span class="demo-color-picker-value">当前颜色：{{ color }}</span>
    </div>
  `,
})
export class DemoColorPickerBase {
  protected color = '#0052D9';
}
