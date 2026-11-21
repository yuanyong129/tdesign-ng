/**
 * @zh 日期值：字符串、时间戳或 Date。
 * @en Date value: a string, a timestamp or a Date.
 */
export type DateValue = string | number | Date;

/**
 * @zh 回传值的格式。
 * - `YYYY-MM-DD` 等格式串：按格式输出字符串
 * - `time-stamp`：时间戳
 * - `Date`：Date 对象
 * @en Format of the emitted value.
 */
export type DatePickerValueType =
  | 'time-stamp'
  | 'Date'
  | 'YYYY'
  | 'YYYY-MM'
  | 'YYYY-MM-DD'
  | 'YYYY-MM-DD HH'
  | 'YYYY-MM-DD HH:mm'
  | 'YYYY-MM-DD HH:mm:ss'
  | 'YYYY-MM-DD HH:mm:ss:SSS';

/**
 * @zh 禁用日期的范围配置。
 * @en Disabled date range configuration.
 */
export interface DisableDateObj {
  /** @zh 早于 from 的日期禁用（含 from？不，从 from 起可选） @en Dates before `from` are disabled */
  from?: DateValue;
  /** @zh 晚于 to 的日期禁用 @en Dates after `to` are disabled */
  to?: DateValue;
  /** @zh 早于 before 的日期禁用 @en Dates before `before` are disabled */
  before?: DateValue;
  /** @zh 晚于 after 的日期禁用 @en Dates after `after` are disabled */
  after?: DateValue;
}

/**
 * @zh 禁用日期：精确日期数组、范围对象或判断函数。
 * @en Disabled dates: an array, a range object or a predicate.
 */
export type DisableDate = DateValue[] | DisableDateObj | ((date: Date) => boolean);

/**
 * @zh 日期选择的变化来源。
 * @en Source of a date picker change.
 */
export type DatePickerTrigger =
  | 'pick'
  | 'clear'
  | 'confirm'
  | 'enter'
  | 'preset'
  | 'tag-remove';

/**
 * @zh 日期选择的变化事件。
 * @en Date picker change event.
 */
export interface DatePickerChangeEvent {
  /** @zh 变化后的值，清空时为 '' @en Value after change; '' when cleared */
  value: DateValue | '';
  /** @zh 变化来源 @en Source of the change */
  trigger: DatePickerTrigger;
}

/**
 * @zh 面板里的一个日期格。
 * @en One date cell in the panel.
 */
export interface DatePickerCell {
  /** @zh 该格对应的日期 @en The date of the cell */
  date: Date;
  /** @zh 显示几号 @en Day of month */
  day: number;
  /** @zh 是否属于相邻月份 @en Whether it belongs to the previous/next month */
  additional: boolean;
}
