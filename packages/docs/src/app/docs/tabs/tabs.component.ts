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
import { DemoTabsAction } from './demos/tabs-action';
import { DemoTabsList } from './demos/tabs-list';

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
    DemoTabsAction,
    DemoTabsList,
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

      <docs-demo id="tabs-action" title="自定义操作区" description="action 支持字符串和模板，与新增按钮共存；操作区内容不会成为页签面板。">
        <demo-tabs-action />
      </docs-demo>

      <docs-demo id="tabs-list" title="数据驱动面板" description="list 的标题与内容支持字符串或模板；切换后对比保留、首次激活和隐藏销毁的计数状态。新增、关闭和排序由页面维护数据，稳定 value 在重排后保留原实例。">
        <demo-tabs-list />
      </docs-demo>
      <p class="demo-hint">非空 list 优先于 t-tab-panel 投影，空数组回退到投影；投影组件仍由 Angular 创建，不适合作为延迟构造机制。每项支持 value、label、panel、default、disabled、removable、draggable、lazy、destroyOnHide 和 onRemove；default 优先于 panel，字符串按文本显示，模板不接收 Vue 渲染函数。value 必须唯一且稳定，缺省使用下标，不适合可重排数据。组件只通知 change / add / remove / dragSortChange，删除当前项后的新激活值由调用方决定，失效值不自动跳到首项。defaultValue 只读取一次；受控 value 拒绝提案时保持原面板。方向键按导航方向切换并跳过禁用项，Home / End 定位，Enter / 空格激活，Delete 请求关闭。</p>

      <h2 class="docs-section__title" id="tabs-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTabs" />
      </div>

      <docs-page-nav current="/tabs" />
    </div>
  `,
})
export class TabsDocs {}
