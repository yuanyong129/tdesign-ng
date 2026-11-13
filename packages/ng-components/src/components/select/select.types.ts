/** 选择器尺寸，`medium` 是默认值。 */
export const SELECT_SIZES = ['small', 'medium', 'large'] as const;

export type SelectSize = (typeof SELECT_SIZES)[number];

/** 选择器状态。 */
export const SELECT_STATUSES = ['default', 'success', 'warning', 'error'] as const;

export type SelectStatus = (typeof SELECT_STATUSES)[number];

/** 选项值的取值类型。 */
export type SelectValue = string | number | boolean;

/** 单选时的值：没有选中项时为 `null`。 */
export type SelectSingleValue = SelectValue | null;

/** 多选时的值。 */
export type SelectMultipleValue = SelectValue[];

/** 选项对象。 */
export interface SelectOptionObj {
  /** 展示文字，缺省时用 `value` 的字符串形式 */
  label?: string;
  /** 选项值 */
  value: SelectValue;
  /** 是否禁用该项 */
  disabled?: boolean;
}

/** 分组选项。 */
export interface SelectOptionGroupObj {
  /** 分组标题 */
  group: string;
  /** 分组内的选项 */
  children: SelectOptionObj[];
}

/** 选项：可以直接给原始值，也可以给选项对象。 */
export type SelectOption = SelectValue | SelectOptionObj;

/** `options` 支持平铺与分组混排。 */
export type SelectOptionInput = SelectOption | SelectOptionGroupObj;

/** 值变化的来源，与上游 `SelectValueChangeTrigger` 保持一致。 */
export type SelectValueChangeTrigger = 'check' | 'uncheck' | 'clear' | 'tag-remove' | 'default';

/** 值变化事件。 */
export interface SelectChangeEvent {
  /** 变化后的值 */
  value: SelectSingleValue | SelectMultipleValue;
  /** 本次操作的选项（清空时为空） */
  option?: SelectOptionObj;
  /** 变化后所有已选中的选项 */
  selectedOptions: SelectOptionObj[];
  /** 触发来源 */
  trigger: SelectValueChangeTrigger;
  /** 原始事件 */
  event?: Event;
}

/** 面板里的一行：带标题的分组或不分组的选项集合。 */
export interface SelectOptionGroupView {
  /** 分组标题，无标题时为 `null` */
  label: string | null;
  /** 分组内的选项 */
  options: SelectOptionObj[];
}

/** 判断是否是分组对象。 */
export function isSelectOptionGroup(option: SelectOptionInput): option is SelectOptionGroupObj {
  return typeof option === 'object' && option !== null && 'group' in option && 'children' in option;
}

/** 把任意选项统一成选项对象。 */
export function normalizeSelectOption(option: SelectOption): SelectOptionObj {
  if (typeof option === 'string' || typeof option === 'number' || typeof option === 'boolean') {
    return { label: String(option), value: option };
  }
  return {
    value: option.value,
    label: option.label ?? String(option.value),
    disabled: option.disabled,
  };
}
