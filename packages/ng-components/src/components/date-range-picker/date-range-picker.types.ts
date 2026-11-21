import { DateValue } from '../date-picker/date-picker.types';

/**
 * @zh 日期范围值：`[开始日期, 结束日期]`，未选择时为空数组。
 * @en Date range value: `[start, end]`, empty array when nothing is selected.
 */
export type DateRangeValue = DateValue[];

/**
 * @zh 日期范围变化来源。
 * @en Source of a date range change.
 */
export type DateRangePickerTrigger = 'pick' | 'clear' | 'preset' | 'enter';

/**
 * @zh 日期范围变化事件。
 * @en Date range change event.
 */
export interface DateRangePickerChangeEvent {
  /** @zh 变化后的范围值 @en Range value after the change */
  value: DateRangeValue;
  /** @zh 变化来源 @en Source of the change */
  trigger: DateRangePickerTrigger;
}

/**
 * @zh 预设范围：键为按钮文案，值为范围或返回范围的函数。
 * @en Preset ranges: key is the button label, value is a range or a factory.
 */
export type PresetDateRange = Record<string, DateRangeValue | (() => DateRangeValue)>;
