import { NgTemplateOutlet } from '@angular/common';
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
import { TTag } from '../tag';
import {
  buildTimeColumns,
  formatTimeParts,
  parseTimeParts,
} from '../time-picker/time-picker-utils';
import { TimePickerColumn, TimePickerColumnType } from '../time-picker/time-picker.types';
import {
  buildMonthCells,
  buildQuarterCells,
  buildWeekRows,
  defaultFormat,
  endOfDay,
  formatDate,
  formatValue,
  isSameDay,
  isoWeekOf,
  isoWeekStart,
  parseDate,
  parseDateByFormat,
  startOfDay,
  weekLabels,
} from './date-picker-utils';
import {
  DatePickerCell,
  DatePickerCellRender,
  DatePickerChangeEvent,
  DatePickerMode,
  DatePickerRange,
  DatePickerValue,
  DatePickerValueDisplay,
  DatePickerValueType,
  DateMultipleValue,
  DateValue,
  DisableDate,
  PanelActiveDate,
  PresetDate,
  PresetsPlacement,
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
  imports: [NgTemplateOutlet, TPopup, TSelect, TTag],
  templateUrl: './date-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 't-date-picker',
    '[class.t-date-picker--multiple]': 'multiple()',
  },
})
export class TDatePicker {
  /**
   * @zh 选中的日期，受控用法。
   * @en Selected date in controlled mode.
   */
  readonly value = input<DatePickerValue | undefined>(undefined);

  /**
   * @zh 默认选中的日期，非受控用法。
   * @en Default selected date in uncontrolled mode.
   */
  readonly defaultValue = input<DatePickerValue | undefined>(undefined);

  /**
   * @zh 回传值的格式：格式串 / time-stamp / Date；不传时按是否带时间推导。
   * @en Format of the emitted value: a format string, time-stamp or Date; derived when omitted.
   * @defaultValue undefined
   */
  readonly valueType = input<DatePickerValueType | undefined>(undefined);

  /**
   * @zh 选择器模式：日期 / 周 / 月份 / 季度 / 年份。
   * @en Picker mode: date, week, month, quarter or year.
   * @defaultValue 'date'
   * @values date, week, month, quarter, year
   */
  readonly mode = input<DatePickerMode>('date');

  /**
   * @zh 是否多选：开启后值为数组，输入框以标签展示，点击日期可切换选中。
   * @en Whether multiple dates can be selected; the value becomes an array.
   * @defaultValue false
   */
  readonly multiple = input(false, { transform: booleanAttribute });

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
   * @zh 可选范围：`[start, end]` 数组窗口，或返回是否可选的判断函数。
   * @en Selectable range: a `[start, end]` window or a predicate.
   * @defaultValue undefined
   */
  readonly range = input<DatePickerRange | undefined>(undefined);
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

  /**
   * @zh 预设日期：键为按钮文案，值为日期或返回日期的函数。
   * @en Preset dates: key is the button label, value is a date or a factory.
   */
  readonly presets = input<PresetDate | undefined>(undefined);

  /**
   * @zh 预设日期的摆放位置。
   * @en Placement of the presets footer.
   * @defaultValue 'bottom'
   * @values left, top, right, bottom
   */
  readonly presetsPlacement = input<PresetsPlacement>('bottom');

  /**
   * @zh 没有选中值时，面板初始显示的年月。
   * @en Initial panel year/month when there is no selected value.
   */
  readonly panelActiveDate = input<PanelActiveDate | undefined>(undefined);

  /**
   * @zh 是否允许在输入框里直接输入日期（按 Enter 或失焦提交）。
   * @en Whether the date can be typed in the input (committed on Enter or blur).
   * @defaultValue false
   */
  readonly allowInput = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否允许选择时间（面板右侧出现时 / 分 / 秒列）。
   * @en Whether time can be selected (hour / minute / second columns appear).
   * @defaultValue false
   */
  readonly enableTimePicker = input(false, { transform: booleanAttribute });

