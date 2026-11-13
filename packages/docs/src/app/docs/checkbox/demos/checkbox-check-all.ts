import { Component } from '@angular/core';
import { TCheckboxModule, TSpaceModule, type CheckboxGroupValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-checkbox-check-all',
  imports: [TCheckboxModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-checkbox-group [(value)]="checked">
        <t-space direction="vertical" [size]="8">
          <t-checkbox [checkAll]="true">全选</t-checkbox>
          <t-checkbox value="a">选项 A</t-checkbox>
          <t-checkbox value="b">选项 B</t-checkbox>
          <t-checkbox value="c">选项 C</t-checkbox>
        </t-space>
      </t-checkbox-group>
      <p class="demo-hint">选中：{{ checked.join('、') || '（空）' }}</p>
    </t-space>
  `,
})
export class DemoCheckboxCheckAll {
  protected checked: CheckboxGroupValue = ['a'];
}
