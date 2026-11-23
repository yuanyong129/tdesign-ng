import { NgModule } from '@angular/core';

import { TSwiperItem } from './swiper-item.component';
import { TSwiper } from './swiper.component';

@NgModule({
  imports: [TSwiper, TSwiperItem],
  exports: [TSwiper, TSwiperItem],
})
export class TSwiperModule {}
