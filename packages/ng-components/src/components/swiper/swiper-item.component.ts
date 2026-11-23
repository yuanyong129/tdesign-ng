import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';

import { SWIPER_HOST, type SwiperHost, type SwiperItemVisual } from './swiper.types';

const BASE_CLASS = 't-swiper__container__item';

const DEFAULT_VISUAL: SwiperItemVisual = {
  classes: BASE_CLASS,
  transform: null,
  opacity: null,
  transition: null,
  zIndex: null,
};

@Component({
  selector: 't-swiper-item',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'visual().classes',
    '[style.transform]': 'visual().transform',
    '[style.opacity]': 'visual().opacity',
    '[style.transition]': 'visual().transition',
    '[style.zIndex]': 'visual().zIndex',
  },
})
export class TSwiperItem {
  private readonly swiper = inject<SwiperHost | null>(SWIPER_HOST, { optional: true });

  protected readonly visual = computed<SwiperItemVisual>(() => {
    const swiper = this.swiper;
    if (!swiper) return DEFAULT_VISUAL;
    return swiper.itemVisual(this);
  });
}
