import { Component } from '@angular/core';
import { TSpaceModule, TTextareaModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-textarea-disabled',
  imports: [TTextareaModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true" [size]="16">
      <t-textarea value="禁用状态的文本域" [disabled]="true" />
      <t-textarea value="只读状态的文本域" [readonly]="true" />
    </t-space>
  `,
})
export class DemoTextareaDisabled {}
