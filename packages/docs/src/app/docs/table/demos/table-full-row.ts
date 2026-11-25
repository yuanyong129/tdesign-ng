import { Component } from '@angular/core';
import { TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-full-row',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      firstFullRow="本周新增 4 条记录，金额为含税价"
      lastFullRow="数据每 10 分钟刷新一次"
      cellEmptyContent="—"
    />
    <p class="demo-hint">
      firstFullRow / lastFullRow 在表体首尾各插入一条通栏内容，cellEmptyContent 给空单元格补占位文案（「备注」列留空的行）。
    </p>
  `,
})
export class DemoTableFullRow {
  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'amount', title: '金额', width: 140 },
    { colKey: 'remark', title: '备注', width: 200 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', amount: '¥ 8,600', remark: '已开票' },
    { id: 2, name: '李四', amount: '¥ 12,000', remark: '' },
    { id: 3, name: '王五', amount: '¥ 3,200', remark: null },
    { id: 4, name: '赵六', amount: '¥ 6,800', remark: '待确认' },
  ];
}
