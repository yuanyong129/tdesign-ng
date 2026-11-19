import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoCollapseAccordion } from './demos/collapse-accordion';
import { DemoCollapseBasic } from './demos/collapse-basic';
import { DemoCollapseOptions } from './demos/collapse-options';

@Component({
  selector: 'collapse-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoCollapseAccordion, DemoCollapseBasic, DemoCollapseOptions],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">折叠面板 Collapse</h1>
      <p class="docs-page__lead">
        折叠面板把内容按标题分组收起或展开，支持手风琴模式、点击整行、图标位置、无边框与收起后销毁内容。
      </p>

      <docs-demo
        id="collapse-basic"
        title="基础用法"
        description="用 t-collapse-panel 声明面板，value 与 header 分别对应面板的值与标题。"
      >
        <demo-collapse-basic />
      </docs-demo>

      <docs-demo
        id="collapse-accordion"
        title="手风琴"
        description="expandMutex 打开后同一时间只会展开一个面板，再点当前面板可以收起。"
      >
        <demo-collapse-accordion />
      </docs-demo>

      <docs-demo
        id="collapse-options"
        title="更多配置"
        description="borderless 去掉外边框，expandOnRowClick 让整行可点击，expandIconPlacement 调整箭头位置，destroyOnCollapse 收起后销毁内容。"
      >
        <demo-collapse-options />
      </docs-demo>

      <h2 class="docs-section__title" id="collapse-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TCollapse" />
      </div>

      <docs-page-nav current="/collapse" />
    </div>
  `,
})
export class CollapseDocs {}
