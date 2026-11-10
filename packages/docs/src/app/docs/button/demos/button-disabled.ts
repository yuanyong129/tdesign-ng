import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-disabled',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-button [disabled]="true">禁用按钮</t-button>
      <t-button [disabled]="true" theme="primary">禁用按钮</t-button>
      <t-button [loading]="true" theme="primary">加载中</t-button>
      <t-button [loading]="true" variant="outline">加载中</t-button>
    </t-space>
  `,
})
export class DemoButtonDisabled {}
