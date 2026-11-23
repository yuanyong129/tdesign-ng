export const RANGE_INPUT_SIZES = ['small', 'medium', 'large'] as const;
export type RangeInputSize = (typeof RANGE_INPUT_SIZES)[number];

export const RANGE_INPUT_STATUSES = ['default', 'success', 'warning', 'error'] as const;
export type RangeInputStatus = (typeof RANGE_INPUT_STATUSES)[number];

/** 范围输入框的值，按「左、右」顺序组成的二元数组。 */
export type RangeInputValue = Array<string | number>;

/** 触发位置，`first` 左输入框、`second` 右输入框、`all` 整体。 */
export type RangeInputPosition = 'first' | 'second' | 'all';

/** 展示值格式化函数，对应上游 `format`。 */
export type RangeInputFormat = (value: string | number) => string | number;

/** 值变化来源，与上游 `ChangeTrigger` 对齐。 */
export type RangeInputTrigger = 'input' | 'initial' | 'clear';

/** 值变化事件，等价于上游 `onChange(value, { e, position, trigger })`。 */
export interface RangeInputChangeEvent {
  /** 变化后的值 */
  value: RangeInputValue;
  /** 触发位置 */
  position: RangeInputPosition;
  /** 触发来源 */
  trigger: RangeInputTrigger;
  /** 原始事件 */
  e?: Event;
}

/** 焦点类事件，等价于上游 `onFocus(value, { e, position })`。 */
export interface RangeInputFocusEvent {
  /** 当前值 */
  value: RangeInputValue;
  /** 触发位置 */
  position: RangeInputPosition;
  /** 原始事件 */
  e: FocusEvent;
}

/** 回车事件，等价于上游 `onEnter(value, { e, position })`。 */
export interface RangeInputEnterEvent {
  /** 当前值 */
  value: RangeInputValue;
  /** 触发位置 */
  position: RangeInputPosition;
  /** 原始事件 */
  e: KeyboardEvent;
}

/** 点击事件，等价于上游 `onClick({ e, position })`。 */
export interface RangeInputClickEvent {
  /** 触发位置 */
  position: RangeInputPosition;
  /** 原始事件 */
  e: MouseEvent;
}

/** 鼠标进出事件，等价于上游 `onMouseenter({ e })` / `onMouseleave({ e })`。 */
export interface RangeInputMouseEvent {
  /** 原始事件 */
  e: MouseEvent;
}

/** 清除事件，等价于上游 `onClear({ e })`。 */
export interface RangeInputClearEvent {
  /** 原始事件 */
  e: MouseEvent;
}
