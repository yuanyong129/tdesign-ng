import { Component } from '@angular/core';
import { TPaginationModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-pagination-folded',
  imports: [TPaginationModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-pagination [(current)]="current" [total]="500" [pageSize]="10" />
      <t-pagination [(current)]="current2" [total]="500" [pageSize]="10" pageEllipsisMode="both-ends" />
      <p class="demo-hint">
        超过 maxPageBtn（默认 7）时折叠：mid 模式首尾页固定显示、中间出现省略号，省略号点击前后跳 5 页；both-ends
        模式不显示首尾页，只渲染当前页附近的窗口。
      </p>
    </t-space>
  `,
})
export class DemoPaginationFolded {
  protected current = 1;

  protected current2 = 1;
}
