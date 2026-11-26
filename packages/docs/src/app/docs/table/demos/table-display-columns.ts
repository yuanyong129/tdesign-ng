import { Component, signal } from '@angular/core';
import {
  TButtonModule,
  TTableModule,
  type TableColumn,
  type TableExpandedRowContext,
  type TableRow,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-display-columns',
  imports: [TButtonModule, TTableModule],
  template: `
    <div class="demo-columns-switch">
      @for (item of columnOptions; track item.colKey) {
        <t-button
          size="small"
          [variant]="visibleColumns().includes(item.colKey) ? 'base' : 'outline'"
          [theme]="visibleColumns().includes(item.colKey) ? 'primary' : 'default'"
          (click)="toggleColumn(item.colKey)"
        >
          {{ item.title }}
        </t-button>
      }
    </div>

    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      [displayColumns]="visibleColumns()"
    />

    <t-table
      [data]="data"
      [columns]="selectionColumns"
      rowKey="id"
      [pagination]="{ current: 1, pageSize: 3, total: 6 }"
      [reserveSelectedRowOnPaginate]="false"
      [expandedRow]="expandedRowContent"
    />

    <p class="demo-hint">
      displayColumns 受控决定渲染哪些列（按传入顺序排列）；expandedRow 直接用文本或模板给出展开内容，无需
      tTableExpandedRow 指令；reserveSelectedRowOnPaginate 为 false 时翻页会丢弃不在当前页的选中项。
    </p>
  `,
})
export class DemoTableDisplayColumns {
  protected readonly columnOptions = [
    { colKey: 'name', title: '姓名' },
    { colKey: 'role', title: '角色' },
    { colKey: 'department', title: '部门' },
    { colKey: 'status', title: '状态' },
  ];

  protected readonly visibleColumns = signal<string[]>(['name', 'role', 'department']);

  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'role', title: '角色', width: 160 },
    { colKey: 'department', title: '部门', width: 160 },
    { colKey: 'status', title: '状态', width: 120 },
  ];

  protected readonly selectionColumns: TableColumn[] = [
    { colKey: 'row-select', type: 'multiple', width: 64 },
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'department', title: '部门' },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', role: '前端工程师', department: '基础架构', status: '在职' },
    { id: 2, name: '李四', role: '后端工程师', department: '交易平台', status: '在职' },
    { id: 3, name: '王五', role: '设计师', department: '设计中心', status: '休假' },
    { id: 4, name: '赵六', role: '产品经理', department: '增长产品', status: '在职' },
    { id: 5, name: '孙七', role: '测试工程师', department: '质量保障', status: '离职' },
    { id: 6, name: '周八', role: '运维工程师', department: '基础架构', status: '在职' },
  ];

  /** 展开行内容：直接返回文本，也可以返回 TemplateRef。 */
  protected readonly expandedRowContent = (context: TableExpandedRowContext): string =>
    `${context.row['name']} · ${context.row['department']} · ${context.row['status']}`;

  protected toggleColumn(colKey: string): void {
    const current = this.visibleColumns();
    this.visibleColumns.set(
      current.includes(colKey) ? current.filter((key) => key !== colKey) : [...current, colKey],
    );
  }
}
