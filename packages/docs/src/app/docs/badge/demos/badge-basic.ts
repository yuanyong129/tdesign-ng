import { Component } from '@angular/core';
import { TBadgeModule, TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-badge-basic',
  imports: [TBadgeModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="24" [breakLine]="true">
      <t-badge count="8">
        <t-button variant="outline">消息</t-button>
      </t-badge>
      <t-badge [count]="120">
        <t-button variant="outline">封顶 99+</t-button>
      </t-badge>
      <t-badge [dot]="true">
        <t-button variant="outline">小红点</t-button>
      </t-badge>
      <t-badge count="0">
        <t-button variant="outline">0 不显示</t-button>
      </t-badge>
    </t-space>
    <p class="demo-hint">count 超过 maxCount（默认 99）显示 99+，count 为 0 时默认隐藏。</p>
  `,
})
export class DemoBadgeBasic {}
