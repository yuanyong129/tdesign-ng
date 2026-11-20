export const RATE_DEFAULT_COLOR = '#ED7B2F';
export const RATE_DEFAULT_TEXTS = ['极差', '失望', '一般', '满意', '惊喜'];

/**
 * @zh 评分图标的尺寸，任意 CSS 长度。
 * @en Size of the rate icon, any CSS length.
 */
export type RateSize = string;

/**
 * @zh 评分颜色，单色或 `[选中色, 未选中色]`。
 * @en Rate color, a single color or `[activeColor, inactiveColor]`.
 */
export type RateColor = string | string[];

/**
 * @zh 评分变化事件。
 * @en Rate change event.
 */
export interface RateChangeEvent {
  /**
   * @zh 变化后的评分值。
   * @en The value after change.
   */
  value: number;
}
