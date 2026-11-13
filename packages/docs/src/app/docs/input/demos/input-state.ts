import { Component } from '@angular/core';
import { TInputModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-state',
  imports: [TInputModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true" [size]="16">
      <t-input placeholder="禁用状态" value="不可编辑" [disabled]="true" />
      <t-input placeholder="只读状态" value="只读内容" [readonly]="true" />
      <t-input placeholder="无边框" value="无边框输入框" [borderless]="true" />
    </t-space>
  `,
})
export class DemoInputState {}
