import { Component } from '@angular/core';
import { TTabPanel, TTabs } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tabs-placement',
  imports: [TTabs, TTabPanel],
  template: `
    <t-tabs placement="left" size="large" defaultValue="profile">
      <t-tab-panel value="profile" label="个人资料">
        <div class="demo-tabs-panel demo-tabs-panel--vertical">placement 支持 top / bottom / left / right，这里是左侧竖排。</div>
      </t-tab-panel>
      <t-tab-panel value="security" label="安全设置">
        <div class="demo-tabs-panel demo-tabs-panel--vertical">size="large" 让选项卡标题更大一些。</div>
      </t-tab-panel>
      <t-tab-panel value="notice" label="消息通知">
        <div class="demo-tabs-panel demo-tabs-panel--vertical">竖排时指示条显示在右侧。</div>
      </t-tab-panel>
    </t-tabs>
  `,
})
export class DemoTabsPlacement {}
