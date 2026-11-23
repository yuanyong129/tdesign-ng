import { Component } from '@angular/core';
import { TLayoutModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-layout-nested',
  imports: [TLayoutModule],
  template: `
    <t-layout direction="horizontal" style="height: 240px;">
      <t-aside width="96px" style="padding: 16px;">Aside</t-aside>
      <t-layout>
        <t-header style="padding: 0 16px; line-height: 48px; height: 48px;">Header</t-header>
        <t-content style="padding: 24px;">Content</t-content>
        <t-footer style="padding: 16px 24px;">Footer</t-footer>
      </t-layout>
    </t-layout>
  `,
})
export class DemoLayoutNested {}
