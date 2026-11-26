import { Component } from '@angular/core';
import { TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-affix',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      [bordered]="true"
      [height]="400"
      [headerAffixedTop]="{ offsetTop: 16 }"
      [footerAffixedBottom]="true"
      [horizontalScrollAffixedBottom]="true"
      [footData]="footData"
    />
    <p class="demo-hint">
      headerAffixedTop 让表头在页面滚动到表格顶部后吸顶，footerAffixedBottom 让表尾吸底，horizontalScrollAffixedBottom
      在横向溢出时提供吸底的替身滚动条；三者的 AffixProps 都可以写成对象来透传 offsetTop / offsetBottom / zIndex。
    </p>

    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      [pagination]="{ current: 1, pageSize: 10, total: 200, showJumper: true }"
      [paginationAffixedBottom]="true"
    />
    <p class="demo-hint">
      paginationAffixedBottom 把分页器固定在视口底部：页面滚动到分页器上方时吸底，回到原位后自动解除。
    </p>
  `,
})
export class DemoTableAffix {
  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 220 },
    { colKey: 'department', title: '部门', width: 220 },
    { colKey: 'amount', title: '金额', width: 220 },
    { colKey: 'count', title: '单数', width: 220 },
    { colKey: 'status', title: '状态', width: 220 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', department: '研发部', amount: '¥ 8,600', count: 2, status: '已完成' },
    { id: 2, name: '李四', department: '市场部', amount: '¥ 12,000', count: 3, status: '进行中' },
    { id: 3, name: '王五', department: '财务部', amount: '¥ 3,200', count: 1, status: '已完成' },
    { id: 4, name: '赵六', department: '设计部', amount: '¥ 6,800', count: 2, status: '已驳回' },
    { id: 5, name: '孙七', department: '研发部', amount: '¥ 9,100', count: 4, status: '已完成' },
    { id: 6, name: '周八', department: '运营部', amount: '¥ 4,400', count: 1, status: '进行中' },
    { id: 7, name: '吴九', department: '研发部', amount: '¥ 7,300', count: 2, status: '已完成' },
    { id: 8, name: '郑十', department: '市场部', amount: '¥ 5,900', count: 3, status: '进行中' },
    { id: 9, name: '钱一', department: '设计部', amount: '¥ 8,100', count: 1, status: '已完成' },
    { id: 10, name: '冯二', department: '财务部', amount: '¥ 6,200', count: 2, status: '已驳回' },
  ];

  protected readonly footData: TableRow[] = [
    { id: 'sum', name: '合计', department: '—', amount: '¥ 44,100', count: 13, status: '—' },
  ];
}
