import { Component } from '@angular/core';
import {
  TTableModule,
  type TableColumn,
  type TableRow,
  type TableRowAttributesValue,
  type TableRowClassNameParams,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-custom-row',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      topContent="金额超过 ¥10,000 的行标红，悬停查看备注"
      bottomContent="rowClassName / rowAttributes 都可以传回调，按行数据决定类名与属性"
      [rowClassName]="rowClassName"
      [rowAttributes]="rowAttributes"
    />
    <p class="demo-hint">
      rowClassName 支持字符串、回调、按行下标或行 key 取值的映射以及它们的数组；rowAttributes 支持对象、回调与数组，class 与
      style 会合并。
    </p>
  `,
})
export class DemoTableCustomRow {
  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'amount', title: '金额', width: 140 },
    { colKey: 'remark', title: '备注', width: 220 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', amount: 8600, remark: '常规客户' },
    { id: 2, name: '李四', amount: 12800, remark: '大额订单，需要复核' },
    { id: 3, name: '王五', amount: 3200, remark: '新客户' },
    { id: 4, name: '赵六', amount: 15600, remark: '大额订单，已复核' },
  ];

  protected readonly rowClassName = (params: TableRowClassNameParams): string =>
    params.row['amount'] > 10000 ? 't-table__row--hover' : '';

  protected readonly rowAttributes = (params: { row: TableRow }): TableRowAttributesValue => {
    const large = params.row['amount'] > 10000;
    return {
      title: `${params.row['remark'] ?? ''}`,
      style: large ? { color: 'var(--td-error-color)' } : {},
      'data-large': large ? 'true' : 'false',
    };
  };
}
