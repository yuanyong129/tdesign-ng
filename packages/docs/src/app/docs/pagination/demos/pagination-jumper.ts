import { Component } from '@angular/core';
import { TPaginationModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-pagination-jumper',
  imports: [TPaginationModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-pagination
        [(current)]="current"
        [total]="260"
        [showJumper]="true"
        totalContent="共 260 条数据"
      />
      <t-pagination [(current)]="current2" [total]="260" [showJumper]="true" [disabled]="true" />
      <p class="demo-hint">showJumper 显示跳转输入框，totalContent 可以自定义统计文案。</p>
    </t-space>
  `,
})
export class DemoPaginationJumper {
  protected current = 3;

  protected current2 = 2;
}
