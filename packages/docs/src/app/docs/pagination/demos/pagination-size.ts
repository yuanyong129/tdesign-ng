import { Component } from '@angular/core';
import { TPaginationModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-pagination-size',
  imports: [TPaginationModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-pagination
        [(current)]="current"
        [(pageSize)]="pageSize"
        [total]="total"
        [pageSizeOptions]="[5, 10, 20]"
      />
      <t-pagination
        [(current)]="current2"
        [(pageSize)]="pageSize2"
        [total]="total"
        size="small"
        [totalContent]="false"
      />
      <p class="demo-hint">每页条数可切换，small 尺寸只影响高度和字号。</p>
    </t-space>
  `,
})
export class DemoPaginationSize {
  protected total = 200;

  protected current = 1;

  protected pageSize = 10;

  protected current2 = 1;

  protected pageSize2 = 20;
}
