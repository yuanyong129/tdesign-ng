import { Component, computed, signal } from '@angular/core';
import {
  TTableModule,
  type TableColumn,
  type TableFilterChangeEvent,
  type TableFilterValue,
  type TableRow,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-filter',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data()"
      [columns]="columns"
      rowKey="id"
      [filterValue]="filterValue()"
      (filterChange)="handleFilterChange($event)"
    />
    <p class="demo-hint">{{ hint() }}</p>
  `,
})
export class DemoTableFilter {
  protected readonly filterValue = signal<TableFilterValue>({});

  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140, sorter: true },
    {
      colKey: 'role',
      title: '角色',
      width: 200,
      filter: {
        type: 'single',
        showConfirmAndReset: true,
        list: [
          { label: '前端工程师', value: '前端工程师' },
          { label: '后端工程师', value: '后端工程师' },
          { label: '设计师', value: '设计师' },
        ],
      },
    },
    {
      colKey: 'status',
      title: '状态',
      width: 180,
      filter: {
        type: 'multiple',
        list: [
          { label: '在职', value: '在职' },
          { label: '离职', value: '离职' },
        ],
      },
    },
    {
      colKey: 'email',
      title: '邮箱',
      filter: { type: 'input' },
    },
  ];

  private readonly allRows: TableRow[] = [
    { id: 1, name: '李四', role: '后端工程师', status: '在职', email: 'lisi@example.com' },
    { id: 2, name: '张三', role: '前端工程师', status: '在职', email: 'zhangsan@example.com' },
    { id: 3, name: '赵六', role: '设计师', status: '离职', email: 'zhaoliu@example.com' },
    { id: 4, name: '王五', role: '前端工程师', status: '在职', email: 'wangwu@example.com' },
    { id: 5, name: '孙七', role: '后端工程师', status: '离职', email: 'sunqi@example.com' },
  ];

  protected readonly data = computed(() => this.allRows.filter((row) => this.matches(row)));

  protected readonly hint = computed(() => {
    const active = Object.values(this.filterValue()).filter(
      (value) => value !== '' && value !== undefined && (!Array.isArray(value) || value.length > 0),
    );
    return active.length
      ? `已按 ${active.length} 个条件过滤，表格本身不改数据，过滤在 filterChange 里完成。`
      : '角色点「确定」生效，状态点选、邮箱输入立即生效。';
  });

  protected handleFilterChange(event: TableFilterChangeEvent): void {
    this.filterValue.set(event.filterValue);
  }

  private matches(row: TableRow): boolean {
    const filterValue = this.filterValue();

    const role = filterValue['role'];
    if (typeof role === 'string' && role && row['role'] !== role) return false;

    const status = filterValue['status'];
    if (Array.isArray(status) && status.length && !status.includes(row['status'])) return false;

    const email = filterValue['email'];
    if (typeof email === 'string' && email.trim()) {
      const keyword = email.trim().toLowerCase();
      if (!String(row['email']).toLowerCase().includes(keyword)) return false;
    }

    return true;
  }
}