  /**
   * @zh 打开面板时未指定时间时使用的默认时间。
   * @en Default time used when the value has no time part.
   * @defaultValue '00:00:00'
   */
  readonly defaultTime = input('00:00:00');

  /**
   * @zh 是否点「确定」后才提交（开启时间选择时生效）。
   * @en Whether the value is committed only after clicking confirm (with time selection).
   * @defaultValue true
   */
  readonly needConfirm = input(true, { transform: booleanAttribute });

  /**
   * @zh 自定义面板单元格文案：回调收到该格的日期值，返回要显示的字符串。
   * @en Custom panel cell text: receives the cell value and returns the displayed string.
   * @defaultValue undefined
   */
  readonly cell = input<DatePickerCellRender | undefined>(undefined);

  /**
   * @zh 自定义输入框回显：回调收到当前值与默认回显文本，返回要显示的字符串。
   * @en Custom input display: receives the value and the default text, returns the displayed string.
   * @defaultValue undefined
   */
  readonly valueDisplay = input<DatePickerValueDisplay | undefined>(undefined);

  /** @zh 选中值变化 @en Emitted when the selected date changes */
  readonly change = output<DatePickerChangeEvent>();

  /** @zh 弹层显隐变化 @en Emitted when the popup visibility changes */
  readonly visibleChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<DatePickerValue | undefined>(undefined);
  private readonly draftText = signal<string | null>(null);
  private readonly draftDate = signal<Date | null>(null);
  private readonly draftTime = signal('');
  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth());

  protected readonly currentValue = computed<DatePickerValue | undefined>(() => {
    if (this.value() !== undefined) return this.value();
    if (this.innerValue() !== undefined) return this.innerValue();
    return this.defaultValue();
  });

  /** 多选模式下的值列表（单选模式返回单元素或空数组）。 */
  protected readonly values = computed<DateValue[]>(() => {
    const value = this.currentValue();
    if (value === undefined || value === '') return [];
    return Array.isArray(value) ? value : [value];
  });

  /** 单选模式下用于解析/高亮的值。 */
  protected readonly firstValue = computed<DateValue | undefined>(() => this.values()[0]);

  /** 实际使用的回传格式；未显式指定时按模式 / 是否带时间推导。 */
  protected readonly effectiveValueType = computed<DatePickerValueType>(() => {
    if (this.valueType()) return this.valueType() as DatePickerValueType;
    if (this.mode() === 'year') return 'YYYY';
    if (this.mode() === 'month') return 'YYYY-MM';
    if (this.mode() === 'quarter') return 'YYYY-[Q]Q';
    if (this.mode() === 'week') return 'YYYY-[W]WW';
    return this.isTimeMode() ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
  });

  /** 时间选择只在日期模式下生效。 */
  protected readonly isTimeMode = computed(
    () => this.enableTimePicker() && this.mode() === 'date' && !this.multiple(),
  );

  /** 当前值解析出来的日期。 */
  protected readonly selectedDate = computed<Date | null>(() =>
    parseDate(this.firstValue(), this.effectiveValueType()),
  );

  /** 面板里高亮的日期：时间模式下用草稿日期，否则用已提交值。 */
  protected readonly activeDate = computed<Date | null>(() =>
    this.isTimeMode() && this.open() ? this.draftDate() : this.selectedDate(),
  );

  protected readonly displayFormat = computed(() => {
    if (this.format()) return this.format() as string;
    if (this.mode() === 'year') return 'YYYY';
    if (this.mode() === 'month') return 'YYYY-MM';
    if (this.mode() === 'quarter') return 'YYYY-[Q]Q';
    if (this.mode() === 'week') return 'YYYY-[W]WW';
    const valueType = this.effectiveValueType();
    if (valueType === 'Date' || valueType === 'time-stamp') {
      return this.isTimeMode() ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
    }
    return defaultFormat(valueType);
  });

  /** 时间面板使用的格式：取显示格式里的时间 token，缺省 HH:mm:ss。 */
  protected readonly timeFormat = computed(() => {
    const tokens = this.displayFormat().match(/HH|mm|ss/g);
    return tokens?.length ? tokens.join(':') : 'HH:mm:ss';
  });

  protected readonly timeColumns = computed<TimePickerColumn[]>(() =>
    buildTimeColumns(this.timeFormat(), [1, 1, 1]),
  );

  protected readonly draftTimeParts = computed(() =>
    parseTimeParts(this.draftTime(), this.timeFormat()),
  );

  protected readonly timeViewerText = computed(() =>
    formatTimeParts(this.draftTimeParts(), this.timeFormat()),
  );

  protected readonly showFooter = computed(
    () => this.presetEntries().length > 0 || (this.isTimeMode() && this.needConfirm()),
  );

  protected readonly displayText = computed(() => {
    const date = this.selectedDate();
    return date ? formatDate(date, this.displayFormat()) : '';
  });

  protected readonly hasValue = computed(() =>
    this.multiple() ? this.values().length > 0 : this.displayText().length > 0,
  );

  /** 多选时输入框里展示的标签。 */
  protected readonly tagItems = computed(() =>
    this.values().map((value) => ({
      value,
      text: formatDate(parseDate(value, this.effectiveValueType()) ?? new Date(), this.displayFormat()),
    })),
  );

  /** 输入框回显：valueDisplay 可改写默认文本。 */
  protected readonly valueDisplayText = computed(() => {
    const text = this.displayText();
    const render = this.valueDisplay();
    const raw = this.currentValue();
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!render || !text || value === undefined) return text;
    return render(value, text);
  });

  /** 允许输入时优先显示用户正在输入的文本。 */
  protected readonly inputDisplayText = computed(() =>
    this.multiple() ? (this.draftText() ?? '') : (this.draftText() ?? this.valueDisplayText()),
  );

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

  protected readonly panelClass = computed(() => `t-date-picker__panel-${this.mode()}`);

  /** 月份面板的 12 个月，按 3 个一行分块。 */
  protected readonly monthRows = computed(() => {
    const selected = this.selectedDate();
    const cells = Array.from({ length: 12 }, (_, month) => ({
      month,
      label: `${month + 1} 月`,
      active:
        !!selected &&
        selected.getFullYear() === this.viewYear() &&
        selected.getMonth() === month,
    }));
    return this.chunkRows(cells, 3);
  });

  protected readonly decadeStart = computed(() => Math.floor(this.viewYear() / 10) * 10);

  /** 周面板：整月 6 行，每行带 ISO 周号与是否选中。 */
  protected readonly weekRows = computed(() => {
    const selected = this.selectedDate();
    const selectedWeek = selected ? isoWeekOf(selected) : null;
    return buildWeekRows(this.weeks()).map((row) => ({
      week: row.week,
      weekYear: row.weekYear,
      cells: row.cells,
      disabled: row.cells.every((cell) => this.isCellDisabled(cell)),
      active:
        !!selectedWeek && selectedWeek.year === row.weekYear && selectedWeek.week === row.week,
    }));
  });

  /** 周面板表头：首列「周」，其余星期标签。 */
  protected readonly weekHeaderLabels = computed(() => ['周', ...this.weekLabels()]);

  /** 季度面板：一年 4 个季度，一行展示。 */
  protected readonly quarterRows = computed(() => {
    const selected = this.selectedDate();
    const cells = buildQuarterCells(this.viewYear()).map((cell) => ({
      ...cell,
      active:
        !!selected &&
        selected.getFullYear() === this.viewYear() &&
        Math.floor(selected.getMonth() / 3) === cell.quarter - 1,
    }));
    return this.chunkRows(cells, 4);
  });

  /** 年份面板的 12 年（当前十年），按 3 个一行分块。 */
  protected readonly yearRows = computed(() => {
    const selected = this.selectedDate();
    const start = this.decadeStart();
    const cells = Array.from({ length: 12 }, (_, index) => {
      const year = start + index;
      return { year, label: String(year), active: !!selected && selected.getFullYear() === year };
    });
    return this.chunkRows(cells, 3);
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
    this.draftText.set(null);
    if (!visible) return;

    const selected = this.selectedDate();
    this.draftDate.set(selected);
    this.draftTime.set(
      selected
        ? formatTimeParts(
            { hour: selected.getHours(), minute: selected.getMinutes(), second: selected.getSeconds() },
            this.timeFormat(),
          )
        : this.defaultTime(),
    );
    this.syncViewToValue();
    if (this.isTimeMode()) this.scheduleScrollTime();
  }

  protected handleInputText(event: Event): void {
    if (!this.allowInput() || this.disabled()) return;
    this.draftText.set((event.target as HTMLInputElement).value);
    if (!this.open()) this.openPanel();
  }

  protected handleInputClick(event: MouseEvent): void {
    if (!this.allowInput()) return;
    // 允许输入时点击输入框只负责打开面板，不触发 TPopup 的收起
    event.stopPropagation();
    if (this.disabled()) return;
    if (!this.open()) this.openPanel();
  }

  protected handleInputEnter(event: Event): void {
    if (!this.allowInput()) return;
    this.commitDraft(true);
    // 手输的内容可能是非法的，这里强制把 DOM 值同步回已提交的显示值
    (event.target as HTMLInputElement).value = this.displayText();
  }

  protected handleInputBlur(event: Event): void {
    if (!this.allowInput()) return;
    if (this.draftText() !== null) this.commitDraft(false);
    (event.target as HTMLInputElement).value = this.displayText();
  }

  protected applyPreset(preset: { key: string; value: DateValue | (() => DateValue) }): void {
    const raw = typeof preset.value === 'function' ? preset.value() : preset.value;
    const date = parseDate(raw, this.effectiveValueType());
    if (!date) return;
    this.commit(formatValue(date, this.effectiveValueType()), 'preset');
    this.closePanel();
  }

  protected pickDate(cell: DatePickerCell): void {
    if (this.isCellDisabled(cell)) return;

    if (this.multiple()) {
      const value = formatValue(cell.date, this.effectiveValueType());
      const exists = this.values().some((item) => {
        const date = parseDate(item, this.effectiveValueType());
        return !!date && isSameDay(date, cell.date);
      });
      const next = exists ? this.values().filter((item) => item !== value) : [...this.values(), value];
      this.commit(next, 'pick');
      return;
    }

    if (this.isTimeMode()) {
      this.draftDate.set(cell.date);
      if (!this.needConfirm()) {
        this.commit(this.combinedValue(cell.date), 'pick');
        this.closePanel();
      }
      return;
    }

    this.commit(formatValue(cell.date, this.effectiveValueType()), 'pick');
    this.closePanel();
  }

  protected selectTime(type: TimePickerColumnType, item: string): void {
    const parts = { ...this.draftTimeParts(), [type]: Number(item) };
    this.draftTime.set(formatTimeParts(parts, this.timeFormat()));
  }

  protected timeItemClasses(type: TimePickerColumnType, item: string): string {
    return [
      't-time-picker__panel-body-scroll-item',
      Number(item) === this.draftTimeParts()[type] ? 't-is-current' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  /** 时间模式下点「确定」：合并草稿日期与时间后提交。 */
  protected confirmTime(): void {
    const date = this.draftDate();
    if (!date || this.disabled()) return;
    this.commit(this.combinedValue(date), 'confirm');
    this.closePanel();
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.commit(this.multiple() ? [] : '', 'clear');
    this.closePanel();
  }

  protected removeTag(value: DateValue): void {
    if (this.disabled()) return;
    const next = this.values().filter((item) => item !== value);
    this.commit(next.length ? next : '', 'clear');
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

  /** 是否不可选：禁用状态 / disableDate / range 任一命中。 */
  protected isCellDisabled(cell: DatePickerCell): boolean {
    if (this.disabled()) return true;
    if (this.isCellDisabledByDisableDate(cell)) return true;
    return this.isCellOutOfRange(cell.date);
  }

  /** 是否落在 range 之外。 */
  private isCellOutOfRange(date: Date): boolean {
    const range = this.range();
    if (!range) return false;
    const day = startOfDay(date);
    if (typeof range === 'function') {
      return !range(formatValue(date, this.effectiveValueType()));
    }
    const [startValue, endValue] = range;
    const start = startValue === undefined ? null : parseDate(startValue, this.effectiveValueType());
    const end = endValue === undefined ? null : parseDate(endValue, this.effectiveValueType());
    if (start && day < startOfDay(start)) return true;
    if (end && day > startOfDay(end)) return true;
    return false;
  }

  private isCellDisabledByDisableDate(cell: DatePickerCell): boolean {
    const disableDate = this.disableDate();
    if (!disableDate) return false;

    if (typeof disableDate === 'function') return disableDate(cell.date);

    if (Array.isArray(disableDate)) {
      return disableDate.some((value) => {
        const date = parseDate(value, this.effectiveValueType());
        return !!date && isSameDay(date, cell.date);
      });
    }

    const date = startOfDay(cell.date);
    const parseBound = (value: DateValue | undefined): Date | null =>
      value === undefined ? null : parseDate(value, this.effectiveValueType());

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

  protected jumpYear(delta: number): void {
    this.viewYear.update((year) => year + delta);
  }

  protected stepBackward(): void {
    if (this.mode() === 'year' || this.mode() === 'quarter') this.jumpYear(-1);
    else this.jumpMonth(-1);
  }

  protected stepForward(): void {
    if (this.mode() === 'year' || this.mode() === 'quarter') this.jumpYear(1);
    else this.jumpMonth(1);
  }

  protected selectMonth(month: number): void {
    const date = new Date(this.viewYear(), month, 1);
    this.commit(formatValue(date, this.effectiveValueType()), 'pick');
    this.closePanel();
  }

  protected selectYear(year: number): void {
    const date = new Date(year, 0, 1);
    this.commit(formatValue(date, this.effectiveValueType()), 'pick');
    this.closePanel();
  }

  /** 周模式：点任意格选中整周，提交该周周一。 */
  protected selectWeek(row: { week: number; weekYear: number; disabled: boolean }, cell?: DatePickerCell): void {
    if (row.disabled || this.disabled()) return;
    if (cell && this.isCellDisabled(cell)) return;
    this.commit(formatValue(isoWeekStart(row.weekYear, row.week), this.effectiveValueType()), 'pick');
    this.closePanel();
  }

  /** 季度模式：点选季度，提交该季度首日。 */
  protected selectQuarter(quarter: number): void {
    this.commit(formatValue(new Date(this.viewYear(), (quarter - 1) * 3, 1), this.effectiveValueType()), 'pick');
    this.closePanel();
  }

  protected weekRowClasses(active: boolean, disabled: boolean): string {
    return [
      't-date-picker__table-week-row',
      active ? 't-date-picker__table-week-row--active' : '',
      disabled ? 't-date-picker__table-week-row--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected periodCellClass(active: boolean): string {
    return [
      't-date-picker__cell',
      active ? 't-date-picker__cell--active' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  /** 面板单元格文案：cell 回调优先，默认显示几号。 */
  protected cellText(cell: DatePickerCell): string {
    const render = this.cell();
    if (!render) return String(cell.day);
    return render(formatValue(cell.date, this.effectiveValueType()));
  }
  protected cellClasses(cell: DatePickerCell): string {
    const classes = ['t-date-picker__cell'];
    const today = new Date();
    if (isSameDay(cell.date, today)) classes.push('t-date-picker__cell--now');
    const isActive = this.multiple()
      ? this.values().some((value) => {
          const date = parseDate(value, this.effectiveValueType());
          return !!date && isSameDay(cell.date, date);
        })
      : (() => {
          const active = this.activeDate();
          return !!active && isSameDay(cell.date, active);
        })();
    if (isActive) {
      classes.push('t-date-picker__cell--active');
    }
    if (this.isCellDisabled(cell)) classes.push('t-date-picker__cell--disabled');
    if (cell.additional) classes.push('t-date-picker__cell--additional');
    return classes.join(' ');
  }

  /** 把草稿日期与草稿时间合并成回传值。 */
  private combinedValue(date: Date): DateValue {
    const combined = new Date(date);
    const parts = this.draftTimeParts();
    combined.setHours(parts.hour, parts.minute, parts.second, 0);
    return formatValue(combined, this.effectiveValueType());
  }

  private chunkRows<T>(items: T[], size: number): T[][] {
    const rows: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
      rows.push(items.slice(index, index + size));
    }
    return rows;
  }

  private commit(value: DatePickerValue | '', trigger: DatePickerChangeEvent['trigger']): void {
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, trigger });
  }

  private openPanel(): void {
    this.open.set(true);
    this.visibleChange.emit(true);
    this.syncViewToValue();
    if (this.isTimeMode()) this.scheduleScrollTime();
  }

  /** 打开面板后把时间列滚动到当前值附近。 */
  private scheduleScrollTime(): void {
    setTimeout(() => this.scrollTimeColumns(), 60);
  }

  private scrollTimeColumns(): void {
    const columns = document.querySelectorAll<HTMLElement>(
      '.t-date-picker__panel-container:not(.t-popup--hidden) .t-date-picker__panel-time .t-time-picker__panel-body-scroll',
    );
    columns.forEach((column) => {
      const current = column.querySelector<HTMLElement>('.t-is-current');
      if (!current) return;
      column.scrollTop = current.offsetTop - column.clientHeight / 2 + current.clientHeight / 2;
    });
  }

  private closePanel(): void {
    this.draftText.set(null);
    this.open.set(false);
    this.visibleChange.emit(false);
  }

  /** 提交输入框里手输的日期；解析失败时回退到已有值。 */
  private commitDraft(close: boolean): void {
    const text = this.draftText();
    if (text === null) return;
    this.draftText.set(null);

    if (!text.trim()) {
      this.commit('', 'clear');
      if (close) this.closePanel();
      return;
    }

    const date = parseDateByFormat(text, this.displayFormat());
    if (!date || this.isDateDisabledValue(date)) return;

    this.commit(formatValue(date, this.effectiveValueType()), 'enter');
    if (close) this.closePanel();
  }

  private isDateDisabledValue(date: Date): boolean {
    return this.isCellDisabled({ date, day: date.getDate(), additional: false });
  }

  private syncViewToValue(): void {
    const date = this.selectedDate();
    if (date) {
      this.viewYear.set(date.getFullYear());
      this.viewMonth.set(date.getMonth());
      return;
    }

    const active = this.panelActiveDate();
    if (!active) return;

    const activeYear = active.year === undefined ? null : parseDate(active.year, this.effectiveValueType());
    if (activeYear) this.viewYear.set(activeYear.getFullYear());

    if (active.month !== undefined) {
      if (typeof active.month === 'number') {
        const month = Math.min(Math.max(active.month - 1, 0), 11);
        this.viewMonth.set(month);
      } else {
        const activeMonth = parseDate(active.month, this.effectiveValueType());
        if (activeMonth) this.viewMonth.set(activeMonth.getMonth());
      }
    }
  }
}










