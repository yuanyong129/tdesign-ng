import type { Content } from '../../_utils/content';
import type { FeedbackAttachNode, FeedbackStyle } from '../../_utils/feedback-container';
export type MessageContent = Content;
export type MessageAttachNode = FeedbackAttachNode;
export type MessageStyle = FeedbackStyle;
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
  event?: MouseEvent | KeyboardEvent;
}

/** 创建一条消息的配置。 */
export interface MessageOptions {
  /** 挂载元素、选择器或函数；无效目标回退 body，仅创建时解析 */
  attach?: MessageAttachNode;
  /** 每条消息的样式；长度需 CSS 单位，数值用于 opacity 等无单位属性 */
  style?: MessageStyle;
  /** 消息文字 */
  content?: Content;
  /** 主题，默认 info */
  theme?: MessageTheme;
  /** 自动关闭的毫秒数，0 表示不自动关闭 */
  duration?: number;
  /** 是否显示图标 */
  icon?: boolean | Content;
  /** 是否显示关闭按钮 */
  closeBtn?: boolean | Content;
  /** 点击关闭时调用；程序关闭不调用 */
  onCloseBtnClick?: (context: { e: MouseEvent | KeyboardEvent }) => void;
  /** 自动计时结束时调用 */
  onDurationEnd?: () => void;
  /** 关闭时调用；程序关闭的 context 为 undefined */
  onClose?: (context?: MessageCloseEvent) => void;
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
  content: Content;
  theme: MessageTheme;
  duration: number;
  icon: boolean | Content;
  closeBtn: boolean | Content;
}
