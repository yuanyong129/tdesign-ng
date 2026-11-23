import type { TemplateRef } from '@angular/core';

import type { ButtonShape, ButtonSize, ButtonTheme, ButtonVariant } from '../button/button.types';
import type { RadioVariant } from '../radio/radio.types';
import type { SelectSize } from '../select/select.types';

/** 日历的值：`YYYY-MM-DD` 字符串或 `Date`。 */
export type CalendarValue = string | Date;

/** 日历展示模式。 */
export const CALENDAR_MODES = ['month', 'year'] as const;

export type CalendarMode = (typeof CALENDAR_MODES)[number];

/** 日历风格。 */
export const CALENDAR_THEMES = ['full', 'card'] as const;

export type CalendarTheme = (typeof CALENDAR_THEMES)[number];

/** 星期序号，周一为 1、周日为 7。 */
export type CalendarWeekDay = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** 表头一周中某一列的渲染信息。 */
export interface CalendarWeekHeader {
  /** 星期序号。 */
  day: CalendarWeekDay;
  /** 表头展示文字。 */
  display: string;
}

/** 日历单元格。 */
export interface CalendarCell {
  /** 展示模式。 */
  mode: CalendarMode;
  /** 与当前展示月份的关系：-1 上月、0 本月、1 下月；年模式下为 `undefined`。 */
  belongTo?: number;
  /** 是否被选中。 */
  isCurrent?: boolean;
  /** 星期序号。 */
  day?: CalendarWeekDay;
  /** 所在行号，从 1 开始。 */
  weekOrder?: number;
  /** 单元格对应日期。 */
  date: Date;
  /** 按 `format` 格式化后的日期。 */
  formattedDate?: string;
  /** 过滤起始日期。 */
  filterDate: Date | null;
  /** 过滤起始日期的格式化结果。 */
  formattedFilterDate: string | null;
  /** 是否展示周末。 */
  isShowWeekend: boolean;
}

/** 控制区事件与模板共用的参数。 */
export interface CalendarControllerOptions {
  /** 当前过滤的起始日期（展示年月的 1 号）。 */
  filterDate: Date;
  /** 过滤起始日期的格式化结果。 */
  formattedFilterDate: string;
  /** 当前展示模式。 */
  mode: CalendarMode;
  /** 是否展示周末。 */
  isShowWeekend: boolean;
}

/** 表头插槽参数。 */
export interface CalendarWeek {
  /** 星期序号。 */
  day: CalendarWeekDay;
}

/** 单元格事件的参数。 */
export interface CalendarCellEvent {
  /** 事件对应的单元格。 */
  cell: CalendarCell;
  /** 原生事件。 */
  e: MouseEvent;
}

/** 年月变化事件的参数。 */
export interface CalendarMonthChangeEvent {
  /** 月份，字符串形式。 */
  month: string;
  /** 年份，字符串形式。 */
  year: string;
}

/** 控制区中按钮类部件的属性，透传给内部按钮。 */
export interface CalendarButtonProps {
  /** 外观变体。 */
  variant?: ButtonVariant;
  /** 主题色。 */
  theme?: ButtonTheme;
  /** 形状。 */
  shape?: ButtonShape;
  /** 尺寸。 */
  size?: ButtonSize;
  /** 是否为幽灵按钮。 */
  ghost?: boolean;
  /** 是否禁用。 */
  disabled?: boolean;
}

/** 控制区中下拉部件的属性，透传给内部选择器。 */
export interface CalendarSelectProps {
  /** 尺寸。 */
  size?: SelectSize;
  /** 是否禁用。 */
  disabled?: boolean;
}

/** 控制区中模式切换的属性，透传给内部单选组。 */
export interface CalendarRadioGroupProps {
  /** 按钮式单选组的样式变体。 */
  variant?: RadioVariant;
  /** 是否禁用。 */
  disabled?: boolean;
}

/** 当前日期按钮配置。 */
export interface CalendarCurrentController {
  /** 是否展示。 */
  visible?: boolean;
  /** 月模式下的「今天」按钮属性。 */
  currentDayButtonProps?: CalendarButtonProps;
  /** 年模式下的「本月」按钮属性。 */
  currentMonthButtonProps?: CalendarButtonProps;
}

/** 模式切换配置。 */
export interface CalendarModeController {
  /** 是否展示。 */
  visible?: boolean;
  /** 单选组属性。 */
  radioGroupProps?: CalendarRadioGroupProps;
}

/** 年月下拉配置。 */
export interface CalendarSelectController {
  /** 是否展示。 */
  visible?: boolean;
  /** 选择器属性。 */
  selectProps?: CalendarSelectProps;
}

/** 周末开关配置。 */
export interface CalendarWeekendController {
  /** 是否展示。 */
  visible?: boolean;
  /** 展示周末时的按钮属性。 */
  showWeekendButtonProps?: CalendarButtonProps;
  /** 隐藏周末时的按钮属性。 */
  hideWeekendButtonProps?: CalendarButtonProps;
}

/** 日历控制区配置。 */
export interface CalendarController {
  /** 是否展示整个控制区。 */
  visible?: boolean;
  /** 是否禁用整个控制区。 */
  disabled?: boolean;
  /** 当前日期按钮。 */
  current?: CalendarCurrentController;
  /** 模式切换。 */
  mode?: CalendarModeController;
  /** 月份下拉。 */
  month?: CalendarSelectController;
  /** 周末开关。 */
  weekend?: CalendarWeekendController;
  /** 年份下拉。 */
  year?: CalendarSelectController;
}

/** 判断值是否为模板引用。 */
export function isTemplateRef<T>(value: unknown): value is TemplateRef<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'createEmbeddedView' in value &&
    typeof (value as { createEmbeddedView?: unknown }).createEmbeddedView === 'function'
  );
}
