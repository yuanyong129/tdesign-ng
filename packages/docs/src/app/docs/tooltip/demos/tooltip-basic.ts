import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule, TTooltipModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tooltip-basic',
  imports: [TTooltipModule, TButtonModule, TSpaceModule],
  template: `
    <t-tooltip content="文字提示">
      <t-button variant="outline">悬停查看</t-button>
    </t-tooltip>
    <p class="demo-hint">默认出现在触发器上方，内容为纯文本。</p>
  `,
})
export class DemoTooltipBasic {}
