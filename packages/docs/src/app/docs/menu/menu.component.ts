import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoMenuBase } from './demos/menu-base';
import { DemoMenuCollapsed } from './demos/menu-collapsed';
import { DemoMenuHorizontal } from './demos/menu-horizontal';

@Component({
  selector: 'menu-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoMenuBase, DemoMenuCollapsed, DemoMenuHorizontal],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">导航菜单 Menu</h1>
      <p class="docs-page__lead">
        导航菜单用于承载页面级的跳转入口，竖向菜单在内部展开子菜单，横向菜单用浮层展示子菜单；折叠后只保留图标列。
      </p>

      <docs-demo
        id="menu-base"
        title="基础用法"
        description="value 指定选中项，expanded 指定展开的子菜单，两者都能双向绑定；子菜单在菜单内部展开，菜单分组用来给一组菜单项加标题。"
      >
        <demo-menu-base />
      </docs-demo>

      <docs-demo
        id="menu-collapsed"
        title="折叠菜单"
        description="collapsed 为 true 时只显示图标，子菜单改为浮层展开；折叠宽度由 collapsedWidth 指定，也可以交给 width 数组的第二项。"
      >
        <demo-menu-collapsed />
      </docs-demo>

      <docs-demo
        id="menu-horizontal"
        title="横向菜单"
        description="mode 为 horizontal 时横向排列，子菜单用浮层下拉；logo 与 operations 分别占据最左和最右的操作区。"
      >
        <demo-menu-horizontal />
      </docs-demo>

      <h2 class="docs-section__title" id="menu-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TMenu" />
        <api-table component="TMenuItem" />
        <api-table component="TSubmenu" />
        <api-table component="TMenuGroup" />
      </div>

      <docs-page-nav current="/menu" />
    </article>
  `,
})
export class MenuDocs {}
