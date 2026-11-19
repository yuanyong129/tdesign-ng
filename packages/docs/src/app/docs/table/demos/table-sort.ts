import { Component } from '@angular/core';
import { TSpaceModule, TTableModule, type TableColumn, type TableRow, type TableSort } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-sort',
  imports: [TTableModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-table
        [data]="data"
        [columns]="columns"
        rowKey="id"
        [defaultSort]="defaultSort"
        (sortChange)="handleSortChange($event)"
      />
      <p class="demo-hint">{{ hint }}</p>
    </t-space>
  `,
})
export class DemoTableSort {
  protected readonly defaultSort: TableSort = { sortBy: 'score', descending: true };

  protected hint = '默认按积分倒序，点击表头在「升序 → 降序 → 取消」之间切换。';

  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 160, sorter: true },
    { colKey: 'role', title: '角色' },
    { colKey: 'score', title: '积分', width: 160, align: 'right', sorter: (a, b) => Number(a['score']) - Number(b['score']) },
    { colKey: 'joined', title: '入职日期', width: 180, sorter: true },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '李四', role: '后端工程师', score: 88, joined: '2021-03-02' },
    { id: 2, name: '张三', role: '前端工程师', score: 92, joined: '2020-07-15' },
    { id: 3, name: '赵六', role: '产品经理', score: 79, joined: '2022-11-08' },
    { id: 4, name: '王五', role: '设计师', score: 95, joined: '2019-05-20' },
  ];

  protected handleSortChange(sort: TableSort | undefined): void {
    if (!sort) {
      this.hint = '已取消排序，恢复原始顺序。';
      return;
    }
    const info = Array.isArray(sort) ? sort[0] : sort;
    this.hint = `按 ${info.sortBy} ${info.descending ? '倒序' : '正序'}排序。`;
  }
}
