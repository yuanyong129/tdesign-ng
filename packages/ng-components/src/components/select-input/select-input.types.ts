import type { InputOptions } from '../input/input-options';
import type { TagInputTagProps } from '../tag-input/tag-input.types';

/**
 * 选择器尺寸。
 */
export const SELECT_INPUT_SIZES = ['small', 'medium', 'large'] as const;

export type SelectInputSize = (typeof SELECT_INPUT_SIZES)[number];

/**
 * 选择器状态。
 */
export const SELECT_INPUT_STATUSES = ['default', 'success', 'warning', 'error'] as const;

export type SelectInputStatus = (typeof SELECT_INPUT_STATUSES)[number];

/**
 * 值字段映射，用于把对象数组渲染成标签与回显文本。
 */
export interface SelectInputKeys {
  /** 标签/回显取值的字段名，默认 `label` */
  label?: string;
  /** 值的字段名，默认 `value` */
  value?: string;
  /** 子节点的字段名，默认 `children` */
  children?: string;
}

/**
 * 选择器的值，与上游 `SelectInputValue` 对齐。
 */
export type SelectInputValue = string | number | boolean | Date | Record<string, unknown> | SelectInputValue[];

/**
 * 多选标签的值。
 */
export type SelectInputTagValue = string | number;

/**
 * 输入值变化的来源。
 */
export type SelectInputValueChangeTrigger = 'input' | 'clear' | 'blur' | 'focus' | 'initial' | 'change';

/**
 * 输入值变化的上下文。
 */
export interface SelectInputValueChangeContext {
  /** 触发这次变化的原生事件 */
  e?: Event | InputEvent | MouseEvent | FocusEvent | KeyboardEvent | CompositionEvent;
  /** 触发来源 */
  trigger: SelectInputValueChangeTrigger;
}

/**
 * 标签变化的来源。
 */
export type SelectInputTagChangeTrigger = 'enter' | 'tag-remove' | 'backspace' | 'clear';

/**
 * 标签变化的上下文。
 */
export interface SelectInputTagChangeContext {
  /** 触发来源 */
  trigger: SelectInputTagChangeTrigger;
  /** 被移除的标签下标 */
  index?: number;
  /** 被移除的标签值 */
  item?: SelectInputTagValue;
  /** 触发这次变化的原生事件 */
  e?: MouseEvent | KeyboardEvent;
}

/**
 * 标签变化事件。
 */
export interface SelectInputTagChangeEvent extends SelectInputTagChangeContext {
  /** 变化后的全部标签值 */
  value: SelectInputTagValue[];
}

/**
 * 输入值变化事件。
 */
export interface SelectInputInputChangeEvent {
  /** 变化后的输入文本 */
  value: string;
  /** 触发来源 */
  trigger: SelectInputValueChangeTrigger;
  /** 触发这次变化的原生事件 */
  e?: SelectInputValueChangeContext['e'];
}

/**
 * 聚焦事件。
 */
export interface SelectInputFocusEvent {
  /** 当前的值 */
  value: SelectInputValue | undefined;
  /** 原生聚焦事件 */
  e: FocusEvent;
  /** 当前输入框的文本 */
  inputValue: string;
  /** 多选时的标签值 */
  tagInputValue?: SelectInputTagValue[];
}

/**
 * 失焦事件。
 */
export interface SelectInputBlurEvent {
  /** 当前的值 */
  value: SelectInputValue | undefined;
  /** 原生失焦事件 */
  e: FocusEvent;
  /** 当前输入框的文本 */
  inputValue: string;
  /** 多选时的标签值 */
  tagInputValue?: SelectInputTagValue[];
}

/**
 * 回车事件。
 */
export interface SelectInputEnterEvent {
  /** 当前的值 */
  value: SelectInputValue | undefined;
  /** 原生键盘事件 */
  e: KeyboardEvent;
  /** 当前输入框的文本 */
  inputValue: string;
  /** 多选时的标签值 */
  tagInputValue?: SelectInputTagValue[];
}

/**
 * 清空事件。
 */
export interface SelectInputClearEvent {
  /** 原生点击事件 */
  e: MouseEvent;
}

/**
 * 粘贴事件，与上游 `onPaste` 的上下文对齐。
 */
export interface SelectInputPasteEvent {
  /** 原生粘贴事件 */
  e: ClipboardEvent;
  /** 粘贴板里的纯文本 */
  pasteValue: string;
}

/**
 * 折叠标签的自定义渲染上下文，与上游 `collapsedItems` 的上下文对齐。
 */
export interface SelectInputCollapsedItemsContext {
  /** 全部标签值 */
  $implicit: SelectInputTagValue[];
  /** 全部标签值 */
  value: SelectInputTagValue[];
  /** 被折叠的标签值 */
  collapsedSelectedItems: SelectInputTagValue[];
  /** 被折叠的数量 */
  count: number;
  /** 移除某个被折叠的标签 */
  onClose: (context: { index: number; e?: MouseEvent }) => void;
}

/**
 * 自定义标签的渲染上下文。
 */
export interface SelectInputTagContext {
  /** 标签值 */
  $implicit: SelectInputTagValue;
  /** 标签值 */
  value: SelectInputTagValue;
}

/**
 * 自定义值展示的渲染上下文，与上游 `valueDisplay` 的上下文对齐。
 */
export interface SelectInputValueDisplayContext {
  /** 当前展示的标签值 */
  $implicit: SelectInputTagValue[];
  /** 当前展示的标签值 */
  value: SelectInputTagValue[];
  /** 移除某个标签 */
  onClose: (index: number, item?: SelectInputTagValue) => void;
}

/**
 * 标签属性，`tagProps` 当前支持的字段子集。
 */
export interface SelectInputTagProps extends TagInputTagProps {
  /** 标签主题，默认 `default` */
  theme?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** 标签变体，默认 `light` */
  variant?: 'dark' | 'light' | 'outline' | 'light-outline';
  /** 标签最大宽度，超出省略 */
  maxWidth?: string | number;
}

/** 多选标签区支持的配置；选择值、输入文本和交互流程由 SelectInput 管理。 */
export interface SelectInputTagInputProps {
  inputProps?: InputOptions;
  tagProps?: SelectInputTagProps;
  disabled?: boolean;
  readonly?: boolean;
  onInputChange?: (value: string, context: SelectInputValueChangeContext) => void;
  onChange?: (value: SelectInputTagValue[], context: SelectInputTagChangeContext) => void;
}

/**
 * 弹层属性，`popupProps` 当前支持的字段子集。
 */
export interface SelectInputPopupProps {
  /** 触发方式，默认 `click` */
  trigger?: 'hover' | 'click' | 'focus' | 'mousedown' | 'context-menu';
  /** 弹层位置，默认 `bottom-left` */
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'left-top'
    | 'left-bottom'
    | 'right-top'
    | 'right-bottom';
  /** 弹层根元素的附加类名 */
  overlayClassName?: string;
  /** 是否显示箭头，默认 `false` */
  showArrow?: boolean;
}
