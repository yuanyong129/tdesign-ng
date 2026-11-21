import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTreeSelectBasic } from './demos/tree-select-basic';
import { DemoTreeSelectFilter } from './demos/tree-select-filter';
import { DemoTreeSelectLoading } from './demos/tree-select-loading';
import { DemoTreeSelectMultiple } from './demos/tree-select-multiple';
import { DemoTreeSelectOptions } from './demos/tree-select-options';
import { DemoTreeSelectPanel } from './demos/tree-select-panel';

@Component({
  selector: 'tree-select-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoTreeSelectBasic,
    DemoTreeSelectMultiple,
    DemoTreeSelectFilter,
    DemoTreeSelectOptions,
    DemoTreeSelectLoading,
    DemoTreeSelectPanel,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">树选择 TreeSelect</h1>
      <p class="docs-page__lead">
        树选择用树形结构的数据做单选或多选：展开父节点逐级浏览，点击节点文字选中、勾选复选框多选；
        支持完整回显、自定义字段名、搜索、父子不关联与取值模式、清空、禁用、三种尺寸、加载态与面板插槽。
      </p>

      <docs-demo id="tree-select-basic" title="基础用法" description="data 提供树形数据，value 控制选中值，change 抛出 { value, data, trigger }。">
        <demo-tree-select-basic />
      </docs-demo>

      <docs-demo id="tree-select-multiple" title="多选" description="multiple 打开复选框；treeProps.checkStrictly 父子不关联，valueMode 控制回传值，max / minCollapsedNum 限制数量与标签。">
        <demo-tree-select-multiple />
      </docs-demo>

      <docs-demo id="tree-select-filter" title="搜索" description="filterable 输入关键字只保留命中节点与父级；filter 可替换匹配规则；inputValue 可受控。">
        <demo-tree-select-filter />
      </docs-demo>

      <docs-demo id="tree-select-options" title="更多配置" description="clearable 清空、size 尺寸、disabled 禁用；keys 自定义字段名，valueType=object 返回整个数据项。">
        <demo-tree-select-options />
      </docs-demo>

      <docs-demo id="tree-select-loading" title="加载中" description="loading 为 true 时面板显示 loadingText，切回后恢复树。">
        <demo-tree-select-loading />
      </docs-demo>

      <docs-demo id="tree-select-panel" title="面板插槽" description="用 tTreeSelectPanelTop / tTreeSelectPanelBottom 模板在面板上下插入内容。">
        <demo-tree-select-panel />
      </docs-demo>

      <h2 class="docs-section__title" id="tree-select-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTreeSelect" />
      </div>

      <docs-page-nav current="/tree-select" />
    </div>
  `,
})
export class TreeSelectDocs {}
