import { Component } from '@angular/core';
import { TAnchorModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-anchor-container',
  imports: [TAnchorModule],
  template: `
    <div
      id="anchor-container-box"
      style="height: 260px; overflow-y: auto; border: 1px solid var(--td-component-stroke); border-radius: 6px"
    >
      <div style="display: flex; gap: 24px; padding: 8px">
        <div style="flex: none">
          <!-- 滚动容器不是 window 时用 container 指定；affixProps 让锚点在容器内吸顶 -->
          <t-anchor
            container="#anchor-container-box"
            [affixProps]="{ container: '#anchor-container-box', offsetTop: 8 }"
          >
            <t-anchor-item href="#anchor-container-1" title="第一项" />
            <t-anchor-item href="#anchor-container-2" title="第二项" />
            <t-anchor-item href="#anchor-container-3" title="第三项" />
          </t-anchor>
        </div>
        <div style="flex: 1">
          <div id="anchor-container-1" style="height: 240px; padding: 12px">第一项的内容</div>
          <div id="anchor-container-2" style="height: 240px; padding: 12px">第二项的内容</div>
          <div id="anchor-container-3" style="height: 240px; padding: 12px">第三项的内容</div>
        </div>
      </div>
    </div>
  `,
})
export class DemoAnchorContainer {}
