import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTagInputBasic } from './demos/tag-input-basic';
import { DemoTagInputDrag } from './demos/tag-input-drag';
import { DemoTagInputMax } from './demos/tag-input-max';

@Component({
  selector: 'tag-input-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTagInputBasic, DemoTagInputMax, DemoTagInputDrag],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">标签输入框 TagInput</h1>
      <p class="docs-page__lead">
        用于输入多个标签，回车创建、点击关闭图标删除，支持数量限制、折叠、拖拽排序与自定义渲染。
      </p>

      <docs-demo
        id="tag-input-basic"
        title="基础用法"
        description="输入内容后按回车创建标签，clearable 悬浮时显示清空图标。"
      >
        <demo-tag-input-basic />
      </docs-demo>

      <docs-demo
        id="tag-input-max"
        title="数量限制与折叠"
        description="max 限制可新增的标签数量，minCollapsedNum 超出后折叠为 +N。"
      >
        <demo-tag-input-max />
      </docs-demo>

      <docs-demo
        id="tag-input-drag"
        title="拖拽排序"
        description="dragSort 开启拖拽，dragSortChange 返回排序后的 newTags。"
      >
        <demo-tag-input-drag />
      </docs-demo>

      <h2 class="docs-section__title" id="tag-input-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTagInput" />
      </div>

      <docs-page-nav current="/tag-input" />
    </article>
  `,
})
export class TagInputDocs {}
