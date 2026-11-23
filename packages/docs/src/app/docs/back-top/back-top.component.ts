import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoBackTopBase } from './demos/back-top-base';
import { DemoBackTopDuration } from './demos/back-top-duration';
import { DemoBackTopTheme } from './demos/back-top-theme';

@Component({
  selector: 'back-top-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoBackTopBase, DemoBackTopTheme, DemoBackTopDuration],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">回到顶部 BackTop</h1>
      <p class="docs-page__lead">滚动到一定距离后出现按钮，点击平滑滚动回容器顶部。</p>

      <docs-demo
        id="back-top-base"
        title="基础用法"
        description="container 指定滚动容器，visibleHeight 控制滚动多远后出现。"
      >
        <demo-back-top-base />
      </docs-demo>

      <docs-demo
        id="back-top-theme"
        title="主题与形状"
        description="theme、shape、size 三个外观维度，配合 offset 摆放多个按钮。"
      >
        <demo-back-top-theme />
      </docs-demo>

      <docs-demo
        id="back-top-duration"
        title="滚动时长"
        description="duration 控制滚动动画时长，content 可以替换默认的图标与文案。"
      >
        <demo-back-top-duration />
      </docs-demo>

      <h2 class="docs-section__title" id="back-top-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TBackTop" />
      </div>

      <docs-page-nav current="/back-top" />
    </article>
  `,
})
export class BackTopDocs {}
