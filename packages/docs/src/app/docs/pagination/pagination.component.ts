import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoPaginationBasic } from './demos/pagination-basic';
import { DemoPaginationFolded } from './demos/pagination-folded';
import { DemoPaginationJumper } from './demos/pagination-jumper';
import { DemoPaginationSimple } from './demos/pagination-simple';
import { DemoPaginationSize } from './demos/pagination-size';

@Component({
  selector: 'pagination-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoPaginationBasic,
    DemoPaginationSize,
    DemoPaginationJumper,
    DemoPaginationFolded,
    DemoPaginationSimple,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">分页 Pagination</h1>
      <p class="docs-page__lead">
        分页用于长列表的翻页，支持每页条数切换、跳转、折叠省略号与简洁模式。
      </p>

      <docs-demo id="pagination-basic" title="基础用法" description="[(current)] 与 [(pageSize)] 双向绑定，total 决定页数。">
        <demo-pagination-basic />
      </docs-demo>

      <docs-demo id="pagination-size" title="每页条数与尺寸" description="pageSizeOptions 自定义每页条数，size 支持 small。">
        <demo-pagination-size />
      </docs-demo>

      <docs-demo id="pagination-jumper" title="跳转与统计" description="showJumper 显示跳转框，totalContent 可自定义文案。">
        <demo-pagination-jumper />
      </docs-demo>

      <docs-demo id="pagination-folded" title="折叠页码" description="页数超过 maxPageBtn 时折叠，省略号点击前后跳 5 页。">
        <demo-pagination-folded />
      </docs-demo>

      <docs-demo id="pagination-simple" title="简洁模式" description="theme=&quot;simple&quot; 只显示当前页/总页数。">
        <demo-pagination-simple />
      </docs-demo>

      <h2 class="docs-section__title" id="pagination-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TPagination" />
      </div>

      <docs-page-nav current="/pagination" />
    </div>
  `,
})
export class PaginationDocs {}
