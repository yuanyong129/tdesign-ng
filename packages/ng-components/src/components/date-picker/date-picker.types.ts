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
  | 'YYYY-[Q]Q'
  | 'YYYY-[W]WW'
  | 'YYYY-MM-DD'
  | 'YYYY-MM-DD HH'
  | 'YYYY-MM-DD HH:mm'
  | 'YYYY-MM-DD HH:mm:ss'
  | 'YYYY-MM-DD HH:mm:ss:SSS';

/**
 * @zh 可选范围：`[start, end]` 数组窗口，或返回是否可选的判断函数。
 * @en Selectable range: a `[start, end]` window or a predicate.
 */
export type DatePickerRange = DateValue[] | ((date: DateValue) => boolean);

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
 * @zh 预设日期：键为按钮文案，值为日期或返回日期的函数。
 * @en Preset dates: key is the button label, value is a date or a factory.
 */
export type PresetDate = Record<string, DateValue | (() => DateValue)>;

/**
 * @zh 预设日期的摆放位置。
 * @en Placement of the presets footer.
 */
export type PresetsPlacement = 'left' | 'top' | 'right' | 'bottom';

/**
 * @zh 面板初始年月，用于没有选中值时决定打开哪个月。
 * @en Initial panel year/month used when there is no selected value.
 */
export interface PanelActiveDate {
  /** @zh 年份，支持 Date / 时间戳 / `YYYY` 字符串 @en Year as Date, timestamp or `YYYY` string */
  year?: DateValue;
  /** @zh 月份，支持 1~12 的数字或日期 @en Month as 1~12 or a date */
  month?: DateValue;
}

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
  /** @zh 变化后的值，清空时为 ''；多选为数组 @en Value after change; '' when cleared; array in multiple mode */
  value: DatePickerValue | '';
  /** @zh 变化来源 @en Source of the change */
  trigger: DatePickerTrigger;
}

/**
 * @zh 选择器模式：日 / 周 / 月 / 季度 / 年。
 * @en Picker mode: date, week, month, quarter or year.
 */
export type DatePickerMode = 'date' | 'week' | 'month' | 'quarter' | 'year';

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

/**
 * @zh 自定义面板单元格的回调，返回要显示的字符串。
 * @en Callback for custom panel cells; returns the displayed string.
 */
export type DateMultipleValue = DateValue[];

/** 日期选择器的值：单选是单个值，多选是数组。 */
export type DatePickerValue = DateValue | DateMultipleValue;

export type DatePickerCellRender = (value: DateValue) => string;

/**
 * @zh 自定义输入框回显的回调，返回要显示的字符串。
 * @en Callback for custom input display; returns the displayed string.
 */
export type DatePickerValueDisplay = (value: DateValue, displayValue: string) => string;
