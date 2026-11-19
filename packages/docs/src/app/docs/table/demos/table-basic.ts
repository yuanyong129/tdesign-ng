import { Component } from '@angular/core';
import { TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-basic',
  imports: [TTableModule],
  template: `
    <t-table [data]="data" [columns]="columns" rowKey="id" />
    <p class="demo-hint">columns 声明列，data 提供行数据，rowKey 用于行标识。</p>
  `,
})
export class DemoTableBasic {
  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 160 },
    { colKey: 'role', title: '角色' },
    { colKey: 'email', title: '邮箱', width: 220 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', role: '前端工程师', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', role: '后端工程师', email: 'lisi@example.com' },
    { id: 3, name: '王五', role: '设计师', email: 'wangwu@example.com' },
  ];
}
