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
} from '../date-picker/date-picker-utils';
import { DatePickerCell, DatePickerValueType, DateValue, DisableDate } from '../date-picker/date-picker.types';
import { DateRangePickerChangeEvent, DateRangeValue } from './date-range-picker.types';

const SIZE_CLASS: Record<'small' | 'medium' | 'large', string> = {
  small: 't-size-s',
  medium: '',
  large: 't-size-l',
};

type PanelSide = 'left' | 'right';

/**
 * @zh 日期范围选择器，一次选择开始与结束日期。
 *
 * ```html
 * <t-date-range-picker [value]="range" (change)="range = $event.value" />
 * ```
 *
 * @en Date range picker; selects a start and an end date.
 */
@Component({
  selector: 't-date-range-picker',
  standalone: true,
  imports: [TPopup, TSelect],
  templateUrl: './date-range-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 't-date-range-picker' },
})
export class TDateRangePicker {
  /**
   * @zh 选中的范围，受控用法。
   * @en Selected range in controlled mode.
   */
  readonly value = input<DateRangeValue | undefined>(undefined);

  /**
   * @zh 默认选中的范围，非受控用法。
   * @en Default range in uncontrolled mode.
   */
  readonly defaultValue = input<DateRangeValue | undefined>(undefined);

  /**
   * @zh 回传值的格式：格式串 / time-stamp / Date。
   * @en Format of the emitted value: a format string, time-stamp or Date.
   * @defaultValue 'YYYY-MM-DD'
   */
  readonly valueType = input<DatePickerValueType>('YYYY-MM-DD');

  /**
   * @zh 输入框显示的日期格式，默认与 valueType 一致。
   * @en Date format shown in the inputs; defaults to valueType.
   */
  readonly format = input<string | undefined>(undefined);

  /**
   * @zh 一周的起始日，0 为周日。
   * @en First day of the week; 0 means Sunday.
   * @defaultValue 1
   */
  readonly firstDayOfWeek = input(1, { transform: numberAttribute });

  /**
   * @zh 禁用日期，支持日期数组、范围对象与判断函数。
   * @en Disabled dates: an array, a range object or a predicate.
   */
  readonly disableDate = input<DisableDate | undefined>(undefined);

  /**
   * @zh 是否可清空。
   * @en Whether the range can be cleared.
   * @defaultValue false
   */
  readonly clearable = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否禁用。
   * @en Whether the picker is disabled.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 输入框尺寸。
   * @en Size of the inputs.
   * @defaultValue 'medium'
   * @values small, medium, large
   */
  readonly size = input<'small' | 'medium' | 'large'>('medium');

  /**
   * @zh 两个输入框的占位文案。
   * @en Placeholders of the two inputs.
   * @defaultValue ['开始日期', '结束日期']
   */
  readonly placeholder = input<string | [string, string]>(['开始日期', '结束日期']);

  /** @zh 选中范围变化 @en Emitted when the selected range changes */
  readonly change = output<DateRangePickerChangeEvent>();

