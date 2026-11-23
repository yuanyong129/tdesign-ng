import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoBreadcrumbBase } from './demos/breadcrumb-base';
import { DemoBreadcrumbOptions } from './demos/breadcrumb-options';
import { DemoBreadcrumbSeparator } from './demos/breadcrumb-separator';

@Component({
  selector: 'breadcrumb-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoBreadcrumbBase, DemoBreadcrumbOptions, DemoBreadcrumbSeparator],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">面包屑 Breadcrumb</h1>
      <p class="docs-page__lead">
        面包屑用于展示当前页面在层级结构中的位置，并支持快速返回上级页面；既可以投影子项，也可以用 options 数据驱动。
      </p>

      <docs-demo
        id="breadcrumb-base"
        title="基础用法"
        description="最后一项代表当前页面；设置 href 的项渲染为链接，其余项只是文本。"
      >
        <demo-breadcrumb-base />
      </docs-demo>

      <docs-demo
        id="breadcrumb-separator"
        title="分隔符"
        description="separator 支持字符串（如 > 和 /），也支持模板，模板里可以放图标。"
      >
        <demo-breadcrumb-separator />
      </docs-demo>

      <docs-demo
        id="breadcrumb-options"
        title="选项式用法"
        description="用 options 传入数据、由父容器统一渲染；maxItemWidth 控制单项最大宽度，disabled 让某一项不可点击。"
      >
        <demo-breadcrumb-options />
      </docs-demo>

      <h2 class="docs-section__title" id="breadcrumb-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TBreadcrumb" />
        <api-table component="TBreadcrumbItem" />
      </div>

      <docs-page-nav current="/breadcrumb" />
    </article>
  `,
})
export class BreadcrumbDocs {}
