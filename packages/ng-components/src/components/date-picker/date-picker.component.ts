import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { TPopup } from '../popup';
import { TSelect } from '../select';
import {
  buildMonthCells,
  defaultFormat,
  endOfDay,
  formatDate,
  formatValue,
  isSameDay,
  parseDate,
  startOfDay,
  weekLabels,
} from './date-picker-utils';
import {
  DatePickerCell,
  DatePickerChangeEvent,
  DatePickerValueType,
  DateValue,
  DisableDate,
} from './date-picker.types';

const SIZE_CLASS: Record<'small' | 'medium' | 'large', string> = {
  small: 't-size-s',
  medium: '',
  large: 't-size-l',
};

/**
 * @zh 日期选择器，第一层支持单个日期。
 *
 * ```html
 * <t-date-picker [value]="value" (change)="value = $event.value" />
 * ```
 *
 * @en Date picker; the first layer supports a single date.
 */
@Component({
  selector: 't-date-picker',
  standalone: true,
  imports: [TPopup, TSelect],
  templateUrl: './date-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 't-date-picker' },
})
export class TDatePicker {
  /**
   * @zh 选中的日期，受控用法。
   * @en Selected date in controlled mode.
   */
  readonly value = input<DateValue | undefined>(undefined);

  /**
   * @zh 默认选中的日期，非受控用法。
   * @en Default selected date in uncontrolled mode.
   */
  readonly defaultValue = input<DateValue | undefined>(undefined);

  /**
   * @zh 回传值的格式：格式串 / time-stamp / Date。
   * @en Format of the emitted value: a format string, time-stamp or Date.
   * @defaultValue 'YYYY-MM-DD'
   * @values YYYY-MM-DD, YYYY-MM, YYYY, time-stamp, Date
   */
  readonly valueType = input<DatePickerValueType>('YYYY-MM-DD');

  /**
   * @zh 输入框里显示的日期格式，默认与 valueType 一致。
   * @en Display format in the input; defaults to valueType.
   */
  readonly format = input<string | undefined>(undefined);

  /**
   * @zh 周一作为一周的第一天（0 为周日）。
   * @en First day of the week (0 is Sunday).
   * @defaultValue 1
   */
  readonly firstDayOfWeek = input(1, { transform: numberAttribute });

  /**
   * @zh 禁用日期：精确日期数组、范围对象或判断函数。
   * @en Disabled dates: an array, a range object or a predicate.
   */
  readonly disableDate = input<DisableDate | undefined>(undefined);

  /**
   * @zh 是否可清空。
   * @en Whether the value can be cleared.
   * @defaultValue false
   */
  readonly clearable = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否禁用。
   * @en Whether the date picker is disabled.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 输入框尺寸。
   * @en Size of the input.
   * @defaultValue 'medium'
   * @values small, medium, large
   */
  readonly size = input<'small' | 'medium' | 'large'>('medium');

  /**
   * @zh 占位文案。
   * @en Placeholder text.
   * @defaultValue '请选择日期'
   */
  readonly placeholder = input('请选择日期');

  /** @zh 选中值变化 @en Emitted when the selected date changes */
  readonly change = output<DatePickerChangeEvent>();

