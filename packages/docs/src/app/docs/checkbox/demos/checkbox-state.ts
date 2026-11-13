import { Component } from '@angular/core';
import { TCheckboxModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-checkbox-state',
  imports: [TCheckboxModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-checkbox [disabled]="true">禁用未选中</t-checkbox>
      <t-checkbox [disabled]="true" [checked]="true">禁用已选中</t-checkbox>
      <t-checkbox [readonly]="true" [checked]="true">只读</t-checkbox>
      <t-checkbox [indeterminate]="true">半选状态</t-checkbox>
    </t-space>
  `,
})
export class DemoCheckboxState {}
