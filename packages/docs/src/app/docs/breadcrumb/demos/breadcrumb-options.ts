import { Component } from '@angular/core';
import { TBreadcrumbModule } from '@tdesign-ng/components';
import type { BreadcrumbOption } from '@tdesign-ng/components';

@Component({
  selector: 'demo-breadcrumb-options',
  imports: [TBreadcrumbModule],
  template: `
    <t-breadcrumb [options]="items" maxItemWidth="120" />
  `,
})
export class DemoBreadcrumbOptions {
  protected readonly items: BreadcrumbOption[] = [
    { content: '首页', href: '/' },
    { content: '组件' },
    { content: '面包屑 Breadcrumb 的超长文本会被截断' },
    { content: '不可点击的末项', disabled: true },
  ];
}
