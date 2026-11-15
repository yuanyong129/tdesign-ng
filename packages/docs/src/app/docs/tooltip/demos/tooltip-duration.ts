import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule, TTooltipModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tooltip-duration',
  imports: [TTooltipModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      <t-tooltip content="2 秒后自动消失" [duration]="2000">
        <t-button variant="outline">自动消失</t-button>
      </t-tooltip>
      <t-tooltip content="延迟 500ms 出现" [delay]="500">
        <t-button variant="outline">延迟出现</t-button>
      </t-tooltip>
    </t-space>
    <p class="demo-hint">duration 控制自动消失，delay 控制出现延迟。</p>
  `,
})
export class DemoTooltipDuration {}
