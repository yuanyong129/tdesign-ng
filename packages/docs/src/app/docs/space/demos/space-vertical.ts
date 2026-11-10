import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-space-vertical',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space direction="vertical" align="start">
      <t-button theme="primary">按钮</t-button>
      <t-button theme="primary">按钮</t-button>
      <t-button theme="primary">按钮</t-button>
    </t-space>
  `,
})
export class DemoSpaceVertical {}
