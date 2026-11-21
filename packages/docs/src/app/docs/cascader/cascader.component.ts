import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoCascaderBasic } from './demos/cascader-basic';
import { DemoCascaderFilter } from './demos/cascader-filter';
import { DemoCascaderLazy } from './demos/cascader-lazy';
import { DemoCascaderLevels } from './demos/cascader-levels';
import { DemoCascaderMultiple } from './demos/cascader-multiple';
import { DemoCascaderOptions } from './demos/cascader-options';
import { DemoCascaderSlot } from './demos/cascader-slot';

@Component({
  selector: 'cascader-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoCascaderBasic,
    DemoCascaderLevels,
    DemoCascaderMultiple,
    DemoCascaderFilter,
    DemoCascaderLazy,
    DemoCascaderSlot,
    DemoCascaderOptions,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">级联选择 Cascader</h1>
      <p class="docs-page__lead">
        级联选择用于在树形结构的数据中逐级选择，支持完整路径回显、自定义字段名、清空、禁用、三种尺寸，
        以及多选、父子不关联（checkStrictly）、三种取值模式、搜索、异步加载与自定义面板 / 回显模板。
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

      <docs-demo id="cascader-filter" title="搜索" description="filterable 输入关键字后切换成扁平结果；filter 可替换默认的整路径匹配。">
        <demo-cascader-filter />
      </docs-demo>

      <docs-demo id="cascader-lazy" title="异步加载" description="lazy 默认开启，load 返回 Promise，展开时先显示加载中再渲染子节点。">
        <demo-cascader-lazy />
      </docs-demo>

      <docs-demo id="cascader-slot" title="面板与回显插槽" description="tCascaderPanelTop / tCascaderPanelBottom 自定义面板上下内容，tCascaderValueDisplay 自定义回显。">
        <demo-cascader-slot />
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
