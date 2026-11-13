import { Component } from '@angular/core';
import { TInputModule } from '@tdesign-ng/components';
import { TIcon } from '@tdesign-ng/icons';

@Component({
  selector: 'demo-input-icon',
  imports: [TInputModule, TIcon],
  template: `
    <t-input placeholder="搜索" [(value)]="value">
      <t-icon tInputPrefixIcon name="search" />
    </t-input>
    <t-input placeholder="请输入用户名">
      <t-icon tInputSuffixIcon name="user" />
    </t-input>
  `,
})
export class DemoInputIcon {
  protected value = '';
}
