import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoCascaderBasic } from './demos/cascader-basic';
import { DemoCascaderLevels } from './demos/cascader-levels';
import { DemoCascaderMultiple } from './demos/cascader-multiple';
import { DemoCascaderOptions } from './demos/cascader-options';

@Component({
  selector: 'cascader-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoCascaderBasic,
    DemoCascaderLevels,
    DemoCascaderMultiple,
    DemoCascaderOptions,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">级联选择 Cascader</h1>
      <p class="docs-page__lead">
        级联选择用于在树形结构的数据中逐级选择，支持完整路径回显、自定义字段名、清空、禁用、三种尺寸，
        以及多选、父子不关联（checkStrictly）与三种取值模式。
      </p>

      <docs-demo id="cascader-basic" title="基础用法" description="options 提供树形数据，点击逐级展开，选中叶子节点后回填路径，change 抛出 { value, source, option }。">
        <demo-cascader-basic />
      </docs-demo>

      <docs-demo id="cascader-levels" title="回显层级" description="showAllLevels 为 true（默认）显示完整路径，为 false 只显示最后一级。">
        <demo-cascader-levels />
      </docs-demo>

      <docs-demo id="cascader-multiple" title="多选" description="multiple 打开复选框面板；checkStrictly 让父子节点不关联；valueMode 控制回传值是叶子、父优先还是全部。">
        <demo-cascader-multiple />
      </docs-demo>

      <docs-demo id="cascader-options" title="更多配置" description="keys 自定义 label / value / children 字段名，size 控制尺寸，disabled 禁用。">
        <demo-cascader-options />
      </docs-demo>

      <h2 class="docs-section__title" id="cascader-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TCascader" />
      </div>

      <docs-page-nav current="/cascader" />
    </div>
  `,
})
export class CascaderDocs {}
