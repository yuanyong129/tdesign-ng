import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoGridBasic } from './demos/grid-basic';
import { DemoGridGutter } from './demos/grid-gutter';
import { DemoGridOffset } from './demos/grid-offset';
import { DemoGridResponsive } from './demos/grid-responsive';

@Component({
  selector: 'grid-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoGridBasic, DemoGridGutter, DemoGridOffset, DemoGridResponsive],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">栅格 Grid</h1>
      <p class="docs-page__lead">
        栅格把页面按 12 等分划分，通过 t-row 与 t-col 组合出各种响应式布局。
      </p>

      <docs-demo
        id="grid-basic"
        title="基础栅格"
        description="col 的 span 表示占位格数，一行内所有列的 span 之和不超过 12 时同排显示。"
      >
        <demo-grid-basic />
      </docs-demo>

      <docs-demo
        id="grid-gutter"
        title="栅格间距"
        description="gutter 传数字表示水平间距，传数组时第二项是垂直间距，传对象可以按断点设置。"
      >
        <demo-grid-gutter />
      </docs-demo>

      <docs-demo
        id="grid-offset"
        title="偏移、排序与移动"
        description="offset 向右偏移，push / pull 让列左右移动，order 调整显示顺序。"
      >
        <demo-grid-offset />
      </docs-demo>

      <docs-demo
        id="grid-responsive"
        title="响应式栅格"
        description="xs / sm / md / lg / xl / xxl 分别对应不同断点，取值可以是格数，也可以是含 span、offset 的对象。"
      >
        <demo-grid-responsive />
      </docs-demo>

      <h2 class="docs-section__title" id="grid-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TRow" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TCol" />
      </div>

      <docs-page-nav current="/grid" />
    </article>
  `,
})
export class GridDocs {}
