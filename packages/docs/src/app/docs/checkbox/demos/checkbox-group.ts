import { Component } from '@angular/core';
import { TCheckboxModule, TSpaceModule, type CheckboxGroupValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-checkbox-group',
  imports: [TCheckboxModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-checkbox-group [(value)]="checked">
        <t-checkbox value="reading">阅读</t-checkbox>
        <t-checkbox value="music">音乐</t-checkbox>
        <t-checkbox value="sport">运动</t-checkbox>
      </t-checkbox-group>
      <p class="demo-hint">选中：{{ checked.join('、') || '（空）' }}</p>
    </t-space>
  `,
})
export class DemoCheckboxGroup {
  protected checked: CheckboxGroupValue = ['reading'];
}
