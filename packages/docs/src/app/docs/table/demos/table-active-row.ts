import { Component, signal } from '@angular/core';
import { TTableModule, type TableActiveChangeEvent, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-active-row',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      activeRowType="multiple"
      [activeRowKeys]="activeRowKeys()"
      (activeChange)="handleActiveChange($event)"
    />
    <p class="demo-hint">
      点击行即可高亮；聚焦表格后可用 ↑ / ↓ 移动当前行、空格切换、Shift + 空格连选、Esc 清空、Ctrl + A 全选。当前高亮
      {{ activeRowKeys().length }} 行。
    </p>
  `,
})
export class DemoTableActiveRow {
  protected readonly activeRowKeys = signal<Array<string | number>>([1]);

  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 140 },
    { colKey: 'role', title: '角色', width: 160 },
    { colKey: 'city', title: '城市', width: 120 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', role: '前端工程师', city: '深圳' },
    { id: 2, name: '李四', role: '后端工程师', city: '杭州' },
    { id: 3, name: '王五', role: '设计师', city: '上海' },
    { id: 4, name: '赵六', role: '产品经理', city: '北京' },
  ];

  protected handleActiveChange(event: TableActiveChangeEvent): void {
    this.activeRowKeys.set(event.activeRowKeys);
  }
}
