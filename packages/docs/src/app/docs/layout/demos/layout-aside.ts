import { Component } from '@angular/core';
import { TLayoutModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-layout-aside',
  imports: [TLayoutModule],
  template: `
    <t-layout style="height: 200px;">
      <t-aside width="120px" style="padding: 16px;">Aside</t-aside>
      <t-layout>
        <t-header style="padding: 0 16px; line-height: 48px; height: 48px;">Header</t-header>
        <t-content style="padding: 24px;">Content</t-content>
      </t-layout>
    </t-layout>
  `,
})
export class DemoLayoutAside {}
