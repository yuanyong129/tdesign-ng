import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-theme',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-button theme="default">默认</t-button>
      <t-button theme="primary">主要</t-button>
      <t-button theme="danger">危险</t-button>
      <t-button theme="warning">警告</t-button>
      <t-button theme="success">成功</t-button>
    </t-space>
  `,
})
export class DemoButtonTheme {}