  /** @zh 弹层显隐变化 @en Emitted when the popup visibility changes */
  readonly visibleChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<DateValue | undefined>(undefined);
  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth());

  protected readonly currentValue = computed<DateValue | undefined>(() => {
    if (this.value() !== undefined) return this.value();
    if (this.innerValue() !== undefined) return this.innerValue();
    return this.defaultValue();
  });

  /** 当前值解析出来的日期。 */
  protected readonly selectedDate = computed<Date | null>(() =>
    parseDate(this.currentValue(), this.valueType()),
  );

  protected readonly displayFormat = computed(
    () => this.format() ?? defaultFormat(this.valueType()),
  );

  protected readonly displayText = computed(() => {
    const date = this.selectedDate();
    return date ? formatDate(date, this.displayFormat()) : '';
  });

  protected readonly hasValue = computed(() => this.displayText().length > 0);

  protected readonly normalizedFirstDayOfWeek = computed(
    () => ((this.firstDayOfWeek() % 7) + 7) % 7,
  );

  protected readonly weekLabels = computed(() => weekLabels(this.normalizedFirstDayOfWeek()));

  protected readonly weeks = computed<DatePickerCell[][]>(() =>
    buildMonthCells(
      this.viewYear(),
      this.viewMonth(),
      this.normalizedFirstDayOfWeek(),
    ),
  );

  protected readonly monthOptions = computed(() =>
    Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1} 月`, value: index })),
  );

  protected readonly yearOptions = computed(() => {
    const year = this.viewYear();
    return Array.from({ length: 21 }, (_, index) => {
      const value = year - 10 + index;
      return { label: String(value), value };
    });
  });

  protected readonly inputClasses = computed(() => {
    const classes = ['t-input', 't-input--suffix'];
    const sizeClass = SIZE_CLASS[this.size()];
    if (sizeClass) classes.push(sizeClass);
    if (this.open()) classes.push('t-input--focused', 't-is-focused');
    if (this.disabled()) classes.push('t-is-disabled');
    return classes.join(' ');
  });

  protected readonly wrapperClasses = computed(() => {
    const classes = ['t-select-input'];
    if (this.open()) classes.push('t-select-input--popup-visible');
    if (!this.hasValue()) classes.push('t-select-input--empty');
    return classes.join(' ');
  });

  protected handleVisibleChange(visible: boolean): void {
    if (this.disabled()) return;
    this.open.set(visible);
    this.visibleChange.emit(visible);
    if (visible) this.syncViewToValue();
  }

  protected pickDate(cell: DatePickerCell): void {
    if (this.isCellDisabled(cell)) return;
    this.commit(formatValue(cell.date, this.valueType()), 'pick');
    this.open.set(false);
    this.visibleChange.emit(false);
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.commit('', 'clear');
    this.open.set(false);
    this.visibleChange.emit(false);
  }

  protected handleMonthChange(value: unknown): void {
    const month = Number(value);
    if (!Number.isNaN(month)) this.viewMonth.set(month);
  }

  protected handleYearChange(value: unknown): void {
    const year = Number(value);
    if (!Number.isNaN(year)) this.viewYear.set(year);
  }

  protected jumpMonth(offset: number): void {
    const next = new Date(this.viewYear(), this.viewMonth() + offset, 1);
    this.viewYear.set(next.getFullYear());
    this.viewMonth.set(next.getMonth());
  }

  protected jumpToToday(): void {
    const now = new Date();
    this.viewYear.set(now.getFullYear());
    this.viewMonth.set(now.getMonth());
  }

  protected isCellDisabled(cell: DatePickerCell): boolean {
    if (this.disabled()) return true;
    const disableDate = this.disableDate();
    if (!disableDate) return false;

    if (typeof disableDate === 'function') return disableDate(cell.date);

    if (Array.isArray(disableDate)) {
      return disableDate.some((value) => {
        const date = parseDate(value, this.valueType());
        return !!date && isSameDay(date, cell.date);
      });
    }

    const date = startOfDay(cell.date);
    const parseBound = (value: DateValue | undefined): Date | null =>
      value === undefined ? null : parseDate(value, this.valueType());

    const from = parseBound(disableDate.from);
    const to = parseBound(disableDate.to);
    const before = parseBound(disableDate.before);
    const after = parseBound(disableDate.after);

    if (from && date < startOfDay(from)) return true;
    if (to && date > endOfDay(to)) return true;
    if (before && date < startOfDay(before)) return true;
    if (after && date > endOfDay(after)) return true;
    return false;
  }

  protected cellClasses(cell: DatePickerCell): string {
    const classes = ['t-date-picker__cell'];
    const today = new Date();
    if (isSameDay(cell.date, today)) classes.push('t-date-picker__cell--now');
    if (this.selectedDate() && isSameDay(cell.date, this.selectedDate() as Date)) {
      classes.push('t-date-picker__cell--active');
    }
    if (this.isCellDisabled(cell)) classes.push('t-date-picker__cell--disabled');
    if (cell.additional) classes.push('t-date-picker__cell--additional');
    return classes.join(' ');
  }

  private commit(value: DateValue | '', trigger: DatePickerChangeEvent['trigger']): void {
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, trigger });
  }

  private syncViewToValue(): void {
    const date = this.selectedDate() ?? new Date();
    this.viewYear.set(date.getFullYear());
    this.viewMonth.set(date.getMonth());
  }
}
