/**
 * 响应式断点工具
 *
 * 断点数值与 tdesign-common 的 `@screen-*-min` 保持一致（见 `_variables.less`），
 * 这样基于断点的内联样式（例如栅格 gutter）与样式表里的媒体查询才会同频切换。
 */

import { Injectable, computed, signal } from '@angular/core';

/** 断点名称，从小到大。 */
export const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

/** 每个断点生效的最小视口宽度（px）。 */
export const BREAKPOINT_MIN_WIDTH: Readonly<Record<Breakpoint, number>> = {
  xs: 320,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1400,
  xxl: 1880,
};

/** 服务端渲染或取不到视口宽度时使用的兜底宽度（最大断点）。 */
export const FALLBACK_VIEWPORT_WIDTH = 1880;

/** 视口宽度命中的断点（大于等于该断点最小宽度的最后一个）。 */
export function matchBreakpoint(width: number): Breakpoint {
  let matched: Breakpoint = 'xs';
  for (const breakpoint of BREAKPOINTS) {
    if (width >= BREAKPOINT_MIN_WIDTH[breakpoint]) {
      matched = breakpoint;
    }
  }
  return matched;
}

/**
 * 视口宽度服务。
 *
 * 组件需要按断点计算内联样式时注入它，读取 `breakpoint()` 会随窗口缩放自动更新。
 */
@Injectable({ providedIn: 'root' })
export class TViewportService {
  private readonly widthSignal = signal(
    typeof window === 'undefined' ? FALLBACK_VIEWPORT_WIDTH : window.innerWidth,
  );

  /** 当前视口宽度（px）。 */
  readonly width = this.widthSignal.asReadonly();

  /** 当前命中的断点。 */
  readonly breakpoint = computed(() => matchBreakpoint(this.widthSignal()));

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener(
      'resize',
      () => this.widthSignal.set(window.innerWidth),
      { passive: true },
    );
  }
}
