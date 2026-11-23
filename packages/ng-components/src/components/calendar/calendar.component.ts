import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  TemplateRef,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

import { cn } from '../../_utils';
import { formatDate, startOfDay } from '../date-picker/date-picker-utils';
import { TButton } from '../button/button.component';
import { TRadioGroup } from '../radio/radio-group.component';
import type { RadioOption, RadioValue } from '../radio/radio.types';
import { TSelect } from '../select/select.component';
import type { SelectMultipleValue, SelectOptionInput, SelectSingleValue } from '../select/select.types';

import {
  isTemplateRef,
  type CalendarButtonProps,
  type CalendarCell,
  type CalendarCellEvent,
  type CalendarController,
  type CalendarControllerOptions,
  type CalendarCurrentController,
  type CalendarMode,
  type CalendarModeController,
  type CalendarMonthChangeEvent,
  type CalendarSelectController,
  type CalendarTheme,
  type CalendarValue,
  type CalendarWeek,
  type CalendarWeekendController,
  type CalendarWeekHeader,
} from './calendar.types';
import {
  CALENDAR_MIN_YEAR,
  clampFirstDayOfWeek,
  createDefaultControllerConfig,
  createMonthRows,
  createWeekHeaders,
  createYearRows,
  formatCellDisplay,
  isSameCalendarDay,
  isTodayCell,
  resolveRange,
  toDate,
  type CalendarRangeBounds,
} from './calendar.utils';

const MODE_OPTIONS: RadioOption[] = [
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];

const DEFAULT_FORMAT = 'YYYY-MM-DD';

function parseYear(value: string | number | undefined): number | null {
  if (value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

function parseMonth(value: string | number | undefined): number | null {
  const parsed = parseYear(value);
  return parsed !== null && parsed >= 1 && parsed <= 12 ? parsed : null;
}

@Component({
  selector: 't-calendar',
  standalone: true,
  imports: [NgTemplateOutlet, TButton, TRadioGroup, TSelect],
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[class]': 'classes()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TCalendar),
      multi: true,
    },
  ],
})
export class TCalendar implements ControlValueAccessor {
  /** 自定义单元格内容，传入字符串或模板。 @zh 自定义单元格 @en cell @defaultValue undefined */
  readonly cell = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 单元格的附加内容。 @zh 单元格附加内容 @en cellAppend @defaultValue undefined */
  readonly cellAppend = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 控制区配置，`false` 隐藏整个控制区。 @zh 控制区配置 @en controllerConfig @defaultValue true */
  readonly controllerConfig = input<boolean | CalendarController | undefined>(true);

  /** 日期小于 10 时是否补零。 @zh 日期补零 @en fillWithZero @defaultValue true */
  readonly fillWithZero = input(true, { transform: booleanAttribute });

  /** 一周的起始日，1 表示周一，7 表示周日。 @zh 一周起始日 @en firstDayOfWeek @defaultValue undefined @values 1,2,3,4,5,6,7 */
  readonly firstDayOfWeek = input<number | undefined>(undefined);

  /** 日期格式化模板。 @zh 日期格式 @en format @defaultValue YYYY-MM-DD */
  readonly format = input<string>(DEFAULT_FORMAT);

  /** 控制区标题内容。 @zh 控制区标题 @en head @defaultValue undefined */
  readonly head = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 初始是否展示周末。 @zh 默认展示周末 @en isShowWeekendDefault @defaultValue true */
  readonly isShowWeekendDefault = input(true, { transform: booleanAttribute });

  /** 展示模式。 @zh 展示模式 @en mode @defaultValue month @values month,year */
  readonly mode = input<CalendarMode>('month');

  /** 选中的月份，受控属性。 @zh 月份 @en month @defaultValue undefined */
  readonly month = input<string | number | undefined>(undefined);

  /** 是否支持多选。 @zh 多选 @en multiple @defaultValue false */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** 是否阻止单元格右键的默认行为。 @zh 阻止右键默认行为 @en preventCellContextmenu @defaultValue false */
  readonly preventCellContextmenu = input(false, { transform: booleanAttribute });

  /** 可选日期的范围，形如 `['2024-01-01', '2024-12-31']`。 @zh 日期范围 @en range @defaultValue undefined */
  readonly range = input<CalendarValue[] | undefined>(undefined);

