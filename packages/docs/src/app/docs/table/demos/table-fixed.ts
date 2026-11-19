import { Component } from '@angular/core';
import { TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-fixed',
  imports: [TTableModule],
  template: `
    <t-table [data]="data" [columns]="columns" rowKey="id" />
    <p class="demo-hint">
      横向滚动查看中间列：左侧「姓名」与右侧「操作」固定在两边，滚动到中间时两侧出现阴影分界线。
    </p>
  `,
})
export class DemoTableFixed {
  protected readonly columns: TableColumn[] = [
    { colKey: 'id', title: '编号', width: 90, fixed: 'left' },
    { colKey: 'name', title: '姓名', width: 120, fixed: 'left' },
    { colKey: 'role', title: '角色', width: 140 },
    { colKey: 'department', title: '部门', width: 160 },
    { colKey: 'email', title: '邮箱', width: 220 },
    { colKey: 'phone', title: '手机号', width: 160 },
    { colKey: 'city', title: '城市', width: 120 },
    { colKey: 'joined', title: '入职日期', width: 140 },
    { colKey: 'operation', title: '操作', width: 150, fixed: 'right', cell: () => '编辑 / 删除' },
  ];

  protected readonly data: TableRow[] = [
    {
      id: 1,
      name: '张三',
      role: '前端工程师',
      department: '基础架构',
      email: 'zhangsan@example.com',
      phone: '13800000001',
      city: '深圳',
      joined: '2020-07-15',
    },
    {
      id: 2,
      name: '李四',
      role: '后端工程师',
      department: '交易平台',
      email: 'lisi@example.com',
      phone: '13800000002',
      city: '杭州',
      joined: '2021-03-02',
    },
    {
      id: 3,
      name: '王五',
      role: '设计师',
      department: '设计中心',
      email: 'wangwu@example.com',
      phone: '13800000003',
      city: '上海',
      joined: '2019-05-20',
    },
    {
      id: 4,
      name: '赵六',
      role: '产品经理',
      department: '增长产品',
      email: 'zhaoliu@example.com',
      phone: '13800000004',
      city: '北京',
      joined: '2022-11-08',
    },
    {
      id: 5,
      name: '孙七',
      role: '后端工程师',
      department: '支付',
      email: 'sunqi@example.com',
      phone: '13800000005',
      city: '广州',
      joined: '2020-01-06',
    },
    {
      id: 6,
      name: '周八',
      role: '测试工程师',
      department: '质量保障',
      email: 'zhouba@example.com',
      phone: '13800000006',
      city: '成都',
      joined: '2023-04-11',
    },
  ];
}
