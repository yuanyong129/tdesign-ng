import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTableBasic } from './demos/table-basic';
import { DemoTableSize } from './demos/table-size';
import { DemoTableState } from './demos/table-state';
import { DemoTableStyle } from './demos/table-style';

@Component({
  selector: 'table-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTableBasic, DemoTableStyle, DemoTableSize, DemoTableState],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">表格 Table</h1>
      <p class="docs-page__lead">
        表格用于展示结构化数据。当前版本支持列配置、边框、斑马纹、悬停高亮、尺寸、对齐、省略、加载与空态；
        排序筛选、固定列、行选择、分页联动与虚拟滚动在后续版本逐步补齐。
      </p>

      <docs-demo id="table-basic" title="基础用法" description="columns 声明列，data 提供行数据。">
        <demo-table-basic />
      </docs-demo>

      <docs-demo id="table-style" title="边框与斑马纹" description="bordered / stripe / hover 的组合。">
        <demo-table-style />
      </docs-demo>

      <docs-demo id="table-size" title="尺寸与省略" description="size 三档，ellipsis 列超出省略。">
        <demo-table-size />
      </docs-demo>

      <docs-demo id="table-state" title="加载与空态" description="loading 显示遮罩，empty 自定义空态文案。">
        <demo-table-state />
      </docs-demo>

      <h2 class="docs-section__title" id="table-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTable" />
      </div>

      <docs-page-nav current="/table" />
    </div>
  `,
})
export class TableDocs {}
