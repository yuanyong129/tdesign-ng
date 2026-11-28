import type { TemplateRef } from '@angular/core';
import type { InputOptions } from '../input/input-options';
import type { PopupOptions } from '../popup/popup.types';

/** 内置输入框实际支持的原生编辑区配置。 */
export type AutoCompleteInputProps = InputOptions;
/** 显示状态、焦点触发与即时输入反馈由 AutoComplete 管理。 */
export type AutoCompletePopupProps = Omit<PopupOptions, 'trigger' | 'delay'>;

export const AUTO_COMPLETE_SIZES = ['small', 'medium', 'large'] as const;
export type AutoCompleteSize = (typeof AUTO_COMPLETE_SIZES)[number];

export const AUTO_COMPLETE_STATUSES = ['default', 'success', 'warning', 'error'] as const;
export type AutoCompleteStatus = (typeof AUTO_COMPLETE_STATUSES)[number];

/** 富文本内容：字符串按纯文本渲染，模板按内容渲染。 */
export type AutoCompleteContent = string | TemplateRef<unknown>;

/** 自定义选项内容：字符串作为文本，模板作为内容。 */
export type AutoCompleteOptionLabel = string | TemplateRef<unknown>;

/** 对象形式的选项，`text` 用于匹配与选中，`label` 用于展示。 */
export interface AutoCompleteOptionObj {
  /** 展示内容，可以是字符串或模板 */
  label?: AutoCompleteOptionLabel;
  /** 纯文本，用于过滤、高亮与选中；缺省时取 `label` 的字符串值 */
  text?: string;
  [key: string]: unknown;
}

export type AutoCompleteOption = string | AutoCompleteOptionObj;

/** 自定义过滤函数，参数为当前输入值与原始选项。 */
export type AutoCompleteFilter = (
  filterWords: string,
  option: AutoCompleteOption,
) => boolean | Promise<boolean>;

/** 归一化后的选项，模板与键盘操作只认它。 */
export interface AutoCompleteOptionView {
  /** 选中时写入输入框的文本 */
  text: string;
  /** 实际展示的文本（`label` 优先） */
  content: string;
  /** `label` 为模板时的内容模板 */
  template: TemplateRef<unknown> | null;
  /** 原始选项 */
  raw: AutoCompleteOption;
}

/** 高亮片段。 */
export interface AutoCompleteHighlightPart {
  text: string;
  match: boolean;
}

/** 值变化时携带的上下文。 */
export interface AutoCompleteChangeEvent {
  /** 变化后的值 */
  value: string;
  /** 触发来源：输入、清空 */
  trigger?: 'input' | 'initial' | 'clear';
  /** 原始事件 */
  e?: Event;
}

export interface AutoCompleteSelectEvent {
  value: string;
  e?: Event;
}

export interface AutoCompleteEnterEvent {
  e: KeyboardEvent;
  value: string;
}

export interface AutoCompleteFocusEvent {
  e: FocusEvent;
  value: string;
}

export interface AutoCompleteBlurEvent {
  e: FocusEvent;
  value: string;
}

export interface AutoCompleteClearEvent {
  e: MouseEvent;
}

export interface AutoCompleteCompositionEvent {
  e: CompositionEvent;
  value: string;
}
