import { Component } from '@angular/core';
import {
  TButtonModule,
  TSpaceModule,
  TTableModule,
  TTagModule,
  type TableColumn,
  type TableRow,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-cell',
  imports: [TTableModule, TTagModule, TButtonModule, TSpaceModule],
  template: `
    <t-table [data]="data" [columns]="columns" rowKey="id">
      <ng-template tTableCell="status" let-value="value">
        <t-tag [theme]="value === '在职' ? 'success' : 'default'" variant="light">{{ value }}</t-tag>
      </ng-template>
      <ng-template tTableCell="actions" let-row>
        <t-space [size]="8">
          <t-button variant="text" size="small" (click)="handleEdit(row)">编辑</t-button>
          <t-button variant="text" size="small" theme="danger">删除</t-button>
        </t-space>
      </ng-template>
    </t-table>
    <p class="demo-hint">{{ hint }}</p>
  `,
})
export class DemoTableCell {
  protected hint =
    '单元格可以用 <ng-template tTableCell="colKey"> 渲染任意内容：$implicit 是整行，value 是当前列的值，另有 row / rowIndex / col / colIndex。';

  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'status', title: '状态', width: 120 },
    { colKey: 'actions', title: '操作', width: 160 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', status: '在职' },
    { id: 2, name: '李四', status: '离职' },
  ];

  protected handleEdit(row: TableRow): void {
    this.hint = `点击了「${row?.['name']}」的编辑操作。`;
  }
}
