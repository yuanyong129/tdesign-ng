import { Component } from '@angular/core';
import { TButtonModule, TPopupModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popup-basic',
  imports: [TPopupModule, TButtonModule],
  template: `
    <t-popup content="这是一个弹出层">
      <t-button variant="outline">悬停查看</t-button>
    </t-popup>
    <p class="demo-hint">默认触发方式是 hover，弹层内容可以用 content 传纯文本。</p>
  `,
})
export class DemoPopupBasic {}
