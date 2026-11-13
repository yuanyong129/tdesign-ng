export const INPUT_SIZES = ['small', 'medium', 'large'] as const;
export type InputSize = (typeof INPUT_SIZES)[number];

export const INPUT_STATUSES = ['default', 'success', 'warning', 'error'] as const;
export type InputStatus = (typeof INPUT_STATUSES)[number];

export const INPUT_ALIGNS = ['left', 'center', 'right'] as const;
export type InputAlign = (typeof INPUT_ALIGNS)[number];

export const INPUT_TYPES = [
  'text',
  'number',
  'url',
  'tel',
  'password',
  'search',
  'submit',
  'hidden',
] as const;
export type InputType = (typeof INPUT_TYPES)[number];

export type InputValue = string | number;

/** 值变化时携带的上下文，字段与上游 `onChange` 的第二个参数对齐。 */
export interface InputChangeEvent {
  /** 变化后的值 */
  value: InputValue;
  /** 触发来源：输入、初始化、清空 */
  trigger: 'input' | 'initial' | 'clear';
  /** 原始事件 */
  event?: Event;
}
