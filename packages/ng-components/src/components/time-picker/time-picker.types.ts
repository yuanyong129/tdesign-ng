/**
 * @zh 时间值，形如 `12:30:00`（具体格式由 `format` 决定）。
 * @en Time value like `12:30:00`; the exact shape follows `format`.
 */
export type TimePickerValue = string;

/**
 * @zh 时间选择的变化来源。
 * @en Source of a time picker change.
 */
export type TimePickerTrigger = 'confirm' | 'clear' | 'now';

/**
 * @zh 时间选择的变化事件。
 * @en Time picker change event.
 */
export interface TimePickerChangeEvent {
  /** @zh 变化后的值，清空时为 null @en Value after change; null when cleared */
  value: TimePickerValue | null;
  /** @zh 变化来源 @en Source of the change */
  trigger: TimePickerTrigger;
}

/** @zh 时间列的类型 @en Type of a time column */
export type TimePickerColumnType = 'hour' | 'minute' | 'second';

/**
 * @zh 时间面板的一列。
 * @en One column of the time panel.
 */
export interface TimePickerColumn {
  /** @zh 列类型 @en Column type */
  type: TimePickerColumnType;
  /** @zh 该列的候选项（两位数字符串） @en Candidates of the column (two-digit strings) */
  items: string[];
}

/**
 * @zh 时间值的各部分组成。
 * @en Parsed parts of a time value.
 */
export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

/**
 * @zh 预设时间：键为按钮文案，值为时间或返回时间的函数。
 * @en Preset times: key is the button label, value is a time or a factory.
 */
export type PresetTime = Record<string, TimePickerValue | (() => TimePickerValue)>;

/**
 * @zh 各列被禁用的候选值。
 * @en Disabled candidates of each column.
 */
export interface DisableTimeResult {
  hour?: number[];
  minute?: number[];
  second?: number[];
  millisecond?: number[];
}

/**
 * @zh 禁用时间的判断函数，返回每列需要禁用的候选值。
 * @en Predicate returning the candidates to disable for each column.
 */
export type DisableTime = (
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
) => DisableTimeResult | undefined;
