import { Component } from '@angular/core';
import { TRadioModule, TSpaceModule, type RadioSize, type RadioValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-radio-button',
  imports: [TRadioModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      @for (size of sizes; track size) {
        <t-radio-group theme="button" variant="outline" [size]="size" [(value)]="value">
          <t-radio value="1">选项一</t-radio>
          <t-radio value="2">选项二</t-radio>
          <t-radio value="3">选项三</t-radio>
        </t-radio-group>
      }
      <p class="demo-hint">theme="button" 配合 variant="outline" 是描边按钮样式。</p>
    </t-space>
  `,
})
export class DemoRadioButton {
  protected value: RadioValue = '1';
  protected readonly sizes: RadioSize[] = ['small', 'medium', 'large'];
}
