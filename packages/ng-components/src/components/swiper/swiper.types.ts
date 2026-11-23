import { InjectionToken, type TemplateRef } from '@angular/core';

/** 切换动画。 */
export const SWIPER_ANIMATIONS = ['slide', 'fade'] as const;

export type SwiperAnimation = (typeof SWIPER_ANIMATIONS)[number];

/** 轮播方向。 */
export const SWIPER_DIRECTIONS = ['horizontal', 'vertical'] as const;

export type SwiperDirection = (typeof SWIPER_DIRECTIONS)[number];

/** 轮播类型。 */
export const SWIPER_TYPES = ['default', 'card'] as const;

export type SwiperType = (typeof SWIPER_TYPES)[number];

/** 展开箭头的触发方式。 */
export const SWIPER_SLIDE_BTN_SHOWS = ['always', 'hover', 'never'] as const;

export type SwiperSlideBtnShow = (typeof SWIPER_SLIDE_BTN_SHOWS)[number];

/** 导航点的触发方式。 */
export const SWIPER_TRIGGERS = ['hover', 'click'] as const;

export type SwiperTrigger = (typeof SWIPER_TRIGGERS)[number];

/** 导航器类型。 */
export const SWIPER_NAVIGATION_TYPES = ['dots', 'dots-bar', 'bars', 'fraction'] as const;

export type SwiperNavigationType = (typeof SWIPER_NAVIGATION_TYPES)[number];

/** 导航器位置。 */
export const SWIPER_NAVIGATION_PLACEMENTS = ['inside', 'outside'] as const;

export type SwiperNavigationPlacement = (typeof SWIPER_NAVIGATION_PLACEMENTS)[number];

/** 导航器尺寸。 */
export const SWIPER_NAVIGATION_SIZES = ['small', 'medium', 'large'] as const;

export type SwiperNavigationSize = (typeof SWIPER_NAVIGATION_SIZES)[number];

/** 切换来源。 */
export type SwiperChangeSource = 'autoplay' | 'click' | 'hover';

/** 切换事件的参数。 */
export interface SwiperChangeEvent {
  /** 切换后的索引。 */
  current: number;
  /** 切换来源。 */
  source: SwiperChangeSource;
}

/** 导航器配置。 */
export interface SwiperNavigation {
  /** 导航器位置。 */
  placement?: SwiperNavigationPlacement;
  /** 箭头展示时机。 */
  showSlideBtn?: SwiperSlideBtnShow;
  /** 导航器尺寸。 */
  size?: SwiperNavigationSize;
  /** 导航器类型。 */
  type?: SwiperNavigationType;
}

/** 默认导航器配置，与上游一致。 */
export const SWIPER_NAVIGATION_DEFAULT: SwiperNavigation = {
  placement: 'inside',
  showSlideBtn: 'always',
  size: 'medium',
  type: 'bars',
};

/** 自定义导航器模板的参数。 */
export interface SwiperNavigationContext {
  /** 当前索引。 */
  current: number;
  /** 轮播项总数。 */
  total: number;
}

/** 单个轮播项需要应用的内联样式。 */
export interface SwiperItemVisual {
  /** 类名。 */
  classes: string;
  /** transform 值。 */
  transform: string | null;
  /** opacity 值。 */
  opacity: string | null;
  /** transition 值。 */
  transition: string | null;
  /** z-index 值。 */
  zIndex: string | null;
}

/** 轮播项通过该接口向容器索取自身的视觉状态。 */
export interface SwiperHost {
  /** 计算某一项的视觉状态。 */
  itemVisual(item: unknown): SwiperItemVisual;
}

/** 轮播项注入该 token 以获取容器。 */
export const SWIPER_HOST = new InjectionToken<SwiperHost>('SWIPER_HOST');

/** 判断值是否为模板引用。 */
export function isSwiperTemplateRef<T>(value: unknown): value is TemplateRef<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'createEmbeddedView' in value &&
    typeof (value as { createEmbeddedView?: unknown }).createEmbeddedView === 'function'
  );
}
