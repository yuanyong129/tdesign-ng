import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoCheckboxBasic } from './demos/checkbox-basic';
import { DemoCheckboxCheckAll } from './demos/checkbox-check-all';
import { DemoCheckboxGroup } from './demos/checkbox-group';
import { DemoCheckboxMax } from './demos/checkbox-max';
import { DemoCheckboxOptions } from './demos/checkbox-options';
import { DemoCheckboxState } from './demos/checkbox-state';

@Component({
  selector: 'checkbox-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoCheckboxBasic,
    DemoCheckboxGroup,
    DemoCheckboxOptions,
    DemoCheckboxMax,
    DemoCheckboxCheckAll,
    DemoCheckboxState,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">多选框 Checkbox</h1>
      <p class="docs-page__lead">
        多选框用于在一组可选项中选择任意多个，配合 t-checkbox-group 使用可以整组取值。
      </p>

      <docs-demo id="checkbox-basic" title="基础用法" description="单独使用时通过 [(checked)] 双向绑定。">
        <demo-checkbox-basic />
      </docs-demo>

      <docs-demo id="checkbox-group" title="多选框组" description="用内容投影声明子项，整组用 [(value)] 绑定数组。">
        <demo-checkbox-group />
      </docs-demo>

      <docs-demo id="checkbox-options" title="选项配置" description="也可以用 options 传入选项数组，支持单独禁用某一项。">
        <demo-checkbox-options />
      </docs-demo>

      <docs-demo id="checkbox-max" title="限制最多可选" description="max 限制可选中个数，超出后点击无效。">
        <demo-checkbox-max />
      </docs-demo>

      <docs-demo id="checkbox-check-all" title="全选" description="在组内放一个 [checkAll]=&quot;true&quot; 的复选框，即可切换全选/全不选，并自动显示半选状态。">
        <demo-checkbox-check-all />
      </docs-demo>

      <docs-demo id="checkbox-state" title="禁用、只读与半选" description="disabled 不可交互，readonly 只读，indeterminate 显示半选图标。">
        <demo-checkbox-state />
      </docs-demo>

      <h2 class="docs-section__title" id="checkbox-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TCheckbox" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TCheckboxGroup" />
      </div>

      <docs-page-nav current="/checkbox" />
    </div>
  `,
})
export class CheckboxDocs {}
