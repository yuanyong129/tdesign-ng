/** 通知主题。 */
export const NOTIFICATION_THEMES = ['info', 'success', 'warning', 'error'] as const;

export type NotificationTheme = (typeof NOTIFICATION_THEMES)[number];

/** 通知出现的位置。 */
export const NOTIFICATION_PLACEMENTS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export type NotificationPlacement = (typeof NOTIFICATION_PLACEMENTS)[number];

export type NotificationCloseTrigger = 'close-click' | 'duration-end';

export interface NotificationCloseEvent {
  trigger: NotificationCloseTrigger;
  event?: MouseEvent;
}

/** 创建一条通知的配置。 */
export interface NotificationOptions {
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 底部补充内容 */
  footer?: string;
  /** 主题，默认 info */
  theme?: NotificationTheme;
  /** 自动关闭的毫秒数，0 表示不自动关闭 */
  duration?: number;
  /** 是否显示图标 */
  icon?: boolean;
  /** 是否显示关闭按钮 */
  closeBtn?: boolean;
  /** 附加类名 */
  className?: string;
  /** 出现位置，默认 top-right */
  placement?: NotificationPlacement;
  /** 相对默认位置的偏移，[x, y] */
  offset?: Array<string | number>;
  /** 层级 */
  zIndex?: number;
}

/** 通知实例，用于手动关闭。 */
export interface NotificationInstance {
  close(): void;
}
