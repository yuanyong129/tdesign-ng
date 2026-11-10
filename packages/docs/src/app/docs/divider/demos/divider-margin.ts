import { Component } from '@angular/core';
import { TDividerModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-divider-margin',
  imports: [TDividerModule],
  template: `
    <p>上下间距 32px。</p>
    <t-divider [size]="32" />
    <p>上下间距 8px。</p>
    <t-divider [size]="8" />
  `,
})
export class DemoDividerMargin {}
