import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTabsBasic } from './demos/tabs-basic';
import { DemoTabsCard } from './demos/tabs-card';
import { DemoTabsPlacement } from './demos/tabs-placement';

@Component({
  selector: 'tabs-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTabsBasic, DemoTabsCard, DemoTabsPlacement],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">选项卡 Tabs</h1>
      <p class="docs-page__lead">
        选项卡用于在同一区域切换多块内容，支持 normal / card 主题、上下左右四个位置、禁用状态与受控取值。
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

      <h2 class="docs-section__title" id="tabs-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTabs" />
      </div>

      <docs-page-nav current="/tabs" />
    </div>
  `,
})
export class TabsDocs {}
