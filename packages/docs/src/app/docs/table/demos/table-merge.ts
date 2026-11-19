import { Component } from '@angular/core';
import { TTableModule, type TableColumn, type TableRow, type TableRowspan } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-merge',
  imports: [TTableModule],
  template: `
    <t-table [data]="data" [columns]="columns" rowKey="id" bordered [rowspanAndColspan]="rowspanAndColspan" />
    <p class="demo-hint">
      部门与城市按两行合并：rowspanAndColspan 返回 rowspan 2 的格子会向下合并，被覆盖的单元格不再渲染。
    </p>
  `,
})
export class DemoTableMerge {
  protected readonly columns: TableColumn[] = [
    { colKey: 'department', title: '部门', width: 160 },
    { colKey: 'name', title: '姓名', width: 120 },
    { colKey: 'role', title: '角色', width: 160 },
    { colKey: 'city', title: '城市', width: 120 },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, department: '基础架构', name: '张三', role: '前端工程师', city: '深圳' },
    { id: 2, department: '基础架构', name: '李四', role: '后端工程师', city: '深圳' },
    { id: 3, department: '交易平台', name: '王五', role: '设计师', city: '杭州' },
    { id: 4, department: '交易平台', name: '赵六', role: '产品经理', city: '杭州' },
    { id: 5, department: '设计中心', name: '孙七', role: '后端工程师', city: '上海' },
    { id: 6, department: '设计中心', name: '周八', role: '测试工程师', city: '上海' },
  ];

  protected readonly rowspanAndColspan = (params: { rowIndex: number; col: TableColumn }): TableRowspan => {
    const mergeable = params.col.colKey === 'department' || params.col.colKey === 'city';
    return mergeable && params.rowIndex % 2 === 0 ? { rowspan: 2 } : {};
  };
}
