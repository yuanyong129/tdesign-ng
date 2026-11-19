import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTabsAddRemove } from './demos/tabs-add-remove';
import { DemoTabsBasic } from './demos/tabs-basic';
import { DemoTabsCard } from './demos/tabs-card';
import { DemoTabsDragSort } from './demos/tabs-drag-sort';
import { DemoTabsLazy } from './demos/tabs-lazy';
import { DemoTabsPlacement } from './demos/tabs-placement';

@Component({
  selector: 'tabs-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoTabsAddRemove,
    DemoTabsBasic,
    DemoTabsCard,
    DemoTabsDragSort,
    DemoTabsLazy,
    DemoTabsPlacement,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">选项卡 Tabs</h1>
      <p class="docs-page__lead">
        选项卡用于在同一区域切换多块内容，支持 normal / card 主题、上下左右四个位置、禁用状态、受控取值、新增与关闭页签、拖拽排序。
      </p>

      <docs-demo
        id="tabs-basic"
        title="基础用法"
        description="用 t-tab-panel 声明面板，value 与 label 分别对应选项卡的值与标题。"
      >
        <demo-tabs-basic />
      </docs-demo>

      <docs-demo id="tabs-card" title="卡片主题" description="theme 为 card 时导航项之间用边框分隔，不显示指示条。">
        <demo-tabs-card />
      </docs-demo>

      <docs-demo id="tabs-placement" title="位置与尺寸" description="placement 支持 top / bottom / left / right，size 支持 medium / large。">
        <demo-tabs-placement />
      </docs-demo>

      <docs-demo
        id="tabs-add-remove"
        title="新增与关闭"
        description="addable 显示新增按钮，面板上 removable 显示关闭按钮；(add) 与 (remove) 只抛事件，页签数据由使用方维护。"
      >
        <demo-tabs-add-remove />
      </docs-demo>

      <docs-demo
        id="tabs-drag-sort"
        title="拖拽排序"
        description="打开 dragSort 后可拖拽页签，(dragSortChange) 抛出拖拽前后的下标与值。"
      >
        <demo-tabs-drag-sort />
      </docs-demo>

      <docs-demo
        id="tabs-lazy"
        title="懒加载与销毁"
        description="面板的 lazy 让内容在首次激活时挂载，destroyOnHide 让内容在切走后销毁。"
      >
        <demo-tabs-lazy />
      </docs-demo>

      <h2 class="docs-section__title" id="tabs-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTabs" />
      </div>

      <docs-page-nav current="/tabs" />
    </div>
  `,
})
export class TabsDocs {}
