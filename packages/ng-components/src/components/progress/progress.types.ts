/**
 * 进度条主题。
 */
export const PROGRESS_THEMES = ['line', 'plump', 'circle'] as const;

export type ProgressTheme = (typeof PROGRESS_THEMES)[number];

/**
 * 进度条状态。
 */
export const PROGRESS_STATUSES = ['success', 'error', 'warning', 'active'] as const;

export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];

/**
 * 环形进度条的内置尺寸与对应直径（px）。
 */
export const PROGRESS_CIRCLE_SIZE_PX = {
  small: 72,
  medium: 112,
  large: 160,
} as const;
