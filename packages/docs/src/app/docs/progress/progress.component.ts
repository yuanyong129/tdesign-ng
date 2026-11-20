import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoProgressBasic } from './demos/progress-basic';
import { DemoProgressCircle } from './demos/progress-circle';
import { DemoProgressColor } from './demos/progress-color';
import { DemoProgressPlump } from './demos/progress-plump';
import { DemoProgressStatus } from './demos/progress-status';

@Component({
  selector: 'progress-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoProgressBasic,
    DemoProgressStatus,
    DemoProgressPlump,
    DemoProgressCircle,
    DemoProgressColor,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">进度条 Progress</h1>
      <p class="docs-page__lead">
        进度条用于展示操作的当前进度，支持 line / plump / circle 三种主题、状态图标、渐变颜色与自定义尺寸。
      </p>

      <docs-demo id="progress-basic" title="基础用法" description="默认 line 主题，右侧显示百分比。">
        <demo-progress-basic />
      </docs-demo>

      <docs-demo id="progress-status" title="状态" description="status 切换成功、警告、错误与进行中状态。">
        <demo-progress-status />
      </docs-demo>

      <docs-demo id="progress-plump" title="条状主题" description="plump 的百分比内嵌在进度条内，size 支持 small。">
        <demo-progress-plump />
      </docs-demo>

      <docs-demo id="progress-circle" title="环形" description="circle 主题支持 small / medium / large 与自定义像素尺寸。">
        <demo-progress-circle />
      </docs-demo>

      <docs-demo id="progress-color" title="颜色" description="color / trackColor 支持单色、渐变与分段颜色。">
        <demo-progress-color />
      </docs-demo>

      <h2 class="docs-section__title" id="progress-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TProgress" />
      </div>

      <docs-page-nav current="/progress" />
    </div>
  `,
})
export class ProgressDocs {}
