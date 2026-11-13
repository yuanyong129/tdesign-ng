import { Component } from '@angular/core';
import { TSpaceModule, TTextareaModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-textarea-status',
  imports: [TTextareaModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-textarea status="success" tips="校验通过" [autosize]="true" value="内容合法" />
      <t-textarea status="warning" tips="建议补充说明" [autosize]="true" value="内容偏短" />
      <t-textarea status="error" tips="内容不能为空" [autosize]="true" />
    </t-space>
  `,
})
export class DemoTextareaStatus {}
