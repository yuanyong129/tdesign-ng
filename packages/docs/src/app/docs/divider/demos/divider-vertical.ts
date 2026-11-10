import { Component } from '@angular/core';
import { TDividerModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-divider-vertical',
  imports: [TDividerModule, TSpaceModule],
  template: `
    <t-space align="center">
      <span>文本</span>
      <t-divider layout="vertical" />
      <span>文本</span>
      <t-divider layout="vertical" />
      <span>文本</span>
    </t-space>
  `,
})
export class DemoDividerVertical {}
