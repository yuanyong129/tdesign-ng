import { Component, signal } from '@angular/core';
import { TCollapse, TCollapsePanel, type CollapseValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-collapse-basic',
  imports: [TCollapse, TCollapsePanel],
  template: `
    <t-collapse [defaultValue]="['1']" (change)="expanded.set($event)">
      <t-collapse-panel value="1" header="基础面板一">
        这是第一个面板的内容，默认展开；点击标题右侧箭头可以收起。
      </t-collapse-panel>
      <t-collapse-panel value="2" header="基础面板二">
        这是第二个面板的内容，默认收起。
      </t-collapse-panel>
      <t-collapse-panel value="3" header="基础面板三">
        这是第三个面板的内容，同时展开多个面板时按数组顺序排列。
      </t-collapse-panel>
    </t-collapse>
    <p class="demo-hint">当前展开：{{ expandedText() }}</p>
  `,
})
export class DemoCollapseBasic {
  protected readonly expanded = signal<CollapseValue>(['1']);

  protected expandedText(): string {
    const value = this.expanded();
    return value.length ? value.join('、') : '（全部收起）';
  }
}