  /** @zh 弹层显隐变化 @en Emitted when the popup visibility changes */
  readonly visibleChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<DateRangeValue | undefined>(undefined);
  private readonly pendingStart = signal<Date | null>(null);
  private readonly pendingEnd = signal<Date | null>(null);
  protected readonly hoverDate = signal<Date | null>(null);

  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth());

  protected readonly currentValue = computed<DateRangeValue>(() => {
    if (this.value() !== undefined) return this.value() as DateRangeValue;
    if (this.innerValue() !== undefined) return this.innerValue() as DateRangeValue;
    return (this.defaultValue() ?? []) as DateRangeValue;
  });

  protected readonly committedStart = computed<Date | null>(() =>
    parseDate(this.currentValue()[0], this.valueType()),
  );

  protected readonly committedEnd = computed<Date | null>(() =>
    parseDate(this.currentValue()[1], this.valueType()),
  );

  protected readonly startDate = computed<Date | null>(
    () => this.pendingStart() ?? this.committedStart(),
  );

  protected readonly endDate = computed<Date | null>(() => {
    if (this.pendingStart()) return this.pendingEnd();
    return this.committedEnd();
  });

  /** 高亮区间的终点：未选结束时跟随 hover。 */
  protected readonly highlightEnd = computed<Date | null>(
    () => this.endDate() ?? this.hoverDate(),
  );

  protected readonly hasValue = computed(
    () => !!this.startDate() || !!this.endDate(),
  );

  protected readonly displayFormat = computed(
    () => this.format() ?? defaultFormat(this.valueType()),
  );

  protected readonly startText = computed(() => {
    const date = this.committedStart();
    return date ? formatDate(date, this.displayFormat()) : '';
  });

  protected readonly endText = computed(() => {
    const date = this.committedEnd();
    return date ? formatDate(date, this.displayFormat()) : '';
  });

  protected readonly startPlaceholder = computed(() => {
    const placeholder = this.placeholder();
    return Array.isArray(placeholder) ? placeholder[0] : placeholder;
  });

  protected readonly endPlaceholder = computed(() => {
    const placeholder = this.placeholder();
    return Array.isArray(placeholder) ? placeholder[1] : placeholder;
  });

  protected readonly startFocused = computed(
    () => this.open() && !this.pendingStart(),
  );

  protected readonly endFocused = computed(
    () => this.open() && !!this.pendingStart() && !this.pendingEnd(),
  );

  protected readonly rangeInputClasses = computed(() => {
    const classes = ['t-range-input'];
    const sizeClass = SIZE_CLASS[this.size()];
    if (sizeClass) classes.push(sizeClass);
    if (this.open()) classes.push('t-is-focused');
    if (this.disabled()) classes.push('t-is-disabled');
    classes.push('t-range-input--suffix');
    return classes.join(' ');
  });

  protected readonly popupClasses = computed(() => {
    const classes = ['t-range-input-popup'];
    if (this.open()) classes.push('t-range-input-popup--visible');
    return classes.join(' ');
  });

  protected readonly rightYear = signal(new Date().getFullYear());

  protected readonly rightMonth = signal(new Date().getMonth());

  protected readonly normalizedFirstDayOfWeek = computed(
    () => ((this.firstDayOfWeek() % 7) + 7) % 7,
  );

  protected readonly weekLabels = computed(() => weekLabels(this.normalizedFirstDayOfWeek()));

  protected readonly leftWeeks = computed<DatePickerCell[][]>(() =>
    buildMonthCells(this.viewYear(), this.viewMonth(), this.normalizedFirstDayOfWeek()),
  );

  protected readonly rightWeeks = computed<DatePickerCell[][]>(() =>
    buildMonthCells(this.rightYear(), this.rightMonth(), this.normalizedFirstDayOfWeek()),
  );

  protected readonly monthOptions = computed(() =>
    Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1} 月`, value: index })),
  );

  protected readonly leftYearOptions = computed(() => this.buildYearOptions(this.viewYear()));
  protected readonly rightYearOptions = computed(() => this.buildYearOptions(this.rightYear()));

  protected handleVisibleChange(visible: boolean): void {
    if (this.disabled()) return;
    this.open.set(visible);
    this.visibleChange.emit(visible);
    if (!visible) {
      this.pendingStart.set(null);
      this.pendingEnd.set(null);
      this.hoverDate.set(null);
      return;
    }

    this.pendingStart.set(null);
    this.pendingEnd.set(null);
    const start = this.committedStart() ?? new Date();
    this.viewYear.set(start.getFullYear());
    this.viewMonth.set(start.getMonth());
    const next = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    this.rightYear.set(next.getFullYear());
    this.rightMonth.set(next.getMonth());
  }

  protected selectDate(cell: DatePickerCell): void {
    if (this.isDateDisabled(cell.date)) return;

    const start = this.pendingStart();
    if (!start) {
      this.pendingStart.set(cell.date);
      this.pendingEnd.set(null);
      return;
    }
    if (!this.pendingEnd()) {
      const end = cell.date;
      const normalizedStart = end < start ? end : start;
      const normalizedEnd = end < start ? start : end;
      this.commitRange(normalizedStart, normalizedEnd);
      return;
    }

    this.pendingStart.set(cell.date);
    this.pendingEnd.set(null);
  }

  protected handleCellEnter(cell: DatePickerCell): void {
    if (this.pendingStart() && !this.pendingEnd() && !this.isDateDisabled(cell.date)) {
      this.hoverDate.set(cell.date);
    }
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.commit([], 'clear');
    this.closePanel();
  }

  protected jumpPanel(side: PanelSide, delta: number): void {
    if (side === 'left') {
      const date = new Date(this.viewYear(), this.viewMonth() + delta, 1);
      this.viewYear.set(date.getFullYear());
      this.viewMonth.set(date.getMonth());
      if (
        this.rightYear() < date.getFullYear() ||
        (this.rightYear() === date.getFullYear() && this.rightMonth() <= date.getMonth())
      ) {
        const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        this.rightYear.set(next.getFullYear());
        this.rightMonth.set(next.getMonth());
      }
      return;
    }

    const date = new Date(this.rightYear(), this.rightMonth() + delta, 1);
    this.rightYear.set(date.getFullYear());
    this.rightMonth.set(date.getMonth());
  }

  protected jumpPanelToToday(side: PanelSide): void {
    const today = new Date();
    if (side === 'left') {
      this.viewYear.set(today.getFullYear());
      this.viewMonth.set(today.getMonth());
      const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      this.rightYear.set(next.getFullYear());
      this.rightMonth.set(next.getMonth());
      return;
    }
    this.rightYear.set(today.getFullYear());
    this.rightMonth.set(today.getMonth());
  }

  protected jumpPanelToMonth(side: PanelSide, month: unknown): void {
    const value = Number(month);
    if (side === 'left') this.viewMonth.set(value);
    else this.rightMonth.set(value);
  }

  protected jumpPanelToYear(side: PanelSide, year: unknown): void {
    const value = Number(year);
    if (side === 'left') this.viewYear.set(value);
    else this.rightYear.set(value);
  }

  protected cellClasses(cell: DatePickerCell): string {
    const classes = ['t-date-picker__cell'];
    const start = this.startDate();
    const end = this.endDate();
    const highlightEnd = this.highlightEnd();

    if (isSameDay(cell.date, new Date())) classes.push('t-date-picker__cell--now');
    if (start && isSameDay(cell.date, start)) {
      classes.push('t-date-picker__cell--active', 't-date-picker__cell--active-start');
    }
    if (end && isSameDay(cell.date, end)) {
      classes.push('t-date-picker__cell--active', 't-date-picker__cell--active-end');
    }
    if (start && highlightEnd && cell.date > startOfDay(start) && cell.date < startOfDay(highlightEnd)) {
      classes.push('t-date-picker__cell--highlight');
    }
    if (
      this.hoverDate() &&
      !end &&
      start &&
      isSameDay(cell.date, this.hoverDate() as Date)
    ) {
      classes.push('t-date-picker__cell--hover-highlight');
    }
    if (this.isDateDisabled(cell.date)) classes.push('t-date-picker__cell--disabled');
    if (cell.additional) classes.push('t-date-picker__cell--additional');
    return classes.join(' ');
  }

  protected isDateDisabled(date: Date): boolean {
    const disableDate = this.disableDate();
    if (!disableDate) return false;

    if (typeof disableDate === 'function') return disableDate(date);

    if (Array.isArray(disableDate)) {
      return disableDate.some((item) => {
        const parsed = parseDate(item, this.valueType());
        return parsed ? isSameDay(parsed, date) : false;
      });
    }

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

  private commitRange(start: Date, end: Date): void {
    this.commit(
      [formatValue(start, this.valueType()), formatValue(end, this.valueType())],
      'pick',
    );
    this.closePanel();
  }

  private commit(value: DateRangeValue, trigger: DateRangePickerChangeEvent['trigger']): void {
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, trigger });
  }

  private closePanel(): void {
    this.pendingStart.set(null);
    this.pendingEnd.set(null);
    this.hoverDate.set(null);
    this.open.set(false);
    this.visibleChange.emit(false);
  }

  private buildYearOptions(year: number): Array<{ label: string; value: number }> {
    return Array.from({ length: 21 }, (_, index) => {
      const value = year - 10 + index;
      return { label: String(value), value };
    });
  }
}
