/** 加载图标尺寸。 */
export const LOADING_SIZES = ['small', 'medium', 'large'] as const;

export type LoadingSize = (typeof LOADING_SIZES)[number];

/** 全屏加载的配置。 */
export interface LoadingOptions {
  /** 加载提示文字 */
  text?: string;
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
