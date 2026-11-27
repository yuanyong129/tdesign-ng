import { Component } from '@angular/core';
import { TInputModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-limit',
  imports: [TInputModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true" [size]="16">
      <t-input placeholder="加权长度最多 10" [maxcharacter]="10" [showLimitNumber]="true" [(value)]="short" />
      <t-input placeholder="最多 6 个码点，含 emoji" [maxlength]="6" [showLimitNumber]="true" />
    </t-space>
  `,
})
export class DemoInputLimit {
  protected short = '';
}