  /** 日历风格。 @zh 风格 @en theme @defaultValue full @values full,card */
  readonly theme = input<CalendarTheme>('full');

  /** 选中的日期，受控属性。 @zh 选中日期 @en value @defaultValue undefined */
  readonly value = input<CalendarValue | CalendarValue[] | undefined>(undefined);

  /** 自定义表头，数组按列对应，也可传入模板。 @zh 自定义表头 @en week @defaultValue undefined */
  readonly week = input<string[] | TemplateRef<unknown> | undefined>(undefined);

  /** 选中的年份，受控属性。 @zh 年份 @en year @defaultValue undefined */
  readonly year = input<string | number | undefined>(undefined);

  /** 点击单元格时触发。 @zh 点击单元格 @en cellClick */
  readonly cellClick = output<CalendarCellEvent>();

  /** 双击单元格时触发。 @zh 双击单元格 @en cellDoubleClick */
  readonly cellDoubleClick = output<CalendarCellEvent>();

  /** 右键单元格时触发。 @zh 右键单元格 @en cellRightClick */
  readonly cellRightClick = output<CalendarCellEvent>();

  /** 控制区发生变化时触发。 @zh 控制区变化 @en controllerChange */
  readonly controllerChange = output<CalendarControllerOptions>();

  /** 展示年月发生变化时触发。 @zh 年月变化 @en monthChange */
  readonly monthChange = output<CalendarMonthChangeEvent>();

  private readonly today = startOfDay(new Date());

  private readonly innerValue = signal<Date | null>(this.today);

  private readonly innerValues = signal<Date[]>([]);

  protected readonly selectedYear = signal(this.today.getFullYear());

  protected readonly selectedMonth = signal(this.today.getMonth() + 1);

  protected readonly selectedMode = signal<CalendarMode>('month');

  protected readonly showWeekend = signal(true);

  private readonly realFirstDayOfWeek = signal(1);

  private onChangeFn: ((value: CalendarValue | CalendarValue[] | null) => void) | null = null;

  private onTouchedFn: (() => void) | null = null;

  protected readonly controlSize = computed<'small' | 'medium'>(() => (this.theme() === 'card' ? 'small' : 'medium'));

  protected readonly classes = computed(() => cn('t-calendar', `t-calendar--${this.theme()}`));

  protected readonly panelClasses = computed(() =>
    cn('t-calendar__panel', `t-calendar__panel--${this.selectedMode()}`),
  );

  private readonly controllerData = computed<CalendarController>(() => {
    const config = this.controllerConfig();
    const defaults = createDefaultControllerConfig(true);
    if (typeof config === 'boolean') return createDefaultControllerConfig(config);
    if (config === undefined) return defaults;
    return { ...defaults, ...config };
  });

  protected readonly controllerVisible = computed(() => this.controllerData().visible !== false);

  private readonly weekArray = computed<string[] | undefined>(() => {
    const value = this.week();
    return Array.isArray(value) ? value : undefined;
  });

  protected readonly weekTemplate = computed<TemplateRef<unknown> | undefined>(() => {
    const value = this.week();
    return isTemplateRef(value) ? value : undefined;
  });

  protected readonly headTemplate = computed<TemplateRef<unknown> | undefined>(() => {
    const value = this.head();
    return isTemplateRef(value) ? value : undefined;
  });

  protected readonly headText = computed(() => {
    const value = this.head();
    return typeof value === 'string' ? value : undefined;
  });

  protected readonly cellTemplate = computed<TemplateRef<unknown> | undefined>(() => {
    const value = this.cell();
    return isTemplateRef(value) ? value : undefined;
  });

  protected readonly cellText = computed(() => {
    const value = this.cell();
    return typeof value === 'string' ? value : undefined;
  });

  protected readonly cellAppendTemplate = computed<TemplateRef<unknown> | undefined>(() => {
    const value = this.cellAppend();
    return isTemplateRef(value) ? value : undefined;
  });

  protected readonly cellAppendText = computed(() => {
    const value = this.cellAppend();
    return typeof value === 'string' ? value : undefined;
  });

  protected readonly controllerOptions = computed<CalendarControllerOptions>(() => {
    const filterDate = new Date(this.selectedYear(), this.selectedMonth() - 1, 1, 0, 0, 0, 0);
    return {
      filterDate,
      formattedFilterDate: formatDate(filterDate, this.format()),
      mode: this.selectedMode(),
      isShowWeekend: this.showWeekend(),
    };
  });

