import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoPopconfirmAsync } from './demos/popconfirm-async';
import { DemoPopconfirmBase } from './demos/popconfirm-base';
import { DemoPopconfirmTheme } from './demos/popconfirm-theme';

@Component({
  selector: 'popconfirm-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoPopconfirmBase, DemoPopconfirmTheme, DemoPopconfirmAsync],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">气泡确认框 Popconfirm</h1>
      <p class="docs-page__lead">
        点击触发器后弹出气泡浮层，用于对轻量操作做二次确认。浮层定位、触发方式与关闭行为复用 Popup 组件，主题与按钮文案可直接配置。
        触发器需要一层有盒子的元素（示例里的 <code>&lt;span&gt;</code>），因为按钮组件的宿主是
        <code>display: contents</code>，不能直接作为定位锚点。
      </p>

      <docs-demo
        id="popconfirm-base"
        title="基础用法"
        description="点击触发器弹出气泡确认框，确认与取消分别派发 confirm、cancel 事件，点击后自动收起浮层。"
      >
        <demo-popconfirm-base />
      </docs-demo>

      <docs-demo
        id="popconfirm-theme"
        title="不同主题"
        description="theme 提供 default、warning、danger 三种主题，图标形态与确认按钮配色随之变化。"
      >
        <demo-popconfirm-theme />
      </docs-demo>

      <docs-demo
        id="popconfirm-async"
        title="异步关闭"
        description="配合 visible 与 visibleChange 受控使用：确认按钮进入 loading 状态，异步操作完成后再主动关闭浮层。"
      >
        <demo-popconfirm-async />
      </docs-demo>

      <h2 class="docs-section__title" id="popconfirm-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TPopconfirm" />
      </div>

      <docs-page-nav current="/popconfirm" />
    </article>
  `,
})
export class PopconfirmDocs {}
