import { Component } from '@angular/core';
import { TInputModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-size',
  imports: [TInputModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true" [size]="16">
      <t-input size="small" placeholder="小尺寸" />
      <t-input size="medium" placeholder="中尺寸（默认）" />
      <t-input size="large" placeholder="大尺寸" />
    </t-space>
  `,
})
export class DemoInputSize {}