  private readonly rangeBounds = computed<CalendarRangeBounds | null>(() =>
    resolveRange(this.range(), this.format()),
  );

  protected readonly weekHeaders = computed<CalendarWeekHeader[]>(() => {
    const headers = createWeekHeaders(this.realFirstDayOfWeek(), this.weekArray());
    if (this.showWeekend()) return headers;
    return headers.filter((header) => header.day !== 6 && header.day !== 7);
  });

  protected readonly rows = computed<CalendarCell[][]>(() => {
    const format = this.format();
    const mode = this.selectedMode();
    if (mode === 'year') {
      return createYearRows(this.selectedYear(), format, (date) => this.isCurrentYearMonth(date));
    }
    const rows = createMonthRows({
      year: this.selectedYear(),
      month: this.selectedMonth(),
      firstDayOfWeek: this.realFirstDayOfWeek(),
      format,
      isCurrent: (date) => this.isCurrentDate(date),
    });
    if (this.showWeekend()) return rows;
    return rows.map((row) => row.filter((cell) => (cell.day ?? 0) < 6));
  });

  protected readonly modeOptions = MODE_OPTIONS;

  protected readonly yearVisible = computed(
    () => this.controllerVisible() && this.isSectionVisible('year'),
  );

  protected readonly monthVisible = computed(
    () => this.selectedMode() === 'month' && this.controllerVisible() && this.isSectionVisible('month'),
  );

  protected readonly modeVisible = computed(() => this.controllerVisible() && this.isSectionVisible('mode'));

  protected readonly weekendVisible = computed(
    () => this.theme() === 'full' && this.controllerVisible() && this.isSectionVisible('weekend'),
  );

  protected readonly currentVisible = computed(
    () => this.theme() === 'full' && this.controllerVisible() && this.isSectionVisible('current'),
  );

  protected readonly yearDisabled = computed(() => {
    const config = this.controllerData();
    const section = config.year as CalendarSelectController | false | undefined;
    if (config.disabled === true) return true;
    return section !== false && section !== undefined && section.selectProps?.disabled === true;
  });

  protected readonly monthDisabled = computed(() => {
    const config = this.controllerData();
    const section = config.month as CalendarSelectController | false | undefined;
    if (config.disabled === true) return true;
    return section !== false && section !== undefined && section.selectProps?.disabled === true;
  });

  protected readonly modeDisabled = computed(() => {
    const config = this.controllerData();
    const section = config.mode as CalendarModeController | false | undefined;
    if (config.disabled === true) return true;
    return section !== false && section !== undefined && section.radioGroupProps?.disabled === true;
  });

  protected readonly weekendButtonProps = computed<CalendarButtonProps>(() => {
    const section = this.controllerData().weekend as CalendarWeekendController | false | undefined;
    if (section === false || section === undefined) return {};
    return (this.showWeekend() ? section.hideWeekendButtonProps : section.showWeekendButtonProps) ?? {};
  });

  protected readonly weekendDisabled = computed(() => {
    const config = this.controllerData();
    if (config.disabled === true) return true;
    return this.weekendButtonProps().disabled === true;
  });

  protected readonly weekendButtonText = computed(() => (this.showWeekend() ? '隐藏周末' : '显示周末'));

  protected readonly currentButtonProps = computed<CalendarButtonProps>(() => {
    const section = this.controllerData().current as CalendarCurrentController | false | undefined;
    if (section === false || section === undefined) return {};
    return (
      (this.selectedMode() === 'month' ? section.currentDayButtonProps : section.currentMonthButtonProps) ?? {}
    );
  });

  protected readonly currentDisabled = computed(() => {
    const config = this.controllerData();
    if (config.disabled === true) return true;
    return this.currentButtonProps().disabled === true;
  });

  protected readonly currentButtonText = computed(() => (this.selectedMode() === 'month' ? '今天' : '本月'));

