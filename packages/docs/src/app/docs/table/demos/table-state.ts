import { Component } from '@angular/core';
import { TSpaceModule, TSwitchModule, TTableModule, type TableColumn, type TableRow } from '@tdesign-ng/components';

@Component({
  selector: 'demo-table-state',
  imports: [TTableModule, TSwitchModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <p class="demo-hint">
        加载中：
        <t-switch [(value)]="loading" />
      </p>
      <t-table [data]="data" [columns]="columns" rowKey="id" [loading]="loading" />
      <t-table [data]="[]" [columns]="columns" rowKey="id" empty="没有匹配的数据" />
    </t-space>
  `,
})
export class DemoTableState {
  protected loading = true;

  protected readonly columns: TableColumn[] = [
    { colKey: 'name', title: '姓名', width: 160 },
    { colKey: 'role', title: '角色' },
  ];

  protected readonly data: TableRow[] = [
    { id: 1, name: '张三', role: '前端工程师' },
    { id: 2, name: '李四', role: '后端工程师' },
  ];
}
