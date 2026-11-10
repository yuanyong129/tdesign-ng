import { Component } from '@angular/core';
import { TButtonModule, TDividerModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-space-align',
  imports: [TButtonModule, TDividerModule, TSpaceModule],
  template: `
    <t-space align="start" [size]="16" style="height: 80px">
      <t-button size="small">start</t-button>
      <t-button size="large">start</t-button>
    </t-space>
    <t-divider />
    <t-space align="center" [size]="16" style="height: 80px">
      <t-button size="small">center</t-button>
      <t-button size="large">center</t-button>
    </t-space>
    <t-divider />
    <t-space align="end" [size]="16" style="height: 80px">
      <t-button size="small">end</t-button>
      <t-button size="large">end</t-button>
    </t-space>
  `,
})
export class DemoSpaceAlign {}
