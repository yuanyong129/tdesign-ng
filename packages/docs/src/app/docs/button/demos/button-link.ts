import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-link',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-button href="https://tdesign.tencent.com/" target="_blank" variant="text" theme="primary">跳转链接</t-button>
      <t-button tag="div" variant="outline">div 按钮</t-button>
    </t-space>
  `,
})
export class DemoButtonLink {}
