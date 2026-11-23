import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTransferBase } from './demos/transfer-base';
import { DemoTransferDisabled } from './demos/transfer-disabled';
import { DemoTransferSearch } from './demos/transfer-search';

@Component({
  selector: 'transfer-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTransferBase, DemoTransferSearch, DemoTransferDisabled],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">穿梭框 Transfer</h1>
      <p class="docs-page__lead">
        双栏列表之间移动数据，支持搜索过滤、全选、自定义标题与底部内容、单向移动与禁用状态。
      </p>

      <docs-demo
        id="transfer-base"
        title="基础用法"
        description="data 提供数据，targetValue 控制右侧列表的值，选中后点击中间按钮即可移动。"
      >
        <demo-transfer-base />
      </docs-demo>

      <docs-demo
        id="transfer-search"
        title="搜索"
        description="search 开启两侧搜索框，searchPlaceholder 设置占位文案，search 事件返回输入内容与来源。"
      >
        <demo-transfer-search />
      </docs-demo>

      <docs-demo
        id="transfer-disabled"
        title="禁用状态"
        description="disabled 禁用整个穿梭框，数据项的 disabled 只禁用该项。"
      >
        <demo-transfer-disabled />
      </docs-demo>

      <h2 class="docs-section__title" id="transfer-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTransfer" />
      </div>

      <docs-page-nav current="/transfer" />
    </article>
  `,
})
export class TransferDocs {}
