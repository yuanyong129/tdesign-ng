import type { Content } from '../../_utils/content';

/** 数据驱动面板；value 应保持唯一且稳定，缺省时使用下标。 */
export interface TabsListItem {
  value?: TabValue;
  label?: Content;
  panel?: Content;
  /** 默认内容，优先于 panel；模板在面板的生命周期内创建。 */
  default?: Content;
  disabled?: boolean;
  removable?: boolean;
  draggable?: boolean;
  lazy?: boolean;
  destroyOnHide?: boolean;
  onRemove?: (context: { value: TabValue; e: MouseEvent | KeyboardEvent }) => void;
}

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
  e: MouseEvent | KeyboardEvent;
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
