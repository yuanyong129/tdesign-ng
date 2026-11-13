import { Component } from '@angular/core';
import { TTextareaModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-textarea-limit',
  imports: [TTextareaModule],
  template: `
    <t-textarea placeholder="最多 30 个字符" [maxcharacter]="30" [(value)]="value" [autosize]="{ minRows: 2 }" />
  `,
})
export class DemoTextareaLimit {
  protected value = '';
}