  protected readonly yearOptions = computed<SelectOptionInput[]>(() => {
    const bounds = this.rangeBounds();
    const current = this.selectedYear();
    let begin = Math.max(current - 10, CALENDAR_MIN_YEAR);
    let end = Math.max(current + 10, CALENDAR_MIN_YEAR);
    if (bounds) {
      begin = Math.max(bounds.from.getFullYear(), CALENDAR_MIN_YEAR);
      end = Math.max(bounds.to.getFullYear(), CALENDAR_MIN_YEAR);
    }
    const options: SelectOptionInput[] = [];
    for (let year = begin; year <= end; year += 1) {
      options.push({ value: year, label: `${year} 年` });
    }
    return options;
  });

  protected readonly monthOptions = computed<SelectOptionInput[]>(() => {
    const options: SelectOptionInput[] = [];
    for (let month = 1; month <= 12; month += 1) {
      options.push({ value: month, label: `${month} 月`, disabled: this.isMonthDisabled(month) });
    }
    return options;
  });

  constructor() {
    effect(() => {
      const value = this.value();
      const multiple = this.multiple();
      const format = this.format();
      untracked(() => this.syncValue(value, multiple, format));
    });

    effect(() => {
      const year = parseYear(this.year());
      if (year === null) return;
      untracked(() => this.applyDisplayed(year, this.selectedMonth(), true));
    });

    effect(() => {
      const month = parseMonth(this.month());
      if (month === null) return;
      untracked(() => this.applyDisplayed(this.selectedYear(), month, true));
    });

    effect(() => {
      const mode = this.mode();
      untracked(() => this.selectedMode.set(mode));
    });

    effect(() => {
      const showWeekend = this.isShowWeekendDefault();
      untracked(() => this.showWeekend.set(showWeekend));
    });

    effect(() => {
      const firstDayOfWeek = clampFirstDayOfWeek(this.firstDayOfWeek());
      untracked(() => this.realFirstDayOfWeek.set(firstDayOfWeek));
    });
  }

  writeValue(value: CalendarValue | CalendarValue[] | null): void {
    this.syncValue(value ?? undefined, this.multiple(), this.format());
  }

