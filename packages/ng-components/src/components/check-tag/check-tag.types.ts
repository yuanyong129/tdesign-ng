import type { TemplateRef } from '@angular/core';
import type { Content } from '../../_utils/content';

/** 可选标签尺寸。 */
export const CHECK_TAG_SIZES = ['small', 'medium', 'large'] as const;
export type CheckTagSize = (typeof CHECK_TAG_SIZES)[number];

/** 可选标签的值。 */
export type CheckTagValue = string | number;

/** 标签列表值。 */
export type CheckTagGroupValue = Array<string | number>;

/** 富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type CheckTagContent = Content;

/** 选中状态变化来源。 */
export type CheckTagGroupChangeType = 'check' | 'uncheck';

/** 可选标签选中状态变化事件。 */
export interface CheckTagChangeEvent {
  checked: boolean;
  value: CheckTagValue | undefined;
  event?: MouseEvent | KeyboardEvent;
}

/** 选项配置，`label` 优先于 `content` 与 `default`，都为空时回退到 `value`。 */
export interface CheckTagGroupOption {
  label?: CheckTagContent;
  value: CheckTagValue;
  content?: CheckTagContent;
  default?: CheckTagContent;
  disabled?: boolean;
  size?: CheckTagSize;
  checked?: boolean;
  defaultChecked?: boolean;
}

/** 可选标签组的值变化事件。 */
export interface CheckTagGroupChangeEvent {
  value: CheckTagGroupValue;
  checked: boolean;
  type: CheckTagGroupChangeType;
  current: CheckTagGroupOption;
  event?: MouseEvent | KeyboardEvent;
}
