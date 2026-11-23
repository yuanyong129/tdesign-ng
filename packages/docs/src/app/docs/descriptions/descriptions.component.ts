import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDescriptionsBase } from './demos/descriptions-base';
import { DemoDescriptionsBordered } from './demos/descriptions-bordered';
import { DemoDescriptionsLayout } from './demos/descriptions-layout';

@Component({
  selector: 'descriptions-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoDescriptionsBase, DemoDescriptionsBordered, DemoDescriptionsLayout],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">描述列表 Descriptions</h1>
      <p class="docs-page__lead">
        描述列表把多组「标签：内容」按列排布，常用于详情页、订单信息等需要成组展示只读字段的场景。
      </p>

      <docs-demo
        id="descriptions-base"
        title="基础用法"
        description="默认横向布局、每行两列。描述项由 t-descriptions-item 声明，span 可以让某一项跨列显示。"
      >
        <demo-descriptions-base />
      </docs-demo>

      <docs-demo
        id="descriptions-bordered"
        title="带边框与自定义样式"
        description="bordered 显示单元格边框，size 控制单元格内边距，column 设置每行列数；labelStyle 与 contentStyle 透传给单元格，描述项也可以直接用 items 数组声明。"
      >
        <demo-descriptions-bordered />
      </docs-demo>

      <docs-demo
        id="descriptions-layout"
        title="布局方向"
        description="layout 控制整体布局，itemLayout 控制标签与内容的排列方向，两者组合共四种排布方式。"
      >
        <demo-descriptions-layout />
      </docs-demo>

      <h2 class="docs-section__title" id="descriptions-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TDescriptions" />
        <api-table component="TDescriptionItem" />
      </div>

      <docs-page-nav current="/descriptions" />
    </article>
  `,
})
export class DescriptionsDocs {}
