import { Component } from '@angular/core';
import { TPaginationModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-pagination-simple',
  imports: [TPaginationModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-pagination [(current)]="current" [total]="120" theme="simple" [showPageSize]="false" />
      <t-pagination [(current)]="current2" [total]="120" theme="simple" size="small" [totalContent]="false" />
      <p class="demo-hint">theme="simple" 只显示「当前页/总页数」，适合空间紧凑的场景。</p>
    </t-space>
  `,
})
export class DemoPaginationSimple {
  protected current = 2;

  protected current2 = 5;
}
