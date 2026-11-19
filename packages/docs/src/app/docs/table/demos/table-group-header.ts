import { Component } from '@angular/core';
import { TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-group-header',
  imports: [TTableModule],
  template: `
    <t-table [data]="data" [columns]="columns" rowKey="id" bordered />
    <p class="demo-hint">
      列上声明 children 后该列成为分组列，表头按层级自动合并；分组列只显示标题，排序、筛选写在最末级叶子列上。
    </p>
  `,
})
export class DemoTableGroupHeader {
  protected readonly columns: TableColumn[] = [
    {
      colKey: 'basic',
      title: '基本信息',
      children: [
        { colKey: 'name', title: '姓名', width: 120 },
        { colKey: 'role', title: '角色', width: 140 },
        { colKey: 'department', title: '部门', width: 160 },
      ],
    },
    {
      colKey: 'contact',
      title: '联系方式',
      children: [
        { colKey: 'email', title: '邮箱', width: 220, ellipsis: true },
        { colKey: 'phone', title: '手机号', width: 160 },
      ],
    },
  ];

  protected readonly data: TableRow[] = [
    {
      id: 1,
      name: '张三',
      role: '前端工程师',
      department: '基础架构',
      email: 'zhangsan@example.com',
      phone: '13800000001',
    },
    {
      id: 2,
      name: '李四',
      role: '后端工程师',
      department: '交易平台',
      email: 'lisi@example.com',
      phone: '13800000002',
    },
    {
      id: 3,
      name: '王五',
      role: '设计师',
      department: '设计中心',
      email: 'wangwu@example.com',
      phone: '13800000003',
    },
    {
      id: 4,
      name: '赵六',
      role: '产品经理',
      department: '增长产品',
      email: 'zhaoliu@example.com',
      phone: '13800000004',
    },
  ];
}
