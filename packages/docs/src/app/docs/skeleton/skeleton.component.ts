import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoSkeletonLoading } from './demos/skeleton-loading';
import { DemoSkeletonRowCol } from './demos/skeleton-row-col';
import { DemoSkeletonTheme } from './demos/skeleton-theme';

@Component({
  selector: 'skeleton-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoSkeletonLoading, DemoSkeletonRowCol, DemoSkeletonTheme],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">骨架屏 Skeleton</h1>
      <p class="docs-page__lead">
        骨架屏用于在真实数据加载前展示页面的大致结构，减少空白屏带来的等待感；加载完成后通过内容投影展示真实内容。
      </p>

      <docs-demo
        id="skeleton-theme"
        title="主题"
        description="通过 theme 选择预设结构：text、avatar、paragraph、avatar-text、tab、article，均以 tdesign-common 的骨架屏样式渲染。"
      >
        <demo-skeleton-theme />
      </docs-demo>

      <docs-demo
        id="skeleton-row-col"
        title="自定义行列"
        description="通过 rowCol 自定义骨架结构：数字表示该行的等分列数，对象表示单列，数组表示一行多列。"
      >
        <demo-skeleton-row-col />
      </docs-demo>

      <docs-demo
        id="skeleton-loading"
        title="加载状态与延迟"
        description="loading 为 false 时渲染投影的真实内容；delay 大于 0 时，延迟期间先展示内容，到期后才切换为骨架屏。"
      >
        <demo-skeleton-loading />
      </docs-demo>

      <h2 class="docs-section__title" id="skeleton-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSkeleton" />
      </div>

      <docs-page-nav current="/skeleton" />
    </article>
  `,
})
export class SkeletonDocs {}
