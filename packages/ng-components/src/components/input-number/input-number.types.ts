export const INPUT_NUMBER_SIZES = ['small', 'medium', 'large'] as const;
export type InputNumberSize = (typeof INPUT_NUMBER_SIZES)[number];

export const INPUT_NUMBER_STATUSES = ['default', 'success', 'warning', 'error'] as const;
export type InputNumberStatus = (typeof INPUT_NUMBER_STATUSES)[number];

export const INPUT_NUMBER_THEMES = ['column', 'row', 'normal'] as const;
export type InputNumberTheme = (typeof INPUT_NUMBER_THEMES)[number];

export const INPUT_NUMBER_ALIGNS = ['left', 'center', 'right'] as const;
export type InputNumberAlign = (typeof INPUT_NUMBER_ALIGNS)[number];

/** 输入值形态：普通模式下是 `number`，`largeNumber` 模式下是十进制字符串。 */
export type InputNumberValue = number | string;

/** 小数位配置：传数字表示保留位数，传对象时可指定是否四舍五入。 */
export type InputNumberDecimalPlaces = number | { enableRound: boolean; places: number };

/** 展示值格式化函数，对应上游 `format`。 */
export type InputNumberFormat = (
  value: InputNumberValue,
  context?: { fixedNumber?: InputNumberValue },
) => InputNumberValue;

/** 触发来源，与上游 `ChangeSource` 对齐。 */
export type InputNumberChangeSource = 'add' | 'reduce' | 'input' | 'blur' | 'enter' | 'clear' | 'props';

/** 值变化事件，等价于上游 `onChange(value, { type, e })` 的两个参数合并。 */
export interface InputNumberChangeEvent {
  /** 变化后的值，清空时为 undefined */
  value: InputNumberValue | undefined;
  /** 触发来源 */
  type: InputNumberChangeSource;
  /** 原始事件 */
  e?: Event;
}

/** 焦点类事件，等价于上游 `onFocus(value, { e })`。 */
export interface InputNumberFocusEvent {
  /** 当前值 */
  value: InputNumberValue | undefined;
  /** 原始事件 */
  e: FocusEvent;
}

/** 键盘类事件，等价于上游 `onKeydown(value, { e })`。 */
export interface InputNumberKeyboardEvent {
  /** 当前值 */
  value: InputNumberValue | undefined;
  /** 原始事件 */
  e: KeyboardEvent;
}

/** 校验事件，等价于上游 `onValidate({ error })`。 */
export interface InputNumberValidateEvent {
  /** 超出范围时的错误类型 */
  error?: 'exceed-maximum' | 'below-minimum';
}
