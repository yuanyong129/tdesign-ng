import { Component } from '@angular/core';
import {
  TTableModule,
  type TableColumn,
  type TableRow,
  type TableScroll,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-virtual',
  imports: [TTableModule],
  template: `
    <t-table
      [data]="data"
      [columns]="columns"
      rowKey="id"
      height="400px"
      [scroll]="scroll"
    />
    <p class="demo-hint">
      共 {{ data.length }} 行，DOM 里只渲染可视区域附近的行，滚动时表格自己复用这些行；
      需要自定义行高时改 scroll.rowHeight。
    </p>
  `,
})
export class DemoTableVirtual {
  protected readonly scroll: TableScroll = { type: 'virtual', rowHeight: 47 };

  protected readonly columns: TableColumn[] = [
    { colKey: 'id', title: '编号', width: 100 },
    { colKey: 'name', title: '姓名', width: 160 },
    { colKey: 'role', title: '角色', width: 180 },
    { colKey: 'city', title: '城市', width: 140 },
  ];

  protected readonly data: TableRow[] = Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    name: `成员 ${index + 1}`,
    role: ['前端工程师', '后端工程师', '设计师', '产品经理'][index % 4],
    city: ['深圳', '杭州', '上海', '北京'][index % 4],
  }));
}
