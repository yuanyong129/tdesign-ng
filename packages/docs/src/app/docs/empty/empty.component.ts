import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoEmptyBasic } from './demos/empty-basic';
import { DemoEmptyCustom } from './demos/empty-custom';
import { DemoEmptySize } from './demos/empty-size';
import { DemoEmptyType } from './demos/empty-type';

@Component({
  selector: 'empty-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoEmptyBasic, DemoEmptyType, DemoEmptySize, DemoEmptyCustom],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">空状态 Empty</h1>
      <p class="docs-page__lead">
        空状态用于在无数据或异常场景下给出占位说明，内置 empty / success / fail / network-error / maintenance
        五种插图，支持尺寸、自定义图片与操作区。
      </p>

      <docs-demo id="empty-basic" title="基础用法" description="默认展示「暂无数据」插图，传 description 补充说明，操作区用 [tEmptyAction] 投影。">
        <demo-empty-basic />
      </docs-demo>

      <docs-demo id="empty-type" title="内置类型" description="type 切换插图与默认标题，size 支持 small / medium / large。">
        <demo-empty-type />
      </docs-demo>

      <docs-demo id="empty-size" title="尺寸" description="size 支持 small / medium / large，分别对应 20 / 48 / 64 像素插图。">
        <demo-empty-size />
      </docs-demo>

      <docs-demo id="empty-custom" title="自定义图片" description="image 传入图片地址替换内置插图，imageStyle 控制图片尺寸。">
        <demo-empty-custom />
      </docs-demo>

      <h2 class="docs-section__title" id="empty-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TEmpty" />
      </div>

      <docs-page-nav current="/empty" />
    </div>
  `,
})
export class EmptyDocs {}
