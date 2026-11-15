import { Component } from '@angular/core';
import { TButtonModule, TPopupModule, TSpaceModule, type PopupPlacement } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popup-placement',
  imports: [TPopupModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (item of placements; track item) {
        <t-popup [content]="item + ' 方向的弹层'" [placement]="item">
          <t-button variant="outline">{{ item }}</t-button>
        </t-popup>
      }
    </t-space>
  `,
})
export class DemoPopupPlacement {
  protected readonly placements: PopupPlacement[] = ['top', 'bottom', 'left', 'right'];
}
