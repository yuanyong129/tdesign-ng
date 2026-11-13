import { Component } from '@angular/core';
import { TRadioModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-radio-basic',
  imports: [TRadioModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-radio [checked]="true">已选中</t-radio>
      <t-radio>未选中</t-radio>
      <p class="demo-hint">单独使用时不参与分组，可用 [checked] 或 [(checked)] 控制。</p>
    </t-space>
  `,
})
export class DemoRadioBasic {}
