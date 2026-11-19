import { Component, computed, signal } from '@angular/core';
import {
  TTableModule,
  type TableColumn,
  type TableColumnResizeEvent,
  type TableRow,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-resizable',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      resizable
      (columnResizeChange)="handleColumnResize($event)"
    />
    <p class="demo-hint">
      鼠标移到表头右边缘会变成拖拽光标，按住左右拖动即可调整列宽；「姓名」限制在 100–220px，「邮箱」关闭了拖拽。当前列宽：{{ widthText() }}
    </p>
  `,
})
export class DemoTableResizable {
  protected readonly columnWidths = signal<Record<string, number>>({});

  protected readonly widthText = computed(() => {
    const entries = Object.entries(this.columnWidths());
    return entries.length ? entries.map(([key, value]) => `${key} ${value}px`).join('，') : '默认宽度';
  });

  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140, resize: { minWidth: 100, maxWidth: 220 } },
    { colKey: 'role', title: '角色', width: 160 },
    { colKey: 'department', title: '部门', width: 160 },
    { colKey: 'city', title: '城市', width: 120 },
    { colKey: 'email', title: '邮箱', width: 240, resizable: false },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', role: '前端工程师', department: '基础架构', city: '深圳', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', role: '后端工程师', department: '交易平台', city: '杭州', email: 'lisi@example.com' },
    { id: 3, name: '王五', role: '设计师', department: '设计中心', city: '上海', email: 'wangwu@example.com' },
    { id: 4, name: '赵六', role: '产品经理', department: '增长产品', city: '北京', email: 'zhaoliu@example.com' },
  ];

  protected handleColumnResize(event: TableColumnResizeEvent): void {
    this.columnWidths.set(event.columnsWidth);
  }
}
