import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-shape',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-button shape="rectangle" theme="primary">矩形按钮</t-button>
      <t-button shape="square" theme="primary">方</t-button>
      <t-button shape="round" theme="primary">圆角按钮</t-button>
      <t-button shape="circle" theme="primary">圆</t-button>
    </t-space>
  `,
})
export class DemoButtonShape {}
