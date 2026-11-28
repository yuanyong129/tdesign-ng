import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoConfigProviderBase } from './demos/config-provider-base';

@Component({
  selector: 'config-provider-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoConfigProviderBase],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">全局特性配置</h1>
      <p class="docs-page__lead">
        全局配置用于批量修改组件内的文案与行为，包裹在组件树外层即可对整个子树生效。
      </p>

      <docs-demo
        id="config-provider-base"
        title="基础用法"
        description="globalConfig 支持按组件分组的配置项；目前二维码的过期、刷新、已扫描文案已经接入。"
      >
        <demo-config-provider-base />
      </docs-demo>

      <h2 class="docs-section__title" id="config-provider-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TConfigProvider" />
      </div>

      <docs-page-nav current="/config-provider" />
    </article>
  `,
})
export class ConfigProviderDocs {}
