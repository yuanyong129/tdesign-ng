import { Component, signal } from '@angular/core';
import { TSwiper, TSwiperItem } from '@tdesign-ng/components';

@Component({
  selector: 'demo-swiper-base',
  imports: [TSwiper, TSwiperItem],
  template: `
    <t-swiper [height]="180" (currentChange)="current.set($event)">
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #0052d9; color: #fff">1</div>
      </t-swiper-item>
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #3f3fd6; color: #fff">2</div>
      </t-swiper-item>
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #2ba471; color: #fff">3</div>
      </t-swiper-item>
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #e37318; color: #fff">4</div>
      </t-swiper-item>
    </t-swiper>
    <div style="margin-top: 12px; font: var(--td-font-body-medium); color: var(--td-text-color-secondary)">
      当前第 {{ current() + 1 }} 项 / 共 4 项
    </div>
  `,
  styles: [
    `
      .demo-swiper-panel {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: 600;
      }
    `,
  ],
})
export class DemoSwiperBase {
  protected readonly current = signal(0);
}
