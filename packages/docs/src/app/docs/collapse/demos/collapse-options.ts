import { Component } from '@angular/core';
import { TCollapse, TCollapsePanel } from '@tdesign-ng/components';

@Component({
  selector: 'demo-collapse-options',
  imports: [TCollapse, TCollapsePanel],
  template: `
    <t-collapse
      [borderless]="true"
      [expandOnRowClick]="true"
      expandIconPlacement="right"
      [defaultValue]="['1']"
    >
      <t-collapse-panel value="1" header="点击整行展开" headerRightContent="右侧内容">
        打开 expandOnRowClick 后点击整行都能切换；headerRightContent 渲染在标题右侧，点击它不会触发展开。
      </t-collapse-panel>
      <t-collapse-panel value="2" header="图标在右侧">
        expandIconPlacement 为 right 时箭头放到标题右边。
      </t-collapse-panel>
      <t-collapse-panel value="3" header="禁用面板" [disabled]="true">
        禁用的面板无法展开，标题颜色会变成禁用态。
      </t-collapse-panel>
      <t-collapse-panel value="4" header="收起后销毁内容" [destroyOnCollapse]="true">
        打开 destroyOnCollapse 后，收起时内容会从 DOM 中移除。
      </t-collapse-panel>
    </t-collapse>
    <p class="demo-hint">borderless 关掉外边框，expandOnRowClick 让整行可点击。</p>
  `,
})
export class DemoCollapseOptions {}
