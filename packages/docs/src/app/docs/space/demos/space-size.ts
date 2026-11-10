import { Component } from '@angular/core';
import { TButtonModule, TDividerModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-space-size',
  imports: [TButtonModule, TDividerModule, TSpaceModule],
  template: `
    <t-space size="small">
      <t-button size="small">small</t-button>
      <t-button size="small">small</t-button>
    </t-space>
    <t-divider />
    <t-space size="medium">
      <t-button size="small">medium</t-button>
      <t-button size="small">medium</t-button>
    </t-space>
    <t-divider />
    <t-space size="large">
      <t-button size="small">large</t-button>
      <t-button size="small">large</t-button>
    </t-space>
    <t-divider />
    <t-space [size]="40">
      <t-button size="small">40px</t-button>
      <t-button size="small">40px</t-button>
    </t-space>
  `,
})
export class DemoSpaceSize {}
