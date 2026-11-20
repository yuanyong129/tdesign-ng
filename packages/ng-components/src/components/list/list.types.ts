/** @zh 列表布局 @en List layout */
export const LIST_LAYOUTS = ['horizontal', 'vertical'] as const;
export type ListLayout = (typeof LIST_LAYOUTS)[number];

/** @zh 列表尺寸 @en List size */
export const LIST_SIZES = ['small', 'medium', 'large'] as const;
export type ListSize = (typeof LIST_SIZES)[number];

/** @zh 异步加载状态 @en Async loading state */
export const LIST_ASYNC_LOADINGS = ['loading', 'load-more'] as const;
export type ListAsyncLoading = (typeof LIST_ASYNC_LOADINGS)[number];

/** @zh 列表滚动事件 @en List scroll event */
export interface ListScrollEvent {
  /** @zh 原生滚动事件 @en Native scroll event */
  originalEvent: Event;
  /** @zh 距顶部的滚动距离（px） @en Scroll distance from top in px */
  scrollTop: number;
  /** @zh 距底部的滚动距离（px） @en Scroll distance from bottom in px */
  scrollBottom: number;
}

/** @zh 加载更多事件 @en Load more event */
export interface ListLoadMoreEvent {
  /** @zh 原生点击事件 @en Native click event */
  originalEvent: MouseEvent;
}
