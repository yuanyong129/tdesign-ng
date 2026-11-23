import { Component } from '@angular/core';
import { TAnchorModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-anchor-offset',
  imports: [TAnchorModule],
  template: `
    <div style="display: flex; gap: 24px">
      <div style="flex: none">
        <!-- targetOffset 为 40：小节标题进到容器顶部 40px 以内才切换活性项，点击时也滚到该偏移处 -->
        <t-anchor container="#anchor-offset-box" [targetOffset]="40">
          <t-anchor-item href="#anchor-offset-1" title="第一项" />
          <t-anchor-item href="#anchor-offset-2" title="第二项" />
          <t-anchor-item href="#anchor-offset-3" title="第三项" />
        </t-anchor>
      </div>
      <div
        id="anchor-offset-box"
        style="flex: 1; height: 240px; overflow-y: auto; border: 1px solid var(--td-component-stroke); border-radius: 6px"
      >
        <div id="anchor-offset-1" style="height: 220px">
          <div style="position: sticky; top: 0; padding: 8px 12px; background: var(--td-bg-color-container-hover)">
            第一项
          </div>
          <div style="padding: 12px">第一项的内容</div>
        </div>
        <div id="anchor-offset-2" style="height: 220px">
          <div style="position: sticky; top: 0; padding: 8px 12px; background: var(--td-bg-color-container-hover)">
            第二项
          </div>
          <div style="padding: 12px">第二项的内容</div>
        </div>
        <div id="anchor-offset-3" style="height: 220px">
          <div style="position: sticky; top: 0; padding: 8px 12px; background: var(--td-bg-color-container-hover)">
            第三项
          </div>
          <div style="padding: 12px">第三项的内容</div>
        </div>
      </div>
    </div>
  `,
})
export class DemoAnchorOffset {}
