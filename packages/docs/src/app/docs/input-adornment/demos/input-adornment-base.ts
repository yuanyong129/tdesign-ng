import { Component } from '@angular/core';
import { TInputAdornmentModule, TInputModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-adornment-base',
  imports: [TInputAdornmentModule, TInputModule, TSpaceModule],
  template: `
    <t-space direction="vertical" size="16px" style="display: block; max-width: 480px">
      <t-input-adornment prepend="http://">
        <t-input placeholder="请输入域名" />
      </t-input-adornment>
      <t-input-adornment append=".com">
        <t-input placeholder="请输入域名" />
      </t-input-adornment>
      <t-input-adornment prepend="￥" append="元">
        <t-input placeholder="请输入金额" />
      </t-input-adornment>
    </t-space>
  `,
})
export class DemoInputAdornmentBase {}
