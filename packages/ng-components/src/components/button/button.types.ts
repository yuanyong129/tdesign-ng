/**
 * 按钮的视觉变体，与上游 `variant` 一一对应。
 * @values base outline dashed text
 */
export const BUTTON_VARIANTS = ['base', 'outline', 'dashed', 'text'] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/**
 * 按钮的主题色，与上游 `theme` 一一对应。
 * @values default primary danger warning success
 */
export const BUTTON_THEMES = ['default', 'primary', 'danger', 'warning', 'success'] as const;

export type ButtonTheme = (typeof BUTTON_THEMES)[number];

/**
 * 按钮形状。`rectangle` 为默认形状，不生成额外类名。
 * @values rectangle square round circle
 */
export const BUTTON_SHAPES = ['rectangle', 'square', 'round', 'circle'] as const;

export type ButtonShape = (typeof BUTTON_SHAPES)[number];

/**
 * 按钮尺寸。`medium` 为默认尺寸，不生成额外类名。
 * @values small medium large
 */
export const BUTTON_SIZES = ['small', 'medium', 'large'] as const;

export type ButtonSize = (typeof BUTTON_SIZES)[number];

/**
 * 按钮渲染的标签。
 * @values button a div
 */
export const BUTTON_TAGS = ['button', 'a', 'div'] as const;

export type ButtonTag = (typeof BUTTON_TAGS)[number];

/**
 * 按钮的 button 元素类型，对应 HTML 的 `type` 属性。
 * @values button submit reset
 */
export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const;

export type ButtonType = (typeof BUTTON_TYPES)[number];
