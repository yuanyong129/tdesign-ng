import { Component } from '@angular/core';
import { TTextareaModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-textarea-basic',
  imports: [TTextareaModule],
  template: `
    <t-textarea placeholder="请输入多行内容" [(value)]="value" />
  `,
})
export class DemoTextareaBasic {
  protected value = '';
}
