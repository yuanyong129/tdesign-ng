import { Component, signal } from '@angular/core';
import { TTabPanel, TTabs, type TabValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tabs-basic',
  imports: [TTabs, TTabPanel],
  template: `
    <t-tabs [defaultValue]="'first'" (change)="handleChange($event)">
      <t-tab-panel value="first" label="选项卡一">
        <div class="demo-tabs-panel">选项卡一的内容</div>
      </t-tab-panel>
      <t-tab-panel value="second" label="选项卡二">
        <div class="demo-tabs-panel">选项卡二的内容</div>
      </t-tab-panel>
      <t-tab-panel value="third" label="选项卡三" [disabled]="true">
        <div class="demo-tabs-panel">选项卡三被禁用</div>
      </t-tab-panel>
    </t-tabs>
    <p class="demo-hint">当前选项卡：{{ current() }}；第三个选项卡通过 disabled 禁用。</p>
  `,
})
export class DemoTabsBasic {
  protected readonly current = signal<TabValue>('first');

  protected handleChange(value: TabValue): void {
    this.current.set(value);
  }
}
