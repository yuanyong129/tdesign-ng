import { Component } from '@angular/core';
import { TPaginationModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-pagination-basic',
  imports: [TPaginationModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-pagination [(current)]="current" [total]="100" [(pageSize)]="pageSize" />
      <p class="demo-hint">当前第 {{ current }} 页，每页 {{ pageSize }} 条。</p>
    </t-space>
  `,
})
export class DemoPaginationBasic {
  protected current = 1;

  protected pageSize = 10;
}
