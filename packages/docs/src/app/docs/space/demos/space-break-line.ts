import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-space-break-line',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <div style="width: 320px">
      <t-space [breakLine]="true" [size]="8">
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
      </t-space>
    </div>
  `,
})
export class DemoSpaceBreakLine {}
