import type { TemplateRef } from '@angular/core';
import type { PopupPlacement } from '../popup/popup.types';

/** 弹层位置，直接复用 Popup 的 12 个方向。 */
export type DropdownPlacement = PopupPlacement;

/** 子菜单的展开方向，与上游 `direction` 一致。 */
export const DROPDOWN_DIRECTIONS = ['left', 'right'] as const;

export type DropdownDirection = (typeof DROPDOWN_DIRECTIONS)[number];

/** 触发方式，去掉 t-popup 独有的 `mousedown`，与上游 `trigger` 一致。 */
export const DROPDOWN_TRIGGERS = ['hover', 'click', 'focus', 'context-menu'] as const;

export type DropdownTrigger = (typeof DROPDOWN_TRIGGERS)[number];

/** 选项主题色。 */
export const DROPDOWN_ITEM_THEMES = ['default', 'success', 'warning', 'error'] as const;

export type DropdownItemTheme = (typeof DROPDOWN_ITEM_THEMES)[number];

/** 选项值，业务透传。 */
export type DropdownValue = string | number | Record<string, unknown> | undefined;

/** 可渲染内容：字符串按文本渲染，`TemplateRef` 交给 `ngTemplateOutlet` 渲染。 */
export type DropdownContent = string | TemplateRef<unknown> | undefined;

/** 点击选项时的上下文，与上游 `{ e }` 对齐。 */
export interface DropdownItemClickContext {
  /** 原生鼠标事件 */
  e: MouseEvent;
}

/** `t-dropdown-item` 的点击事件参数，对应上游 `onClick(value, { e })`。 */
export interface DropdownItemClickEvent {
  /** 选项值 */
  value: DropdownValue;
  /** 原生鼠标事件 */
  e: MouseEvent;
}

/** `t-dropdown` 的点击事件参数，对应上游 `onClick(dropdownItem, { e })`。 */
export interface DropdownClickEvent {
  /** 被点击的选项 */
  item: DropdownOption;
  /** 原生鼠标事件 */
  e: MouseEvent;
}

/** 菜单选项，与上游 `DropdownOption` 对齐。 */
export interface DropdownOption {
  /** 是否高亮选中 */
  active?: boolean;
  /** 选项内容 */
  content?: DropdownContent;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否在选项下方显示分割线 */
  divider?: boolean;
  /** 选项前置图标 */
  prefixIcon?: DropdownContent;
  /** 选项主题色 */
  theme?: DropdownItemTheme;
  /** 选项值 */
  value?: DropdownValue;
  /** 子菜单选项 */
  children?: DropdownOption[];
  /** 选项自身被点击时的回调 */
  onClick?: (value: DropdownValue, context: DropdownItemClickContext) => void;
  /** 上游 `DropdownOption` 允许透传任意业务字段 */
  [key: string]: unknown;
}
