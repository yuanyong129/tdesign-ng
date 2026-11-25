import { Component } from '@angular/core';
import { TPaginationModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-pagination-uncontrolled',
  imports: [TPaginationModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-pagination
        [defaultCurrent]="2"
        [defaultPageSize]="20"
        [total]="200"
        [pageSizeOptions]="[20, 40, 80]"
        [selectProps]="{ size: 'small', placeholder: '每页条数' }"
        [totalContent]="totalTpl"
      />
      <t-pagination [defaultCurrent]="1" [defaultPageSize]="10" [total]="200" [totalContent]="false" />
      <p class="demo-hint">
        defaultCurrent / defaultPageSize 用于非受控场景，totalContent 支持模板，selectProps 透传给每页条数选择器。
      </p>
    </t-space>

    <ng-template #totalTpl>
      <span class="demo-hint">共 200 条（模板统计）</span>
    </ng-template>
  `,
})
export class DemoPaginationUncontrolled {}
