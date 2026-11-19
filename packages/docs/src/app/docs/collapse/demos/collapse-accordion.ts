import { Component, signal } from '@angular/core';
import { TCollapse, TCollapsePanel, type CollapseValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-collapse-accordion',
  imports: [TCollapse, TCollapsePanel],
  template: `
    <t-collapse [expandMutex]="true" [defaultValue]="['1']" (change)="expanded.set($event)">
      <t-collapse-panel value="1" header="手风琴面板一">
        打开其它面板时，这个面板会自动收起（expandMutex）。
      </t-collapse-panel>
      <t-collapse-panel value="2" header="手风琴面板二">
        同一时间只会有一个面板处于展开状态。
      </t-collapse-panel>
      <t-collapse-panel value="3" header="手风琴面板三">
        再次点击当前展开的面板可以把它收起，此时没有面板展开。
      </t-collapse-panel>
    </t-collapse>
    <p class="demo-hint">当前展开：{{ expanded().join('、') || '（全部收起）' }}</p>
  `,
})
export class DemoCollapseAccordion {
  protected readonly expanded = signal<CollapseValue>(['1']);
}
