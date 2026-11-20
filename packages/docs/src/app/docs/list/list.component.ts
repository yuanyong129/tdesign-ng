import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoListAction } from './demos/list-action';
import { DemoListAsync } from './demos/list-async';
import { DemoListBasic } from './demos/list-basic';
import { DemoListStyle } from './demos/list-style';

@Component({
  selector: 'list-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoListBasic, DemoListAction, DemoListStyle, DemoListAsync],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">列表 List</h1>
      <p class="docs-page__lead">
        列表用于展示同类内容的集合，支持头像与标题描述、操作区、分割线、斑马纹、尺寸切换与异步加载更多。
      </p>

      <docs-demo id="list-basic" title="基础用法" description="t-list-item 内放 t-list-item-meta，提供头像、标题与描述。">
        <demo-list-basic />
      </docs-demo>

      <docs-demo id="list-action" title="操作区" description="action 渲染右侧操作区，layout 为 vertical 时操作区另起一行。">
        <demo-list-action />
      </docs-demo>

      <docs-demo id="list-style" title="分割线、斑马纹与尺寸" description="split 显示分割线，stripe 显示斑马纹，size 支持 small / medium / large。">
        <demo-list-style />
      </docs-demo>

      <docs-demo id="list-async" title="异步加载" description="asyncLoading 为 load-more 时展示「加载更多」，点击触发 (loadMore)；设为 loading 时展示加载图标。">
        <demo-list-async />
      </docs-demo>

      <h2 class="docs-section__title" id="list-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TList" />
      </div>

      <docs-page-nav current="/list" />
    </div>
  `,
})
export class ListDocs {}
