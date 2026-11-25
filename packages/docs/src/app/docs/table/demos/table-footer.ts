import { Component } from '@angular/core';
import { TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-footer',
  imports: [TTableModule],
  template: `
    <t-table [data]="data" [columns]="columns" rowKey="id" [footData]="footData" footerSummary="本页共 4 条记录" />
    <p class="demo-hint">
      列的 foot 声明表尾单元格，footData 提供表尾行数据；footerSummary 渲染一条整行的表尾汇总，两者都放在 tfoot
      里，表格有高度时自动吸底。
    </p>
  `,
})
export class DemoTableFooter {
  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140, foot: '合计' },
    { colKey: 'amount', title: '金额', width: 140 },
    { colKey: 'count', title: '单数', width: 120 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', amount: '¥ 8,600', count: 2 },
    { id: 2, name: '李四', amount: '¥ 12,000', count: 3 },
    { id: 3, name: '王五', amount: '¥ 3,200', count: 1 },
    { id: 4, name: '赵六', amount: '¥ 6,800', count: 2 },
  ];

  protected readonly footData: TableRow[] = [{ id: 'sum', name: '合计', amount: '¥ 30,600', count: 8 }];
}
