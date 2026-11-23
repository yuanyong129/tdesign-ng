import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTreeBase } from './demos/tree-base';
import { DemoTreeCheckable } from './demos/tree-checkable';
import { DemoTreeLazy } from './demos/tree-lazy';

@Component({
  selector: 'tree-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTreeBase, DemoTreeCheckable, DemoTreeLazy],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">树形控件 Tree</h1>
      <p class="docs-page__lead">
        树形控件用层级结构展示数据，支持展开收起、勾选联动、激活行与懒加载，可通过模板自定义节点文案与展开图标。
      </p>

      <docs-demo
        id="tree-base"
        title="基础用法"
        description="data 提供树形数据，defaultExpanded 指定默认展开的节点；activable 开启激活态，hover 与 line 分别控制悬停高亮和连接线。"
      >
        <demo-tree-base />
      </docs-demo>

      <docs-demo
        id="tree-checkable"
        title="可勾选与父子联动"
        description="checkable 显示复选框，默认父子联动，父节点全选或半选由子节点推导；valueMode 为 parentFirst 时父级全选的回传父级值，否则只回传叶子值。"
      >
        <demo-tree-checkable />
      </docs-demo>

      <docs-demo
        id="tree-lazy"
        title="懒加载"
        description="节点的 children 为 true 时表示子节点待加载，展开该节点会调用 load 回调，回调返回（或 resolve）子节点数组后自动渲染。"
      >
        <demo-tree-lazy />
      </docs-demo>

      <h2 class="docs-section__title" id="tree-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTree" />
      </div>

      <docs-page-nav current="/tree" />
    </article>
  `,
})
export class TreeDocs {}
