import { Component, computed, signal } from '@angular/core';
import { TTableModule, type TableColumn, type TableRow, type TableSelectChangeEvent } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-select',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      [selectedRowKeys]="selectedRowKeys()"
      (selectChange)="handleSelectChange($event)"
    />
    <p class="demo-hint">
      已选 {{ selectedRowKeys().length }} 行：{{ selectedNames() || '—' }}。表头复选框支持全选，部分选中时为半选态。
    </p>
  `,
})
export class DemoTableSelect {
  protected readonly selectedRowKeys = signal<Array<string | number>>([2]);

  protected readonly columns: TableColumn[] = [
    { colKey: 'row-select', type: 'multiple', width: 64 },
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'role', title: '角色', width: 160 },
    { colKey: 'department', title: '部门', width: 160 },
    { colKey: 'city', title: '城市', width: 120 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', role: '前端工程师', department: '基础架构', city: '深圳' },
    { id: 2, name: '李四', role: '后端工程师', department: '交易平台', city: '杭州' },
    { id: 3, name: '王五', role: '设计师', department: '设计中心', city: '上海' },
    { id: 4, name: '赵六', role: '产品经理', department: '增长产品', city: '北京' },
    { id: 5, name: '孙七', role: '后端工程师', department: '支付', city: '广州' },
  ];

  protected readonly selectedNames = computed(() => {
    const keys = new Set(this.selectedRowKeys());
    return this.data
      .filter((row) => keys.has(row['id']))
      .map((row) => row['name'])
      .join('、');
  });

  protected handleSelectChange(event: TableSelectChangeEvent): void {
    this.selectedRowKeys.set(event.selectedRowKeys);
  }
}
