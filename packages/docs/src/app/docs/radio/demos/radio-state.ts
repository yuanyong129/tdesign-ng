import { Component } from '@angular/core';
import { TRadioModule, TSpaceModule, type RadioValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-radio-state',
  imports: [TRadioModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-radio-group [disabled]="true" [(value)]="value">
        <t-radio value="1">整组禁用</t-radio>
        <t-radio value="2">未选中</t-radio>
      </t-radio-group>
      <t-radio-group [readonly]="true" [(value)]="value">
        <t-radio value="1">整组只读</t-radio>
        <t-radio value="2">未选中</t-radio>
      </t-radio-group>
      <t-radio-group [(value)]="value">
        <t-radio value="1">正常</t-radio>
        <t-radio value="2" [disabled]="true">单项禁用</t-radio>
      </t-radio-group>
      <p class="demo-hint">disabled 不响应点击，readonly 只读但保持样式，单项禁用只影响自身。</p>
    </t-space>
  `,
})
export class DemoRadioState {
  protected value: RadioValue = '1';
}
