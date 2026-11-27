import type { TemplateRef } from '@angular/core';
import type { Content } from '../../_utils/content';
import type { TagShape, TagTheme, TagVariant } from '../tag/tag.types';

/** 标签外观与关闭配置；标签内容和值仍由 TagInput 管理。 */
export interface TagInputTagProps {
  theme?: TagTheme;
  variant?: TagVariant;
  shape?: TagShape;
  color?: string;
  title?: string | boolean;
  maxWidth?: string | number;
  closable?: boolean;
  disabled?: boolean;
  onClose?: (context: { e: MouseEvent }) => void;
}

/** 标签输入框尺寸。 */
export const TAG_INPUT_SIZES = ['small', 'medium', 'large'] as const;
export type TagInputSize = (typeof TAG_INPUT_SIZES)[number];

/** 标签输入框状态。 */
export const TAG_INPUT_STATUSES = ['default', 'success', 'warning', 'error'] as const;
export type TagInputStatus = (typeof TAG_INPUT_STATUSES)[number];

/** 超出显示方式：`scroll` 横向滚动，`break-line` 换行。 */
export const TAG_INPUT_EXCESS_TAGS_DISPLAY_TYPES = ['scroll', 'break-line'] as const;
export type TagInputExcessTagsDisplayType = (typeof TAG_INPUT_EXCESS_TAGS_DISPLAY_TYPES)[number];

/** 标签列表值。 */
export type TagInputValue = Array<string | number>;

/** 富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type TagInputRichText = Content;

/** 值变化来源。 */
export type TagInputChangeTrigger = 'enter' | 'tag-remove' | 'backspace' | 'clear';

/** 输入框内容变化来源。 */
export type TagInputInputChangeTrigger = 'input' | 'clear' | 'enter' | 'blur';

/** 删除来源。 */
export type TagInputRemoveTrigger = 'tag-remove' | 'backspace';

/** 标签列表变化事件。 */
export interface TagInputChangeEvent {
  value: TagInputValue;
  trigger: TagInputChangeTrigger;
  index?: number;
  item?: string | number;
  event?: MouseEvent | KeyboardEvent;
}

/** 标签删除事件。 */
export interface TagInputRemoveEvent {
  value: TagInputValue;
  index: number;
  item: string | number;
  trigger: TagInputRemoveTrigger;
  event?: MouseEvent | KeyboardEvent;
}

/** 拖拽排序事件，`newTags` 是重排后的标签列表。 */
export interface TagInputDragSortEvent {
  newTags: TagInputValue;
  currentIndex: number;
  current: string | number;
  targetIndex: number;
  target: string | number;
}

/** 聚焦 / 失焦事件。 */
export interface TagInputFocusEvent {
  value: TagInputValue;
  inputValue: string;
  event: FocusEvent;
}

/** 回车事件。 */
export interface TagInputEnterEvent {
  value: TagInputValue;
  inputValue: string;
  event: KeyboardEvent;
}

/** 输入框内容变化事件。 */
export interface TagInputInputChangeEvent {
  value: string;
  trigger: TagInputInputChangeTrigger;
  event?: Event;
}

/** 粘贴事件。 */
export interface TagInputPasteEvent {
  pasteValue: string;
  event: ClipboardEvent;
}

/** `collapsedItems` 的渲染上下文。 */
export interface TagInputCollapsedContext {
  value: TagInputValue;
  collapsedSelectedItems: TagInputValue;
  count: number;
  onClose: (context: { index: number; e?: MouseEvent }) => void;
}

/** `valueDisplay` 的渲染上下文。 */
export interface TagInputValueDisplayContext {
  value: TagInputValue;
}
