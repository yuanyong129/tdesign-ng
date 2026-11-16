import { Component } from '@angular/core';
import { TBadgeModule, TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-badge-shape',
  imports: [TBadgeModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="24" [breakLine]="true">
      <t-badge count="12" shape="circle">
        <t-button variant="outline">circle</t-button>
      </t-badge>
      <t-badge count="12" shape="round">
        <t-button variant="outline">round</t-button>
      </t-badge>
      <t-badge count="12" size="small">
        <t-button variant="outline">small</t-button>
      </t-badge>
      <t-badge count="0" [showZero]="true">
        <t-button variant="outline">showZero</t-button>
      </t-badge>
      <t-badge count="6" color="#e37318" [offset]="[6, 2]">
        <t-button variant="outline">offset / color</t-button>
      </t-badge>
    </t-space>
    <p class="demo-hint">shape 控制徽标圆角，offset 微调位置，color 覆盖底色。</p>
  `,
})
export class DemoBadgeShape {}
