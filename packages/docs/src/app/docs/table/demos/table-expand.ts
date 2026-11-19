import { Component, signal } from '@angular/core';
import {
  TTableModule,
  type TableColumn,
  type TableExpandChangeEvent,
  type TableRow,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-expand',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      [expandedRowKeys]="expandedRowKeys()"
      (expandChange)="handleExpandChange($event)"
    >
      <ng-template tTableExpandedRow let-row>
        <div class="demo-expanded">
          <p><strong>{{ row.name }}</strong> 的详细信息</p>
          <p>邮箱：{{ row.email }}　部门：{{ row.department }}　入职：{{ row.joined }}</p>
        </div>
      </ng-template>
    </t-table>
    <p class="demo-hint">
      点击行首图标展开 / 收起该行，展开内容由 ng-template tTableExpandedRow 提供；也可以用 expandOnRowClick 改成点击整行展开。
    </p>
  `,
})
export class DemoTableExpand {
  protected readonly expandedRowKeys = signal<Array<string | number>>([1]);

  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'role', title: '角色', width: 160 },
    { colKey: 'department', title: '部门', width: 160 },
  ];

  protected readonly data: TableRow[] = [
    {
      id: 1,
      name: '张三',
      role: '前端工程师',
      department: '基础架构',
      email: 'zhangsan@example.com',
      joined: '2020-07-15',
    },
    {
      id: 2,
      name: '李四',
      role: '后端工程师',
      department: '交易平台',
      email: 'lisi@example.com',
      joined: '2021-03-02',
    },
    {
      id: 3,
      name: '王五',
      role: '设计师',
      department: '设计中心',
      email: 'wangwu@example.com',
      joined: '2019-05-20',
    },
    {
      id: 4,
      name: '赵六',
      role: '产品经理',
      department: '增长产品',
      email: 'zhaoliu@example.com',
      joined: '2022-11-08',
    },
  ];

  protected handleExpandChange(event: TableExpandChangeEvent): void {
    this.expandedRowKeys.set(event.expandedRowKeys);
  }
}
