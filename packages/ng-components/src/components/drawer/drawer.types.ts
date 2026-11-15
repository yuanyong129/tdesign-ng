/** 抽屉出现的方向。 */
export const DRAWER_PLACEMENTS = ['left', 'right', 'top', 'bottom'] as const;

export type DrawerPlacement = (typeof DRAWER_PLACEMENTS)[number];

/** 抽屉与页面的关系。 */
export const DRAWER_MODES = ['overlay', 'push'] as const;

export type DrawerMode = (typeof DRAWER_MODES)[number];

/** 关闭来源。 */
export type DrawerCloseTrigger = 'esc' | 'close-btn' | 'cancel' | 'overlay';

export interface DrawerCloseEvent {
  /** 触发关闭的来源 */
  trigger: DrawerCloseTrigger;
  /** 原始事件 */
  event?: MouseEvent | KeyboardEvent;
}
