import { Component } from '@angular/core';
import { TTabPanel, TTabs } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tabs-card',
  imports: [TTabs, TTabPanel],
  template: `
    <t-tabs theme="card" defaultValue="overview">
      <t-tab-panel value="overview" label="概览">
        <div class="demo-tabs-panel">卡片式选项卡，标题栏带背景与分隔线。</div>
      </t-tab-panel>
      <t-tab-panel value="detail" label="详情">
        <div class="demo-tabs-panel">切换选项卡时只有面板内容变化。</div>
      </t-tab-panel>
      <t-tab-panel value="setting" label="设置">
        <div class="demo-tabs-panel">theme 支持 normal（默认）与 card。</div>
      </t-tab-panel>
    </t-tabs>
    <p class="demo-hint">theme="card" 时导航项之间用边框分隔，不再显示下方指示条。</p>
  `,
})
export class DemoTabsCard {}
