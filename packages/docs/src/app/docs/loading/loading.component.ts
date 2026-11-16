import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoLoadingBasic } from './demos/loading-basic';
import { DemoLoadingFullscreen } from './demos/loading-fullscreen';

@Component({
  selector: 'loading-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoLoadingBasic, DemoLoadingFullscreen],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">加载 Loading</h1>
      <p class="docs-page__lead">
        加载用于表示正在进行的异步操作：行内用 &lt;t-loading&gt; 组件，全屏用 TLoadingService 以服务方式调用。
      </p>

      <docs-demo id="loading-basic" title="基础用法" description="[loading] 控制显隐，text 显示提示文字。">
        <demo-loading-basic />
      </docs-demo>

      <docs-demo id="loading-fullscreen" title="全屏加载" description="服务式调用会挂到 body 并锁住背景滚动，支持 delay。">
        <demo-loading-fullscreen />
      </docs-demo>

      <h2 class="docs-section__title" id="loading-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TLoading" />
      </div>

      <docs-page-nav current="/loading" />
    </div>
  `,
})
export class LoadingDocs {}
