import { Component } from '@angular/core';
import { TTextareaModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-textarea-autosize',
  imports: [TTextareaModule],
  template: `
    <t-textarea placeholder="输入换行，高度自动增长，最多 6 行" [(value)]="value" [autosize]="{ minRows: 2, maxRows: 6 }" />
  `,
})
export class DemoTextareaAutosize {
  protected value = '第二行\n第三行';
}
