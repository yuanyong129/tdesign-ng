import type { Content } from '../../_utils/content';
import type { FeedbackAttachNode, FeedbackStyle } from '../../_utils/feedback-container';
export type NotificationContent = Content;
export type NotificationAttachNode = FeedbackAttachNode;
export type NotificationStyle = FeedbackStyle | string;
/** 通知主题。 */
export const NOTIFICATION_THEMES = ['info', 'success', 'warning', 'error'] as const;

export type NotificationTheme = (typeof NOTIFICATION_THEMES)[number];

/** 通知出现的位置。 */
export const NOTIFICATION_PLACEMENTS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export type NotificationPlacement = (typeof NOTIFICATION_PLACEMENTS)[number];

export type NotificationCloseTrigger = 'close-click' | 'duration-end';

export interface NotificationCloseEvent {
  trigger: NotificationCloseTrigger;
  event?: MouseEvent | KeyboardEvent;
}

/** 创建一条通知的配置。 */
export interface NotificationOptions {
  /** 挂载元素、选择器或函数；无效目标回退 body，仅创建时解析 */
  attach?: NotificationAttachNode;
  /** 每条通知的样式；支持 CSS 文本或对象，长度需 CSS 单位 */
  style?: NotificationStyle;
  /** 标题 */
  title?: Content;
  /** 内容 */
  content?: Content;
  /** 底部补充内容 */
  footer?: Content;
  /** 主题，默认 info */
  theme?: NotificationTheme;
  /** 自动关闭的毫秒数，0 表示不自动关闭 */
  duration?: number;
  /** 是否显示图标 */
  icon?: boolean | Content;
  /** 是否显示关闭按钮 */
  closeBtn?: boolean | Content;
  onCloseBtnClick?: (context: { e: MouseEvent | KeyboardEvent }) => void;
  onDurationEnd?: () => void;
  onClose?: () => void;
  /** 附加类名 */
  className?: string;
  /** 出现位置，默认 top-right */
  placement?: NotificationPlacement;
  /** 容器相对 placement 对应边缘的距离，[x, y]，数字按像素处理 */
  offset?: Array<string | number>;
  /** 层级 */
  zIndex?: number;
}

/** 通知实例，用于手动关闭。 */
export interface NotificationInstance {
  close(): void;
}
