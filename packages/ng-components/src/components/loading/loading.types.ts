import type { Content } from '../../_utils/content';

export type LoadingContent = Content;
export type LoadingAttachNode = string | HTMLElement | null | undefined | (() => string | HTMLElement | null | undefined);
/** 服务专属扩展；复合组件 LoadingOptions 保持已接入字段白名单。 */
export interface LoadingServiceOptions extends LoadingOptions {
  attach?: LoadingAttachNode;
  content?: LoadingContent;
  indicator?: boolean | LoadingContent;
}

/** 加载图标尺寸。 */
export const LOADING_SIZES = ['small', 'medium', 'large'] as const;

export type LoadingSize = (typeof LOADING_SIZES)[number] | (string & {});

/** 全屏加载的配置。 */
export interface LoadingOptions {
  /** 加载提示文字 */
  text?: LoadingContent;
  /** 是否全屏，服务式调用默认 true */
  fullscreen?: boolean;
  /** 图标尺寸 */
  size?: LoadingSize;
  /** 图标是否继承文字颜色 */
  inheritColor?: boolean;
  /** 是否显示遮罩 */
  showOverlay?: boolean;
  /** 是否禁止背景滚动 */
  preventScrollThrough?: boolean;
  /** 延迟显示的毫秒数 */
  delay?: number;
  /** 层级 */
  zIndex?: number;
}

/** 加载实例，用于手动关闭。 */
export interface LoadingInstance {
  /** 关闭加载 */
  hide(): void;
}
