import { Component } from '@angular/core';
import { TBreadcrumbModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-breadcrumb-base',
  imports: [TBreadcrumbModule],
  template: `
    <t-breadcrumb>
      <t-breadcrumb-item href="/">首页</t-breadcrumb-item>
      <t-breadcrumb-item href="/button">组件</t-breadcrumb-item>
      <t-breadcrumb-item>面包屑 Breadcrumb</t-breadcrumb-item>
    </t-breadcrumb>
  `,
})
export class DemoBreadcrumbBase {}
