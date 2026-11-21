import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
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
  parseDateByFormat,
  startOfDay,
  weekLabels,
} from '../date-picker/date-picker-utils';
import { DatePickerCell, DatePickerValueType, DateValue, DisableDate } from '../date-picker/date-picker.types';
import { DateRangePickerChangeEvent, DateRangeValue, PresetDateRange } from './date-range-picker.types';
import { PresetsPlacement } from '../date-picker/date-picker.types';

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
  imports: [NgTemplateOutlet, TPopup, TSelect],
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

  /**
   * @zh 预设范围：键为按钮文案，值为范围或返回范围的函数。
   * @en Preset ranges: key is the button label, value is a range or a factory.
   */
  readonly presets = input<PresetDateRange | undefined>(undefined);

  /**
   * @zh 预设范围的摆放位置。
   * @en Placement of the presets footer.
   * @defaultValue 'bottom'
   * @values left, top, right, bottom
   */
  readonly presetsPlacement = input<PresetsPlacement>('bottom');

  /**
   * @zh 是否允许在输入框里直接输入日期（Enter / 失焦提交）。
   * @en Whether dates can be typed in the inputs (committed on Enter or blur).
   * @defaultValue false
   */
  readonly allowInput = input(false, { transform: booleanAttribute });

  /**
   * @zh 两个输入框之间的分隔符。
   * @en Separator between the two inputs.
   * @defaultValue '-'
   */
  readonly separator = input('-');

  /**
   * @zh 限制可选的日期范围：日期区间数组 / 区间数组的数组 / 判断函数。
   * @en Restrict selectable dates: a range array, an array of ranges, or a predicate.
   */
  readonly range = input<DateValue[] | Array<DateValue[]> | ((date: DateValue) => boolean) | undefined>(
    undefined,
  );

  /**
   * @zh 前置标签文案。
   * @en Label shown before the inputs.
   */
  readonly label = input<string | undefined>(undefined);

  /**
   * @zh 提示文案。
   * @en Tips below the input.
   */
  readonly tips = input<string | undefined>(undefined);

  /**
   * @zh 校验状态。
   * @en Validation status.
   * @defaultValue 'default'
   * @values default, success, warning, error
   */
  readonly status = input<'default' | 'success' | 'warning' | 'error'>('default');

  /**
   * @zh 无边框模式。
   * @en Borderless mode.
   * @defaultValue false
   */
  readonly borderless = input(false, { transform: booleanAttribute });

  /**
   * @zh 只读状态（不可编辑、不可展开面板）。
   * @en Readonly state (not editable and the panel cannot open).
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @zh 选中范围变化 @en Emitted when the selected range changes */
  readonly change = output<DateRangePickerChangeEvent>();

  /** @zh 弹层显隐变化 @en Emitted when the popup visibility changes */
  readonly visibleChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<DateRangeValue | undefined>(undefined);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly pendingStart = signal<Date | null>(null);
  private readonly pendingEnd = signal<Date | null>(null);
  protected readonly hoverDate = signal<Date | null>(null);
  private readonly draftStartText = signal<string | null>(null);
  private readonly draftEndText = signal<string | null>(null);

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
    if (this.draftStartText() !== null) return this.draftStartText() as string;
    const date = this.committedStart();
    return date ? formatDate(date, this.displayFormat()) : '';
  });

  protected readonly endText = computed(() => {
    if (this.draftEndText() !== null) return this.draftEndText() as string;
    const date = this.committedEnd();
    return date ? formatDate(date, this.displayFormat()) : '';
  });

  protected readonly presetEntries = computed(() =>
    Object.entries(this.presets() ?? {}).map(([key, value]) => ({ key, value })),
  );

  protected readonly isRowPlacement = computed(
    () => this.presetsPlacement() === 'left' || this.presetsPlacement() === 'right',
  );

  protected readonly presetsAtTop = computed(() => {
    const placement = this.presetsPlacement();
    return placement === 'top' || placement === 'left';
  });

  protected readonly presetsAtBottom = computed(() => {
    const placement = this.presetsPlacement();
    return placement === 'bottom' || placement === 'right';
  });

  protected readonly footerClasses = computed(
    () => `t-date-picker__footer t-date-picker__footer--${this.presetsPlacement()}`,
  );

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
    if (this.readonly()) classes.push('t-is-readonly');
    if (this.borderless()) classes.push('t-range-input--borderless');
    if (this.status() !== 'default') classes.push(`t-is-${this.status()}`);
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
    this.pendingStart.set(null);
    this.pendingEnd.set(null);
    this.hoverDate.set(null);
    this.draftStartText.set(null);
    this.draftEndText.set(null);
    if (visible) this.syncPanelsOnOpen();
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
      if (end < start) this.commitRange(end, start);
      else this.commitRange(start, end);
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

  protected handleInputText(side: 'start' | 'end', event: Event): void {
    if (!this.allowInput() || this.disabled()) return;
    const value = (event.target as HTMLInputElement).value;
    if (side === 'start') this.draftStartText.set(value);
    else this.draftEndText.set(value);
    if (!this.open()) this.openFromInput();
  }

  protected handleInputClick(event: MouseEvent): void {
    if (!this.allowInput()) return;
    event.stopPropagation();
    if (this.disabled()) return;
    if (!this.open()) this.openFromInput();
  }

  protected handleInputEnter(): void {
    if (!this.allowInput()) return;
    this.commitTypedRange();
  }

  protected handleInputBlur(): void {
    if (!this.allowInput()) return;
    if (this.draftStartText() !== null || this.draftEndText() !== null) this.commitTypedRange();
  }

  protected applyPreset(preset: { key: string; value: DateRangeValue | (() => DateRangeValue) }): void {
    const raw = typeof preset.value === 'function' ? preset.value() : preset.value;
    const start = parseDate(raw[0], this.valueType());
    const end = parseDate(raw[1], this.valueType());
    if (!start || !end) return;
    this.commitRange(end < start ? end : start, end < start ? start : end, 'preset');
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
    const range = this.range();
    if (range !== undefined && this.isOutsideRange(range, date)) return true;

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

  /** 判断某个日期是否落在 `range` 限定的可选范围内。 */
  private isOutsideRange(range: unknown, date: Date): boolean {
    if (typeof range === 'function') {
      return !(range as (value: DateValue) => boolean)(date);
    }

    if (!Array.isArray(range) || range.length === 0) return false;

    const windows: DateValue[][] = Array.isArray(range[0])
      ? (range as DateValue[][])
      : [range as DateValue[]];

    return !windows.some(([from, to]) => {
      const start = parseDate(from, this.valueType());
      const end = parseDate(to, this.valueType());
      if (!start || !end) return false;
      return date >= startOfDay(start) && date <= endOfDay(end);
    });
  }

  private commitRange(
    start: Date,
    end: Date,
    trigger: DateRangePickerChangeEvent['trigger'] = 'pick',
  ): void {
    this.commit(
      [formatValue(start, this.valueType()), formatValue(end, this.valueType())],
      trigger,
    );
    this.closePanel();
  }

  /** 从输入框直接打开面板（不重置用户正在输入的内容）。 */
  private openFromInput(): void {
    this.open.set(true);
    this.visibleChange.emit(true);
    this.pendingStart.set(null);
    this.pendingEnd.set(null);
    this.syncPanelsOnOpen();
  }

  private syncPanelsOnOpen(): void {
    const start = this.committedStart() ?? new Date();
    this.viewYear.set(start.getFullYear());
    this.viewMonth.set(start.getMonth());
    const next = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    this.rightYear.set(next.getFullYear());
    this.rightMonth.set(next.getMonth());
  }

  /** 提交手输的两个日期；非法时回退到已提交值。 */
  private commitTypedRange(): void {
    const startText = this.draftStartText() ?? this.startText();
    const endText = this.draftEndText() ?? this.endText();
    this.draftStartText.set(null);
    this.draftEndText.set(null);

    const start = parseDateByFormat(startText, this.displayFormat());
    const end = parseDateByFormat(endText, this.displayFormat());
    if (!start || !end) {
      this.syncInputDom();
      return;
    }

    const orderedStart = end < start ? end : start;
    const orderedEnd = end < start ? start : end;
    this.commitRange(orderedStart, orderedEnd, 'enter');
  }

  /** 手输内容可能非法，这里强制把 DOM 值同步回显示值。 */
  private syncInputDom(): void {
    const inputs = this.hostRef.nativeElement.querySelectorAll<HTMLInputElement>(
      '.t-range-input__inner input',
    );
    if (inputs[0]) inputs[0].value = this.startText();
    if (inputs[1]) inputs[1].value = this.endText();
  }

  private commit(value: DateRangeValue, trigger: DateRangePickerChangeEvent['trigger']): void {
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, trigger });
  }

  private closePanel(): void {
    this.pendingStart.set(null);
    this.pendingEnd.set(null);
    this.hoverDate.set(null);
    this.draftStartText.set(null);
    this.draftEndText.set(null);
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
