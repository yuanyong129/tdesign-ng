import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDropdownBase } from './demos/dropdown-base';
import { DemoDropdownDisabled } from './demos/dropdown-disabled';
import { DemoDropdownSplit } from './demos/dropdown-split';

@Component({
  selector: 'dropdown-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoDropdownBase, DemoDropdownSplit, DemoDropdownDisabled],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">下拉菜单 Dropdown</h1>
      <p class="docs-page__lead">
        点击或悬停触发器展开的菜单，用于收纳一组操作。菜单项支持图标、禁用、分割线、主题与多级子菜单，选项变化通过 options 传入。
        触发器需要一层有盒子的元素（示例里的 <code>&lt;span&gt;</code>），因为按钮组件的宿主是
        <code>display: contents</code>，不能直接作为定位锚点。
      </p>

      <docs-demo
        id="dropdown-base"
        title="基础用法"
        description="通过 options 描述菜单项，配置了 children 的项会展开为子菜单；click 事件回传被点击的原始选项与原生事件。"
      >
        <demo-dropdown-base />
      </docs-demo>

      <docs-demo
        id="dropdown-split"
        title="分裂按钮"
        description="把主操作与「更多」拆成两个按钮，下拉菜单只承载次要操作，避免误触主流程。"
      >
        <demo-dropdown-split />
      </docs-demo>

      <docs-demo
        id="dropdown-disabled"
        title="禁用状态"
        description="选项级 disabled 让单项不可点击，组件级 disabled 让整个菜单无法展开。"
      >
        <demo-dropdown-disabled />
      </docs-demo>

      <h2 class="docs-section__title" id="dropdown-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TDropdown" />
      </div>

      <h2 class="docs-section__title" id="dropdown-item-api">DropdownItem 菜单项</h2>
      <div class="api-table__scroll">
        <api-table component="TDropdownItem" />
      </div>

      <docs-page-nav current="/dropdown" />
    </article>
  `,
})
export class DropdownDocs {}
