import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule, TTooltipModule, type PopupPlacement } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tooltip-placement',
  imports: [TTooltipModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (item of placements; track item) {
        <t-tooltip [content]="item + ' 方向'" [placement]="item">
          <t-button variant="outline">{{ item }}</t-button>
        </t-tooltip>
      }
    </t-space>
  `,
})
export class DemoTooltipPlacement {
  protected readonly placements: PopupPlacement[] = ['top', 'bottom', 'left', 'right'];
}
