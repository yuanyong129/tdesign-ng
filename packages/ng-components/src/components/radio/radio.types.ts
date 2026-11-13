/** 单选框组的排列方向。 */
export const RADIO_DIRECTIONS = ['horizontal', 'vertical'] as const;

export type RadioDirection = (typeof RADIO_DIRECTIONS)[number];

/** 单选框组的形态：普通圆点单选框或按钮式单选框。 */
export const RADIO_THEMES = ['radio', 'button'] as const;

export type RadioTheme = (typeof RADIO_THEMES)[number];

/** 按钮式单选框组的样式变体。 */
export const RADIO_VARIANTS = ['outline', 'primary-filled', 'default-filled'] as const;

export type RadioVariant = (typeof RADIO_VARIANTS)[number];

export const RADIO_SIZES = ['small', 'medium', 'large'] as const;

export type RadioSize = (typeof RADIO_SIZES)[number];

/** 单个单选框的值。 */
export type RadioValue = string | number | boolean;

/** 选项简写：字符串/数字等价于 `{ label, value }`。 */
export interface RadioOptionObj {
  label?: string;
  value?: RadioValue;
  disabled?: boolean;
}

export type RadioOption = string | number | RadioOptionObj;

export interface RadioChangeEvent {
  checked: boolean;
  value: RadioValue;
  event: Event;
}

export interface RadioGroupChangeEvent {
  value: RadioValue;
  event: Event;
}

/** 把选项简写统一成对象。 */
export function normalizeRadioOption(option: RadioOption): {
  value: RadioValue;
  label?: string;
  disabled?: boolean;
} {
  if (typeof option === 'string' || typeof option === 'number') {
    return { value: option, label: String(option), disabled: false };
  }
  return { ...option, value: option.value ?? option.label ?? '' };
}
