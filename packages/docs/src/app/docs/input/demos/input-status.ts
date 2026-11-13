import { Component } from '@angular/core';
import { TInputModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-status',
  imports: [TInputModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true" [size]="16">
      <t-input status="success" tips="校验通过" value="TDesign" />
      <t-input status="warning" tips="这个用户名不太常见" value="tdesign-ng" />
      <t-input status="error" tips="该用户名已被占用" value="admin" />
    </t-space>
  `,
})
export class DemoInputStatus {}
