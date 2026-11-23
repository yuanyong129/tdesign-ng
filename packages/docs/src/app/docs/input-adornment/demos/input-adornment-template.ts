import { Component } from '@angular/core';
import {
  TButtonModule,
  TInputAdornmentModule,
  TInputModule,
  TSelectModule,
  TSpaceModule,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-adornment-template',
  imports: [TButtonModule, TInputAdornmentModule, TInputModule, TSelectModule, TSpaceModule],
  template: `
    <t-space direction="vertical" size="16px" style="display: block; max-width: 480px">
      <t-input-adornment [append]="suffixButton">
        <t-input placeholder="请输入关键词" />
      </t-input-adornment>
      <t-input-adornment [prepend]="prefixSelect">
        <t-input placeholder="请输入网址" />
      </t-input-adornment>
    </t-space>

    <ng-template #suffixButton>
      <t-button theme="primary">搜索</t-button>
    </ng-template>

    <ng-template #prefixSelect>
      <t-select [options]="protocols" [value]="'https'" style="width: 120px" />
    </ng-template>
  `,
})
export class DemoInputAdornmentTemplate {
  protected readonly protocols = [
    { label: 'https://', value: 'https' },
    { label: 'http://', value: 'http' },
  ];
}
