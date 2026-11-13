/** 开关尺寸。 */
export const SWITCH_SIZES = ['small', 'medium', 'large'] as const;
export type SwitchSize = (typeof SWITCH_SIZES)[number];

/** 开关取值，配合 `customValue` 可以开关两种任意值。 */
export type SwitchValue = string | number | boolean;

/** 开关变化事件。 */
export interface SwitchChangeEvent {
  value: SwitchValue;
  event: MouseEvent | KeyboardEvent;
}
