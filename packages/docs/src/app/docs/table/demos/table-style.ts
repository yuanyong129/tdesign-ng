import { Component } from '@angular/core';
import { TSpaceModule, TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-style',
  imports: [TTableModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-table [data]="data" [columns]="columns" rowKey="id" [bordered]="true" [stripe]="true" />
      <t-table [data]="data" [columns]="columns" rowKey="id" [hover]="false" />
    </t-space>
    <p class="demo-hint">bordered 加边框，stripe 显示斑马纹，hover 控制悬停高亮。</p>
  `,
})
export class DemoTableStyle {
  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 160 },
    { colKey: 'role', title: '角色' },
    { colKey: 'score', title: '积分', width: 120, align: 'right' },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', role: '前端工程师', score: 92 },
    { id: 2, name: '李四', role: '后端工程师', score: 88 },
    { id: 3, name: '王五', role: '设计师', score: 95 },
    { id: 4, name: '赵六', role: '产品经理', score: 79 },
  ];
}
