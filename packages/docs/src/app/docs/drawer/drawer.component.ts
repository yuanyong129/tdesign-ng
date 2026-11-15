import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDrawerBasic } from './demos/drawer-basic';
import { DemoDrawerCustom } from './demos/drawer-custom';
import { DemoDrawerPlacement } from './demos/drawer-placement';

@Component({
  selector: 'drawer-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoDrawerBasic, DemoDrawerPlacement, DemoDrawerCustom],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">抽屉 Drawer</h1>
      <p class="docs-page__lead">
        抽屉从屏幕边缘滑出，用于承载表单、详情等需要更多空间的内容，支持四个方向与自定义尺寸。
      </p>

      <docs-demo id="drawer-basic" title="基础用法" description="默认从右侧滑出，宽度由 size 控制。">
        <demo-drawer-basic />
      </docs-demo>

      <docs-demo id="drawer-placement" title="出现方向" description="placement 支持 left / right / top / bottom。">
        <demo-drawer-placement />
      </docs-demo>

      <docs-demo id="drawer-custom" title="自定义内容与底部" description="默认投影是内容，[tDrawerFooter] 可以接管底部按钮。">
        <demo-drawer-custom />
      </docs-demo>

      <h2 class="docs-section__title" id="drawer-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TDrawer" />
      </div>

      <docs-page-nav current="/drawer" />
    </div>
  `,
})
export class DrawerDocs {}