  registerOnChange(fn: (value: CalendarValue | CalendarValue[] | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(): void {
    // 日历整体没有禁用态，控制区禁用请通过 controllerConfig.disabled 配置。
  }

  protected headContext(): { $implicit: CalendarControllerOptions } {
    return { $implicit: this.controllerOptions() };
  }

  protected weekContext(header: CalendarWeekHeader): { $implicit: CalendarWeek } {
    return { $implicit: { day: header.day } };
  }

  protected cellContext(cell: CalendarCell): { $implicit: CalendarCell } {
    return { $implicit: cell };
  }

  protected cellDisplay(cell: CalendarCell): string {
    return formatCellDisplay(cell, this.fillWithZero());
  }

  protected cellClasses(cell: CalendarCell): string {
    return cn(
      't-calendar__table-body-cell',
      this.isCellDisabled(cell) ? 't-is-disabled' : '',
      cell.isCurrent ? 't-is-checked' : '',
      isTodayCell(cell, this.today) ? 't-calendar__table-body-cell--now' : '',
    );
  }

  protected onCellClick(cell: CalendarCell, e: MouseEvent): void {
    if (this.isCellDisabled(cell)) return;
    if (this.multiple()) {
      const date = startOfDay(cell.date);
      const next = this.innerValues().some((item) => isSameCalendarDay(item, date))
        ? this.innerValues().filter((item) => !isSameCalendarDay(item, date))
        : [...this.innerValues(), date];
      this.innerValues.set(next);
      this.onChangeFn?.(next.map((item) => formatDate(item, this.format())));
    } else {
      this.innerValue.set(startOfDay(cell.date));
      this.onChangeFn?.(formatDate(cell.date, this.format()));
    }
    this.onTouchedFn?.();
    this.cellClick.emit({ cell: this.toEventCell(cell), e });
  }

  protected onCellDoubleClick(cell: CalendarCell, e: MouseEvent): void {
    if (this.isCellDisabled(cell)) return;
    this.cellDoubleClick.emit({ cell: this.toEventCell(cell), e });
  }

  protected onCellRightClick(cell: CalendarCell, e: MouseEvent): void {
    if (this.isCellDisabled(cell)) return;
    if (this.preventCellContextmenu()) e.preventDefault();
    this.cellRightClick.emit({ cell: this.toEventCell(cell), e });
  }

  protected onYearSelect(value: SelectSingleValue | SelectMultipleValue): void {
    const raw = Array.isArray(value) ? value[0] : value;
    const year = typeof raw === 'boolean' ? null : parseYear(raw ?? undefined);
    if (year === null) return;
    this.applyDisplayed(year, this.selectedMonth(), true);
  }

  protected onMonthSelect(value: SelectSingleValue | SelectMultipleValue): void {
    const raw = Array.isArray(value) ? value[0] : value;
    const month = typeof raw === 'boolean' ? null : parseMonth(raw ?? undefined);
    if (month === null) return;
    this.applyDisplayed(this.selectedYear(), month, true);
  }

  protected onModeSelect(value: RadioValue | undefined): void {
    if (value !== 'month' && value !== 'year') return;
    if (value === this.selectedMode()) return;
    this.selectedMode.set(value);
    this.controllerChange.emit(this.controllerOptions());
  }

  protected toggleWeekend(): void {
    this.showWeekend.update((visible) => !visible);
    this.controllerChange.emit(this.controllerOptions());
  }

  protected goToday(): void {
    const today = startOfDay(new Date());
    if (this.multiple()) {
      this.innerValues.update((values) =>
        values.some((item) => isSameCalendarDay(item, today)) ? values : [...values, today],
      );
    } else {
      this.innerValue.set(today);
    }
    this.applyDisplayed(today.getFullYear(), today.getMonth() + 1, true);
  }

  private syncValue(
    value: CalendarValue | CalendarValue[] | undefined,
    multiple: boolean,
    format: string,
  ): void {
    if (multiple) {
      const raw = Array.isArray(value) ? value : value === undefined ? [this.today] : [];
      this.innerValues.set(
        raw.map((item) => toDate(item, format)).filter((date): date is Date => date !== null),
      );
      return;
    }
    const single = Array.isArray(value) ? value[0] : value;
    if (single === undefined) {
      this.innerValue.set(this.today);
      return;
    }
    if (single === '') {
      this.innerValue.set(null);
      return;
    }
    this.innerValue.set(toDate(single, format));
  }

  private applyDisplayed(year: number, month: number, emit: boolean): void {
    const changed = year !== this.selectedYear() || month !== this.selectedMonth();
    if (changed) {
      this.selectedYear.set(year);
      this.selectedMonth.set(month);
    }
    if (!changed || !emit) return;
    const event: CalendarMonthChangeEvent = { month: String(month), year: String(year) };
    this.monthChange.emit(event);
    this.controllerChange.emit(this.controllerOptions());
  }

  private isSectionVisible(name: 'current' | 'mode' | 'month' | 'weekend' | 'year'): boolean {
    const config = this.controllerData();
    if (config.visible === false) return false;
    const section = config[name] as { visible?: boolean } | false | undefined;
    if (section === false || section === undefined) return section !== false;
    return section.visible !== false;
  }

  private isMonthDisabled(month: number): boolean {
    const bounds = this.rangeBounds();
    if (!bounds) return false;
    const year = this.selectedYear();
    const fromYear = bounds.from.getFullYear();
    const toYear = bounds.to.getFullYear();
    const fromMonth = bounds.from.getMonth() + 1;
    const toMonth = bounds.to.getMonth() + 1;
    if (year < fromYear || year > toYear) return true;
    if (fromYear === toYear) return month < fromMonth || month > toMonth;
    if (year === fromYear) return month < fromMonth;
    if (year === toYear) return month > toMonth;
    return false;
  }

  private isCellDisabled(cell: CalendarCell): boolean {
    return cell.mode === 'month' && cell.belongTo !== 0;
  }

  private isCurrentDate(date: Date): boolean {
    if (this.multiple()) {
      return this.innerValues().some((item) => isSameCalendarDay(item, date));
    }
    const value = this.innerValue();
    return value !== null && isSameCalendarDay(value, date);
  }

  private isCurrentYearMonth(date: Date): boolean {
    if (this.multiple()) {
      return this.innerValues().some(
        (item) =>
          item.getFullYear() === date.getFullYear() && item.getMonth() === date.getMonth(),
      );
    }
    const value = this.innerValue();
    if (value === null) return false;
    return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth();
  }

  private toEventCell(cell: CalendarCell): CalendarCell {
    return { ...cell, ...this.controllerOptions() };
  }
}
