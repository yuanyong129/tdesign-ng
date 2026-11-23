import { Component } from '@angular/core';
import { TAnchorModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-anchor-base',
  imports: [TAnchorModule],
  template: `
    <div style="display: flex; gap: 24px">
      <div style="flex: none">
        <t-anchor container="#anchor-base-box">
          <t-anchor-item href="#anchor-base-1" title="第一项" />
          <t-anchor-item href="#anchor-base-2" title="第二项" />
          <t-anchor-item href="#anchor-base-3" title="第三项" />
        </t-anchor>
      </div>
      <div
        id="anchor-base-box"
        style="flex: 1; height: 240px; overflow-y: auto; border: 1px solid var(--td-component-stroke); border-radius: 6px"
      >
        <div id="anchor-base-1" style="height: 200px; padding: 12px">第一项的内容</div>
        <div id="anchor-base-2" style="height: 200px; padding: 12px">第二项的内容</div>
        <div id="anchor-base-3" style="height: 200px; padding: 12px">第三项的内容</div>
      </div>
    </div>
  `,
})
export class DemoAnchorBase {}
