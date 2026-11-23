import { Component } from '@angular/core';
import { TLayoutModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-layout-basic',
  imports: [TLayoutModule],
  template: `
    <t-layout>
      <t-header style="padding: 0 16px; line-height: 48px; height: 48px;">Header</t-header>
      <t-content style="padding: 24px;">Content</t-content>
      <t-footer style="padding: 16px 24px;">Footer</t-footer>
    </t-layout>
  `,
})
export class DemoLayoutBasic {}
