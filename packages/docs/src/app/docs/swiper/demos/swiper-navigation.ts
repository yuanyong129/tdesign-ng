import { Component, signal } from '@angular/core';
import { TButton, TSwiper, TSwiperItem, type SwiperDirection, type SwiperNavigation } from '@tdesign-ng/components';

@Component({
  selector: 'demo-swiper-navigation',
  imports: [TButton, TSwiper, TSwiperItem],
  template: `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px">
      <t-button
        size="small"
        [variant]="direction() === 'horizontal' ? 'base' : 'outline'"
        (click)="direction.set('horizontal')"
      >
        水平切换
      </t-button>
      <t-button
        size="small"
        [variant]="direction() === 'vertical' ? 'base' : 'outline'"
        (click)="direction.set('vertical')"
      >
        垂直切换
      </t-button>
      <span style="font: var(--td-font-body-medium); color: var(--td-text-color-secondary)">
        点击指示点切换
      </span>
    </div>

    <t-swiper
      [height]="240"
      [direction]="direction()"
      [navigation]="navigation"
      trigger="click"
      [autoplay]="false"
    >
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #0052d9; color: #fff">页面 A</div>
      </t-swiper-item>
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #3f3fd6; color: #fff">页面 B</div>
      </t-swiper-item>
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #2ba471; color: #fff">页面 C</div>
      </t-swiper-item>
    </t-swiper>
  `,
  styles: [
    `
      .demo-swiper-panel {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 600;
      }
    `,
  ],
})
export class DemoSwiperNavigation {
  protected readonly direction = signal<SwiperDirection>('horizontal');

  protected readonly navigation: SwiperNavigation = {
    type: 'dots',
    placement: 'outside',
    showSlideBtn: 'hover',
    size: 'small',
  };
}
