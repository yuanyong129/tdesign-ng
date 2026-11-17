import { Component } from '@angular/core';
import { TPaginationModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-pagination-folded',
  imports: [TPaginationModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-pagination [(current)]="current" [total]="500" [pageSize]="10" />
      <t-pagination [(current)]="current2" [total]="500" [pageSize]="10" pageEllipsisMode="both-ends" />
      <p class="demo-hint">超过 maxPageBtn（默认 7）时折叠，省略号点击会前后跳 5 页。</p>
    </t-space>
  `,
})
export class DemoPaginationFolded {
  protected current = 1;

  protected current2 = 1;
}
