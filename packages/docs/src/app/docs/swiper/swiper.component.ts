import { Component } from '@angular/core';

import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';

import { DemoSwiperAutoplay } from './demos/swiper-autoplay';
import { DemoSwiperBase } from './demos/swiper-base';
import { DemoSwiperNavigation } from './demos/swiper-navigation';

@Component({
  selector: 'swiper-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoSwiperBase, DemoSwiperAutoplay, DemoSwiperNavigation],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">轮播 Swiper</h1>
      <p class="docs-page__lead">
        轮播用于在有限空间内循环展示多张内容，支持滑动与淡入淡出动画、自动播放、卡片模式以及多种导航器形态。
      </p>

      <docs-demo
        id="swiper-base"
        title="基础轮播"
        description="把内容放进 t-swiper-item 即可轮播，左右箭头与底部条状导航器都由 navigation 控制。"
      >
        <demo-swiper-base />
      </docs-demo>

      <docs-demo
        id="swiper-autoplay"
        title="自动播放"
        description="autoplay 默认开启，通过 interval 控制播放间隔、duration 控制动画时长，change 事件会返回切换来源。"
      >
        <demo-swiper-autoplay />
      </docs-demo>

      <docs-demo
        id="swiper-navigation"
        title="指示点与切换方向"
        description="navigation 可切换 dots、dots-bar、bars、fraction 等导航器形态，direction 控制水平或垂直切换方向。"
      >
        <demo-swiper-navigation />
      </docs-demo>

      <h2 class="docs-section__title" id="swiper-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSwiper" />
      </div>

      <docs-page-nav current="/swiper" />
    </article>
  `,
})
export class SwiperDocs {}
