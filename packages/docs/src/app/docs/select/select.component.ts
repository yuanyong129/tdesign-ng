import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoSelectBasic } from './demos/select-basic';
import { DemoSelectCreatable } from './demos/select-creatable';
import { DemoSelectFilterable } from './demos/select-filterable';
import { DemoSelectGroup } from './demos/select-group';
import { DemoSelectMultiple } from './demos/select-multiple';
import { DemoSelectSize } from './demos/select-size';
import { DemoSelectState } from './demos/select-state';

@Component({
  selector: 'select-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoSelectBasic,
    DemoSelectMultiple,
    DemoSelectFilterable,
    DemoSelectGroup,
    DemoSelectSize,
    DemoSelectState,
    DemoSelectCreatable,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">选择器 Select</h1>
      <p class="docs-page__lead">
        选择器用于从一组选项中选择一个或多个值，下拉面板由 CDK Overlay 渲染，不会被祖先容器裁切。
      </p>

      <docs-demo id="select-basic" title="基础用法" description="用 options 声明选项，[(value)] 双向绑定选中的值。">
        <demo-select-basic />
      </docs-demo>

      <docs-demo id="select-multiple" title="多选" description="multiple 打开多选，选中项以标签形式展示。">
        <demo-select-multiple />
      </docs-demo>

      <docs-demo id="select-filterable" title="可搜索" description="filterable 允许在下拉框内输入关键字过滤选项。">
        <demo-select-filterable />
      </docs-demo>

      <docs-demo id="select-group" title="分组选项" description="options 里传 { group, children } 即可分组展示。">
        <demo-select-group />
      </docs-demo>

      <docs-demo id="select-size" title="尺寸" description="尺寸有 small、medium（默认）、large 三档。">
        <demo-select-size />
      </docs-demo>

      <docs-demo id="select-state" title="禁用、只读与状态" description="disabled 与 readonly 互不相同，status 支持 error / success / warning。">
        <demo-select-state />
      </docs-demo>

      <docs-demo id="select-creatable" title="可创建" description="creatable 配合 filterable，输入不存在的选项时回车即可创建。">
        <demo-select-creatable />
      </docs-demo>

      <h2 class="docs-section__title" id="select-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSelect" />
      </div>

      <docs-page-nav current="/select" />
    </div>
  `,
})
export class SelectDocs {}
