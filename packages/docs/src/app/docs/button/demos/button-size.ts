import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-size',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space align="center" [breakLine]="true">
      <t-button size="small" theme="primary">小尺寸</t-button>
      <t-button size="medium" theme="primary">中尺寸</t-button>
      <t-button size="large" theme="primary">大尺寸</t-button>
    </t-space>
  `,
})
export class DemoButtonSize {}
