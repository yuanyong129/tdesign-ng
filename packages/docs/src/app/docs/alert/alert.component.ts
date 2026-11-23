import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoAlertClose } from './demos/alert-close';
import { DemoAlertTheme } from './demos/alert-theme';
import { DemoAlertTitle } from './demos/alert-title';

@Component({
  selector: 'alert-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoAlertClose, DemoAlertTheme, DemoAlertTitle],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">警告提示 Alert</h1>
      <p class="docs-page__lead">
        警告提示用于在页面中展示需要用户关注的信息，支持四种主题、标题与操作区，也可以关闭。
      </p>

      <docs-demo
        id="alert-theme"
        title="主题"
        description="theme 可选 success、info、warning、error，默认 info，图标随主题变化。"
      >
        <demo-alert-theme />
      </docs-demo>

      <docs-demo
        id="alert-title"
        title="带标题与操作区"
        description="title 显示标题，operation 显示右侧操作区，maxLine 控制正文最多显示的行数（0 表示不限）。"
      >
        <demo-alert-title />
      </docs-demo>

      <docs-demo
        id="alert-close"
        title="可关闭"
        description="close 为 true 时显示默认关闭图标，传字符串时作为按钮文案；closeBtn 优先于 close。点击后先淡出，动画结束触发 closed。"
      >
        <demo-alert-close />
      </docs-demo>

      <h2 class="docs-section__title" id="alert-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TAlert" />
      </div>

      <docs-page-nav current="/alert" />
    </article>
  `,
})
export class AlertDocs {}
