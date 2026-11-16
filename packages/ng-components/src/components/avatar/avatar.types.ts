/** 头像形状。 */
export const AVATAR_SHAPES = ['circle', 'round', 'square'] as const;

export type AvatarShape = (typeof AVATAR_SHAPES)[number];

/** 头像尺寸。 */
export const AVATAR_SIZES = ['small', 'medium', 'large'] as const;

export type AvatarSize = (typeof AVATAR_SIZES)[number];

/** 头像组的层叠方向。 */
export const AVATAR_CASCADINGS = ['left-up', 'right-up'] as const;

export type AvatarCascading = (typeof AVATAR_CASCADINGS)[number];
