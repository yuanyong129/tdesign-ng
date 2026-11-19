import { Component } from '@angular/core';
import { TTabPanel, TTabs } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tabs-lazy',
  imports: [TTabs, TTabPanel],
  template: `
    <t-tabs defaultValue="lazy">
      <t-tab-panel value="lazy" label="懒加载" [lazy]="true">
        <div class="demo-tabs-panel">该面板声明了 lazy：首次切换到它时才挂载内容。</div>
      </t-tab-panel>
      <t-tab-panel value="destroy" label="隐藏即销毁" [destroyOnHide]="true">
        <div class="demo-tabs-panel">该面板声明了 destroyOnHide：切走后内容被销毁，切回来会重新创建。</div>
      </t-tab-panel>
      <t-tab-panel value="keep" label="默认保留">
        <div class="demo-tabs-panel">普通面板只切换显示状态，内容一直保留在 DOM 中。</div>
      </t-tab-panel>
    </t-tabs>
    <p class="demo-hint">打开开发者工具观察渲染内容的变化，或在「隐藏即销毁」面板里放带状态的组件验证。</p>
  `,
})
export class DemoTabsLazy {}
