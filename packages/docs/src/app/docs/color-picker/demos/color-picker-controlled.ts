import { Component } from '@angular/core';
import { TButtonModule, TColorPickerModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-color-picker-controlled',
  imports: [TColorPickerModule, TButtonModule],
  styles: [
    `
      .demo-color-picker-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px;
      }

      .demo-color-picker-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }
    `,
  ],
  template: `
    <div class="demo-color-picker-row">
      <t-color-picker format="HEX" [value]="color" (change)="color = $event.value" />
      <t-color-picker format="HEX" [value]="color" [disabled]="true" />
    </div>
    <div class="demo-color-picker-actions">
      <t-button size="small" (click)="color = '#0052D9'">品牌蓝</t-button>
      <t-button size="small" (click)="color = '#00A870'">成功绿</t-button>
      <t-button size="small" (click)="color = '#E34D59'">错误红</t-button>
    </div>
  `,
})
export class DemoColorPickerControlled {
  protected color = '#0052D9';
}
