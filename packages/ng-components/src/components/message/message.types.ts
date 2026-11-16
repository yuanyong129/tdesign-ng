/** 消息主题。 */
export const MESSAGE_THEMES = ['info', 'success', 'warning', 'error', 'question', 'loading'] as const;

export type MessageTheme = (typeof MESSAGE_THEMES)[number];

/** 消息出现的位置。 */
export const MESSAGE_PLACEMENTS = [
  'center',
  'top',
  'left',
  'right',
  'bottom',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
] as const;

export type MessagePlacement = (typeof MESSAGE_PLACEMENTS)[number];

/** 关闭来源。 */
export type MessageCloseTrigger = 'close-click' | 'duration-end';

export interface MessageCloseEvent {
  /** 触发关闭的来源 */
  trigger: MessageCloseTrigger;
  /** 原始事件（只有点击关闭时才有） */
  event?: MouseEvent;
}

/** 创建一条消息的配置。 */
export interface MessageOptions {
  /** 消息文字 */
  content?: string;
  /** 主题，默认 info */
  theme?: MessageTheme;
  /** 自动关闭的毫秒数，0 表示不自动关闭 */
  duration?: number;
  /** 是否显示图标 */
  icon?: boolean;
  /** 是否显示关闭按钮 */
  closeBtn?: boolean;
  /** 附加类名 */
  className?: string;
  /** 出现位置，默认 top */
  placement?: MessagePlacement;
  /** 相对默认位置的偏移，[x, y] */
  offset?: Array<string | number>;
  /** 层级 */
  zIndex?: number;
}

/** 消息实例，用于手动关闭。 */
export interface MessageInstance {
  /** 关闭这条消息 */
  close(): void;
}

/** 消息组件的输入，供服务式调用时逐项赋值。 */
export interface MessageProps {
  content: string;
  theme: MessageTheme;
  duration: number;
  icon: boolean;
  closeBtn: boolean;
}
