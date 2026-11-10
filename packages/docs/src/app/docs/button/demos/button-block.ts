import { Component } from '@angular/core';
import { TButtonModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-block',
  imports: [TButtonModule],
  template: `
    <t-button [block]="true" theme="primary">块级按钮</t-button>
  `,
})
export class DemoButtonBlock {}
