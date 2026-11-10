import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-variant',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-button variant="base" theme="default">基础按钮</t-button>
      <t-button variant="outline" theme="default">描边按钮</t-button>
      <t-button variant="dashed" theme="default">虚线按钮</t-button>
      <t-button variant="text" theme="default">文本按钮</t-button>
    </t-space>
  `,
})
export class DemoButtonVariant {}
