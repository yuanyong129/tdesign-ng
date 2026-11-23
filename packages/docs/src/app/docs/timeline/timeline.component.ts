import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTimelineBase } from './demos/timeline-base';
import { DemoTimelineHorizontal } from './demos/timeline-horizontal';
import { DemoTimelineMode } from './demos/timeline-mode';

@Component({
  selector: 'timeline-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTimelineBase, DemoTimelineMode, DemoTimelineHorizontal],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">时间轴 Timeline</h1>
      <p class="docs-page__lead">
        时间轴按时间顺序展示一系列事件，支持纵向与横向排布、标签左右交替或与内容同侧、虚线主题与反转顺序。
      </p>

      <docs-demo id="timeline-base" title="基础用法" description="t-timeline 默认纵向排列，label 显示在左侧，content 为事件内容，dotColor 可指定圆点颜色。">
        <demo-timeline-base />
      </docs-demo>

      <docs-demo id="timeline-mode" title="同侧标签与虚线主题" description="mode 为 same 时标签显示在内容下方，theme 为 dot 时连接线为虚线，子项 loading 显示加载中的圆点。">
        <demo-timeline-mode />
      </docs-demo>

      <docs-demo id="timeline-horizontal" title="横向时间轴与反转" description="layout 为 horizontal 时横向排列，labelAlign 取 top / bottom；reverse 会反转子项顺序。">
        <demo-timeline-horizontal />
      </docs-demo>

      <h2 class="docs-section__title" id="timeline-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTimeline" />
        <api-table component="TTimelineItem" />
      </div>

      <docs-page-nav current="/timeline" />
    </article>
  `,
})
export class TimelineDocs {}
