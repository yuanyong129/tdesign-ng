import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoLinkBase } from './demos/link-base';
import { DemoLinkDisabled } from './demos/link-disabled';
import { DemoLinkDownload } from './demos/link-download';
import { DemoLinkIcon } from './demos/link-icon';
import { DemoLinkSize } from './demos/link-size';
import { DemoLinkUnderline } from './demos/link-underline';

@Component({
  selector: 'link-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoLinkBase,
    DemoLinkDisabled,
    DemoLinkDownload,
    DemoLinkIcon,
    DemoLinkSize,
    DemoLinkUnderline,
  ],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">链接 Link</h1>
      <p class="docs-page__lead">链接用于跳转到其他页面或悬浮显示提示信息。</p>

      <docs-demo id="link-base" title="基础链接" description="通过 theme 设置不同的语义色。">
        <demo-link-base />
      </docs-demo>

      <docs-demo
        id="link-underline"
        title="下划线"
        description="underline 控制是否常驻下划线，hover 控制悬浮态表现。"
      >
        <demo-link-underline />
      </docs-demo>

      <docs-demo
        id="link-icon"
        title="带图标的链接"
        description="前后缀图标分别用 tLinkPrefixIcon、tLinkSuffixIcon 标记，并配合 hasPrefixIcon、hasSuffixIcon 打开。"
      >
        <demo-link-icon />
      </docs-demo>

      <docs-demo id="link-size" title="链接尺寸" description="尺寸有 small、medium（默认）、large 三档。">
        <demo-link-size />
      </docs-demo>

      <docs-demo id="link-disabled" title="禁用状态" description="设置 disabled 后链接不可点击，也不再响应悬浮态。">
        <demo-link-disabled />
      </docs-demo>

      <docs-demo id="link-download" title="下载链接" description="设置 download 后点击会下载 href 指向的资源。">
        <demo-link-download />
      </docs-demo>

      <h2 class="docs-section__title" id="link-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TLink" />
      </div>

      <docs-page-nav current="/link" />
    </article>
  `,
})
export class LinkDocs {}
