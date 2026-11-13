/** 单个复选框的取值。 */
export type CheckboxValue = string | number | boolean;

/** 复选框组的取值。 */
export type CheckboxGroupValue = CheckboxValue[];

/** 用对象描述一个选项。 */
export interface CheckboxOptionObj {
  label?: string;
  value?: CheckboxValue;
  disabled?: boolean;
}

/** 选项可以是简写值，也可以是对象。 */
export type CheckboxOption = string | number | CheckboxOptionObj;

/** 单个复选框的变更事件。 */
export interface CheckboxChangeEvent {
  checked: boolean;
  value: CheckboxValue;
  event: Event;
}

/** 复选框组的变更事件。 */
export interface CheckboxGroupChangeEvent {
  value: CheckboxGroupValue;
  current: CheckboxValue;
  option: CheckboxOption | undefined;
  type: 'check' | 'uncheck';
  event: Event;
}

/** 把选项简写统一成对象。 */
export function normalizeOption(option: CheckboxOption): { value: CheckboxValue; label?: string; disabled?: boolean } {
  if (typeof option === 'string' || typeof option === 'number') {
    return { value: option, label: String(option), disabled: false };
  }
  return { ...option, value: option.value ?? option.label ?? '' };
}
