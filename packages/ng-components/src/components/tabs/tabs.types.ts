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
