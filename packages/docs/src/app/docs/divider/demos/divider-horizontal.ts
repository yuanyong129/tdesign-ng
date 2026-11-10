import { Component } from '@angular/core';
import { TDividerModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-divider-horizontal',
  imports: [TDividerModule],
  template: `
    <p>通过设置内容区块的分割线，让结构更清晰。</p>
    <t-divider />
    <p>使用虚线分割线。</p>
    <t-divider [dashed]="true" />
    <p>分割线可以带文字。</p>
    <t-divider>文字分割线</t-divider>
  `,
})
export class DemoDividerHorizontal {}
