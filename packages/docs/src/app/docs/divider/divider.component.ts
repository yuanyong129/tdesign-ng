import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDividerAlign } from './demos/divider-align';
import { DemoDividerHorizontal } from './demos/divider-horizontal';
import { DemoDividerMargin } from './demos/divider-margin';
import { DemoDividerVertical } from './demos/divider-vertical';

@Component({
  selector: 'divider-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoDividerAlign, DemoDividerHorizontal, DemoDividerMargin, DemoDividerVertical],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">分割线 Divider</h1>
      <p class="docs-page__lead">
        分割线用于将内容分块，支持水平、垂直、虚线与带文字等多种形态。
      </p>

      <docs-demo
        id="divider-horizontal"
        title="水平分割线"
        description="默认是水平分割线，可以设置 dashed 变为虚线，也可以放置文字。"
      >
        <demo-divider-horizontal />
      </docs-demo>

      <docs-demo
        id="divider-align"
        title="带文字的分割线"
        description="通过 align 控制文字位置：left、center、right。"
      >
        <demo-divider-align />
      </docs-demo>

      <docs-demo
        id="divider-vertical"
        title="垂直分割线"
        description="把 layout 设为 vertical，用于行内元素之间的分隔。"
      >
        <demo-divider-vertical />
      </docs-demo>

      <docs-demo
        id="divider-margin"
        title="自定义间距"
        description="通过 size 设置分割线上下（垂直时为左右）的间距，数字单位为像素。"
      >
        <demo-divider-margin />
      </docs-demo>

      <h2 class="docs-section__title" id="divider-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TDivider" />
      </div>

      <docs-page-nav current="/divider" />
    </article>
  `,
})
export class DividerDocs {}
