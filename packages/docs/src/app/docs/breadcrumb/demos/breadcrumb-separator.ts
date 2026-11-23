import { Component } from '@angular/core';
import { TIcon } from '@tdesign-ng/icons';
import { TBreadcrumbModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-breadcrumb-separator',
  imports: [TBreadcrumbModule, TIcon],
  template: `
    <t-breadcrumb separator=">">
      <t-breadcrumb-item>首页</t-breadcrumb-item>
      <t-breadcrumb-item>组件</t-breadcrumb-item>
      <t-breadcrumb-item>面包屑 Breadcrumb</t-breadcrumb-item>
    </t-breadcrumb>

    <t-breadcrumb separator="/">
      <t-breadcrumb-item>首页</t-breadcrumb-item>
      <t-breadcrumb-item>组件</t-breadcrumb-item>
      <t-breadcrumb-item>面包屑 Breadcrumb</t-breadcrumb-item>
    </t-breadcrumb>

    <!-- separator 也可以是模板，TNode 的模板分支 -->
    <t-breadcrumb [separator]="separatorTemplate">
      <t-breadcrumb-item>首页</t-breadcrumb-item>
      <t-breadcrumb-item>组件</t-breadcrumb-item>
      <t-breadcrumb-item>面包屑 Breadcrumb</t-breadcrumb-item>
    </t-breadcrumb>

    <ng-template #separatorTemplate>
      <t-icon name="arrow-right" />
    </ng-template>
  `,
})
export class DemoBreadcrumbSeparator {}
