import { Component } from '@angular/core';
import { TButtonModule, TPopconfirmModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popconfirm-theme',
  imports: [TPopconfirmModule, TButtonModule],
  styles: [
    `
      .demo-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `,
  ],
  template: `
    <div class="demo-row">
      <t-popconfirm theme="default" content="默认主题的气泡确认框。">
        <span><t-button variant="outline">默认</t-button></span>
      </t-popconfirm>
      <t-popconfirm theme="warning" content="警告主题的气泡确认框。">
        <span><t-button variant="outline">警告</t-button></span>
      </t-popconfirm>
      <t-popconfirm theme="danger" content="危险主题的气泡确认框。">
        <span><t-button variant="outline">危险</t-button></span>
      </t-popconfirm>
    </div>
  `,
})
export class DemoPopconfirmTheme {}
