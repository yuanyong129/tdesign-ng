import { Component } from '@angular/core';
import { TInputModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-limit',
  imports: [TInputModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true" [size]="16">
      <t-input placeholder="最多 10 个字符" [maxcharacter]="10" [showLimitNumber]="true" [(value)]="short" />
      <t-input placeholder="最多 6 个字符（npm 输入会截断）" [maxcharacter]="6" [showLimitNumber]="true" />
    </t-space>
  `,
})
export class DemoInputLimit {
  protected short = '';
}
