/** 选项卡的值 */
export type TabValue = string | number;

/** 选项卡主题 */
export const TABS_THEMES = ['normal', 'card'] as const;

export type TabsTheme = (typeof TABS_THEMES)[number];

/** 选项卡位置 */
export const TABS_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const;

export type TabsPlacement = (typeof TABS_PLACEMENTS)[number];

/** 选项卡尺寸 */
export const TABS_SIZES = ['medium', 'large'] as const;

export type TabsSize = (typeof TABS_SIZES)[number];

/** 激活选项卡滚入可视区时的对齐方式 */
export const TABS_SCROLL_POSITIONS = ['auto', 'start', 'center', 'end'] as const;

export type TabsScrollPosition = (typeof TABS_SCROLL_POSITIONS)[number];

/** 新增页签事件 */
export interface TabsAddEvent {
  /** 触发事件的鼠标事件 */
  e: MouseEvent;
}

/** 关闭页签事件 */
export interface TabsRemoveEvent {
  /** 被关闭页签的值 */
  value: TabValue;
  /** 被关闭页签的下标 */
  index: number;
  /** 触发事件的鼠标事件 */
  e: MouseEvent;
}

/** 拖拽排序事件 */
export interface TabsDragSortEvent {
  /** 被拖拽页签的下标 */
  currentIndex: number;
  /** 被拖拽页签的值 */
  current: TabValue;
  /** 拖拽落入位置的下标 */
  targetIndex: number;
  /** 拖拽落入位置的值 */
  target: TabValue;
}
