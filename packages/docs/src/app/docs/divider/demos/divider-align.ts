import { Component } from '@angular/core';
import { TDividerModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-divider-align',
  imports: [TDividerModule],
  template: `
    <t-divider align="left">左侧文字</t-divider>
    <t-divider align="center">居中文字</t-divider>
    <t-divider align="right">右侧文字</t-divider>
  `,
})
export class DemoDividerAlign {}
