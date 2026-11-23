import { Component, signal } from '@angular/core';
import { TSwiper, TSwiperItem, type SwiperChangeEvent } from '@tdesign-ng/components';

@Component({
  selector: 'demo-swiper-autoplay',
  imports: [TSwiper, TSwiperItem],
  template: `
    <t-swiper
      [height]="180"
      [interval]="2000"
      [duration]="400"
      [navigation]="{ type: 'dots' }"
      (change)="handleChange($event)"
    >
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #0052d9; color: #fff">自动播放 1</div>
      </t-swiper-item>
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #3f3fd6; color: #fff">自动播放 2</div>
      </t-swiper-item>
      <t-swiper-item>
        <div class="demo-swiper-panel" style="background: #2ba471; color: #fff">自动播放 3</div>
      </t-swiper-item>
    </t-swiper>
    <div style="margin-top: 12px; font: var(--td-font-body-medium); color: var(--td-text-color-secondary)">
      最近一次切换：第 {{ current() + 1 }} 项，来源 {{ source() }}
    </div>
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
export class DemoSwiperAutoplay {
  protected readonly current = signal(0);

  protected readonly source = signal('autoplay');

  protected handleChange(event: SwiperChangeEvent): void {
    this.current.set(event.current);
    this.source.set(event.source);
  }
}
