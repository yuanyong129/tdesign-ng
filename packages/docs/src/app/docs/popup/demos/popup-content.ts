import { Component } from '@angular/core';
import { TButtonModule, TPopupModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popup-content',
  imports: [TPopupModule, TButtonModule, TSpaceModule],
  template: `
    <t-popup placement="bottom" [trigger]="'click'">
      <t-button variant="outline">富内容弹层</t-button>
      <div tPopupContent class="demo-popup-panel">
        <strong>自定义内容</strong>
        <p>用 <code>[tPopupContent]</code> 投影任意模板，不再局限于纯文本。</p>
        <t-button size="small" theme="primary">知道了</t-button>
      </div>
    </t-popup>
  `,
  styles: `
    .demo-popup-panel {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 220px;
    }
  `,
})
export class DemoPopupContent {}
