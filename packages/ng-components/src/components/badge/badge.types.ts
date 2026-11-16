/** 徽标形状。 */
export const BADGE_SHAPES = ['circle', 'round'] as const;

export type BadgeShape = (typeof BADGE_SHAPES)[number];

/** 徽标尺寸。 */
export const BADGE_SIZES = ['small', 'medium'] as const;

export type BadgeSize = (typeof BADGE_SIZES)[number];
