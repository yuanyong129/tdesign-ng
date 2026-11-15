import { Component } from '@angular/core';
import { TButtonModule, TPopupModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popup-arrow',
  imports: [TPopupModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      <t-popup content="带箭头" placement="bottom">
        <t-button variant="outline">带箭头</t-button>
      </t-popup>
      <t-popup content="不带箭头" placement="bottom" [showArrow]="false">
        <t-button variant="outline">不带箭头</t-button>
      </t-popup>
    </t-space>
  `,
})
export class DemoPopupArrow {}
