import { Component } from '@angular/core';
import { TSpaceModule, TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-size',
  imports: [TTableModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-table [data]="data" [columns]="columns" rowKey="id" size="small" />
      <t-table [data]="data" [columns]="columns" rowKey="id" />
      <t-table [data]="data" [columns]="columns" rowKey="id" size="large" tableLayout="auto" />
    </t-space>
    <p class="demo-hint">size 有 small / medium / large，ellipsis 列超宽省略。</p>
  `,
})
export class DemoTableSize {
  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'role', title: '角色', width: 140 },
    { colKey: 'email', title: '邮箱', ellipsis: true },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', role: '前端工程师', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', role: '后端工程师', email: 'lisi@example.com' },
  ];
}
