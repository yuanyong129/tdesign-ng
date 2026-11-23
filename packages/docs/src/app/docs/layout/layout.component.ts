import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoLayoutAside } from './demos/layout-aside';
import { DemoLayoutBasic } from './demos/layout-basic';
import { DemoLayoutNested } from './demos/layout-nested';

@Component({
  selector: 'layout-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoLayoutAside, DemoLayoutBasic, DemoLayoutNested],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">布局 Layout</h1>
      <p class="docs-page__lead">
        布局用于搭建页面的整体结构，由 t-layout、t-header、t-aside、t-content、t-footer 组合而成。
      </p>

      <docs-demo
        id="layout-basic"
        title="基础布局"
        description="从上到下的头部、内容、底部三段式布局，t-header 与 t-footer 可以设置高度。"
      >
        <demo-layout-basic />
      </docs-demo>

      <docs-demo
        id="layout-aside"
        title="侧边栏布局"
        description="layout 内部包含 t-aside 时会自动变为水平方向，aside 的宽度可以用 width 设置。"
      >
        <demo-layout-aside />
      </docs-demo>

      <docs-demo
        id="layout-nested"
        title="嵌套布局"
        description="布局可以嵌套使用，内层布局不写 direction 时会按是否包含 aside 自动判断方向。"
      >
        <demo-layout-nested />
      </docs-demo>

      <h2 class="docs-section__title" id="layout-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TLayout" />
      </div>
      <div class="api-table__scroll">
        <api-table component="THeader" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TAside" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TContent" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TFooter" />
      </div>

      <docs-page-nav current="/layout" />
    </article>
  `,
})
export class LayoutDocs {}
