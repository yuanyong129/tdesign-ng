import { Component } from '@angular/core';
import { TCheckboxModule, TSpaceModule, type CheckboxGroupValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-checkbox-max',
  imports: [TCheckboxModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-checkbox-group [max]="2" [(value)]="checked">
        <t-checkbox value="a">选项 A</t-checkbox>
        <t-checkbox value="b">选项 B</t-checkbox>
        <t-checkbox value="c">选项 C</t-checkbox>
      </t-checkbox-group>
      <p class="demo-hint">最多选 2 个，当前：{{ checked.join('、') || '（空）' }}</p>
    </t-space>
  `,
})
export class DemoCheckboxMax {
  protected checked: CheckboxGroupValue = [];
}
