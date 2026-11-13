import { Component } from '@angular/core';
import { TInputModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-label',
  imports: [TInputModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-input label="姓名" placeholder="请输入姓名" [(value)]="value" />
      <t-input label="邮箱" placeholder="name@example.com" tips="用于接收通知" [(value)]="email" />
      <p class="demo-hint">姓名：{{ value || '（空）' }}</p>
    </t-space>
  `,
})
export class DemoInputLabel {
  protected value = '';
  protected email = '';
}
