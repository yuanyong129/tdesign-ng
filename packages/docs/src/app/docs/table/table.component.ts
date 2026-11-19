import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTableBasic } from './demos/table-basic';
import { DemoTableCell } from './demos/table-cell';
import { DemoTableExpand } from './demos/table-expand';
import { DemoTableExpandClick } from './demos/table-expand-click';
import { DemoTableFilter } from './demos/table-filter';
import { DemoTableFixed } from './demos/table-fixed';
import { DemoTableGroupHeader } from './demos/table-group-header';
import { DemoTableMerge } from './demos/table-merge';
import { DemoTablePagination } from './demos/table-pagination';
import { DemoTableVirtual } from './demos/table-virtual';
import { DemoTableResizable } from './demos/table-resizable';
import { DemoTableSelect } from './demos/table-select';
import { DemoTableSelectClick } from './demos/table-select-click';
import { DemoTableSize } from './demos/table-size';
import { DemoTableSort } from './demos/table-sort';
import { DemoTableState } from './demos/table-state';
import { DemoTableStyle } from './demos/table-style';

@Component({
  selector: 'table-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoTableBasic,
    DemoTableStyle,
    DemoTableSize,
    DemoTableState,
    DemoTableSort,
    DemoTableCell,
    DemoTableSelect,
    DemoTableSelectClick,
    DemoTableExpand,
    DemoTableExpandClick,
    DemoTableFilter,
    DemoTableFixed,
    DemoTablePagination,
    DemoTableGroupHeader,
    DemoTableMerge,
    DemoTableVirtual,
    DemoTableResizable,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">表格 Table</h1>
      <p class="docs-page__lead">
        表格用于展示结构化数据。当前版本支持列配置、模板式单元格、排序、表头筛选、固定列、行选择、展开行、分页联动、多级表头、
        合并单元格、虚拟滚动、列宽拖拽、边框、斑马纹、悬停高亮、尺寸、对齐、省略、加载与空态。
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

      <docs-demo id="table-sort" title="排序" description="列上声明 sorter 即可排序，点击表头在升序/降序/取消之间切换。">
        <demo-table-sort />
      </docs-demo>

      <docs-demo id="table-cell" title="自定义单元格" description="用 ng-template + tTableCell 渲染标签、按钮等任意内容。">
        <demo-table-cell />
      </docs-demo>

      <docs-demo
        id="table-filter"
        title="表头筛选"
        description="列上声明 filter 即可筛选：single 单选、multiple 多选、input 输入；showConfirmAndReset 时点确定才提交。"
      >
        <demo-table-filter />
      </docs-demo>

      <docs-demo
        id="table-fixed"
        title="固定列"
        description="列上声明 fixed: 'left' | 'right' 即可固定，固定列需要同时声明宽度；横向滚动时两侧出现阴影分界线。"
      >
        <demo-table-fixed />
      </docs-demo>

      <docs-demo
        id="table-select"
        title="行选择"
        description="列上声明 type: 'multiple' 渲染多选列（'single' 为单选），配合 selectedRowKeys 使用；表头复选框支持全选与半选。"
      >
        <demo-table-select />
      </docs-demo>

      <docs-demo
        id="table-select-click"
        title="点击行选中"
        description="打开 selectOnRowClick 后点击整行即可选中，再点已选行取消选中。"
      >
        <demo-table-select-click />
      </docs-demo>

      <docs-demo
        id="table-expand"
        title="展开行"
        description="用 ng-template tTableExpandedRow 提供展开内容，展开状态由 expandedRowKeys 控制。"
      >
        <demo-table-expand />
      </docs-demo>

      <docs-demo
        id="table-expand-click"
        title="点击行展开"
        description="打开 expandOnRowClick 后点击整行即可展开 / 收起，行首图标仍然可用。"
      >
        <demo-table-expand-click />
      </docs-demo>

      <docs-demo
        id="table-pagination"
        title="分页联动"
        description="传入 pagination 后表格底部显示分页；数据超过一页时自动本地切页，disableDataPage 可改为服务端分页。"
      >
        <demo-table-pagination />
      </docs-demo>

      <docs-demo
        id="table-group-header"
        title="多级表头"
        description="列上声明 children 后成为分组列，表头按层级自动合并；排序、筛选写在最末级叶子列上。"
      >
        <demo-table-group-header />
      </docs-demo>

      <docs-demo
        id="table-merge"
        title="合并单元格"
        description="rowspanAndColspan 返回 { rowspan, colspan } 的单元格会与相邻单元格合并，被覆盖的格子自动跳过。"
      >
        <demo-table-merge />
      </docs-demo>

      <docs-demo
        id="table-virtual"
        title="虚拟滚动"
        description="scroll.type 为 virtual 且行数超过 threshold 时只渲染可视区域的行，适合上万行的大表格。"
      >
        <demo-table-virtual />
      </docs-demo>

      <docs-demo
        id="table-resizable"
        title="列宽拖拽"
        description="表格上声明 resizable 后，拖动表头右边缘即可调整列宽；列上可用 resizable 关闭、用 resize 限定最小/最大宽度。"
      >
        <demo-table-resizable />
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
