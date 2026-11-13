import { Component } from '@angular/core';
import { TRadioModule, TSpaceModule, type RadioVariant, type RadioValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-radio-filled',
  imports: [TRadioModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      @for (variant of variants; track variant) {
        <t-radio-group theme="button" [variant]="variant" [(value)]="values[variant]">
          <t-radio value="1">选项一</t-radio>
          <t-radio value="2">选项二</t-radio>
          <t-radio value="3">选项三</t-radio>
        </t-radio-group>
      }
      <p class="demo-hint">default-filled 与 primary-filled 会自动用色块跟随选中项。</p>
    </t-space>
  `,
})
export class DemoRadioFilled {
  protected readonly variants: RadioVariant[] = ['default-filled', 'primary-filled'];
  protected readonly values: Record<string, RadioValue> = {
    'default-filled': '1',
    'primary-filled': '2',
  };
}
