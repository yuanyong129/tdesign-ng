import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoAnchorBase } from './demos/anchor-base';
import { DemoAnchorContainer } from './demos/anchor-container';
import { DemoAnchorOffset } from './demos/anchor-offset';

@Component({
  selector: 'anchor-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoAnchorBase, DemoAnchorContainer, DemoAnchorOffset],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">锚点 Anchor</h1>
      <p class="docs-page__lead">
        锚点用于在长内容里快速定位，把一组 <code>t-anchor-item</code> 与页面上的元素 id 关联起来：滚动时高亮当前区块，点击时平滑滚到目标位置。
        内容区滚动时把 <code>container</code> 指向滚动容器，需要固定住锚点时用 <code>affixProps</code>。
      </p>

      <docs-demo
        id="anchor-base"
        title="基础用法"
        description="每一项的 href 指向页面元素的 id（形如 #basic），滚动容器由 container 指定；滚动时活性项会自动切换，同时更新左侧的游标线。"
      >
        <demo-anchor-base />
      </docs-demo>

      <docs-demo
        id="anchor-offset"
        title="偏移量"
        description="targetOffset 同时作用于「判定活性」与「点击滚动」，适合配合吸顶标题使用，让高亮切换发生在标题贴住容器顶部之后。"
      >
        <demo-anchor-offset />
      </docs-demo>

      <docs-demo
        id="anchor-container"
        title="自定义容器与吸顶"
        description="滚动容器不是 window 时用 container 指定（支持 CSS 选择器、元素或返回它们的函数）；affixProps 透传给内部的固钉组件，让锚点在一个滚动容器里吸顶。"
      >
        <demo-anchor-container />
      </docs-demo>

      <h2 class="docs-section__title" id="anchor-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TAnchor" />
      </div>

      <h2 class="docs-section__title" id="anchor-item-api">AnchorItem 子项</h2>
      <div class="api-table__scroll">
        <api-table component="TAnchorItem" />
      </div>

      <docs-page-nav current="/anchor" />
    </article>
  `,
})
export class AnchorDocs {}
