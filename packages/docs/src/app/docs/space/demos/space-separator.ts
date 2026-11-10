import { Component } from '@angular/core';
import { TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-space-separator',
  imports: [TSpaceModule],
  template: `
    <t-space separator="|">
      <span>文本</span>
      <span>文本</span>
      <span>文本</span>
    </t-space>
  `,
})
export class DemoSeparator {}
