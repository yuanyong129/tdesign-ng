/** 对话框主题。 */
export const DIALOG_THEMES = ['default', 'info', 'warning', 'danger', 'success'] as const;

export type DialogTheme = (typeof DIALOG_THEMES)[number];

/** 对话框垂直位置。 */
export const DIALOG_PLACEMENTS = ['top', 'center'] as const;

export type DialogPlacement = (typeof DIALOG_PLACEMENTS)[number];

/** 对话框展示形态。 */
export const DIALOG_MODES = ['modal', 'modeless', 'normal', 'full-screen'] as const;

export type DialogMode = (typeof DIALOG_MODES)[number];

/** 关闭来源。 */
export type DialogCloseTrigger = 'esc' | 'close-btn' | 'cancel' | 'overlay';

export interface DialogCloseEvent {
  /** 触发关闭的来源 */
  trigger: DialogCloseTrigger;
  /** 原始事件 */
  event?: MouseEvent | KeyboardEvent;
}
