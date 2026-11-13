import { Component } from '@angular/core';
import { TInputModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-basic',
  imports: [TInputModule],
  template: `
    <t-input placeholder="请输入内容" [(value)]="value" />
    <p class="demo-hint">当前值：{{ value || '（空）' }}</p>
  `,
})
export class DemoInputBasic {
  protected value = '';
}
