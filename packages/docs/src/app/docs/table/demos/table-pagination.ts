import { Component, computed, signal } from '@angular/core';
import {
  TTableModule,
  type TableColumn,
  type TablePageChangeEvent,
  type TablePagination,
  type TableRow,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-pagination',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      [pagination]="pagination()"
      (pageChange)="handlePageChange($event)"
    />
    <p class="demo-hint">
      当前第 {{ currentPage() }} 页，每页 {{ pageSize }} 条，共 {{ data.length }} 条；翻页由表格本地切好数据，需要服务端分页时打开 disableDataPage。
    </p>
  `,
})
export class DemoTablePagination {
  protected readonly pageSize = 5;

  protected readonly currentPage = signal(1);

  protected readonly pagination = computed<TablePagination>(() => ({
    current: this.currentPage(),
    pageSize: this.pageSize,
    pageSizeOptions: [5, 10, 20],
    showJumper: true,
  }));

  protected readonly columns: TableColumn[] = [
    { colKey: 'id', title: '编号', width: 100 },
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'role', title: '角色', width: 160 },
    { colKey: 'city', title: '城市', width: 120 },
  ];

  protected readonly data: TableRow[] = Array.from({ length: 23 }, (_, index) => ({
    id: index + 1,
    name: `成员 ${index + 1}`,
    role: ['前端工程师', '后端工程师', '设计师', '产品经理'][index % 4],
    city: ['深圳', '杭州', '上海', '北京'][index % 4],
  }));

  protected handlePageChange(event: TablePageChangeEvent): void {
    this.currentPage.set(event.pageInfo.current);
  }
}
