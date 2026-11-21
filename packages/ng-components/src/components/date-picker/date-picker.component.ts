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
} from './date-picker-utils';
import {
  DatePickerCell,
  DatePickerChangeEvent,
  DatePickerValueType,
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
  imports: [NgTemplateOutlet, TPopup, TSelect],
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

  /** @zh 选中值变化 @en Emitted when the selected date changes */
  readonly change = output<DatePickerChangeEvent>();

  /** @zh 弹层显隐变化 @en Emitted when the popup visibility changes */
  readonly visibleChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<DateValue | undefined>(undefined);
  private readonly draftText = signal<string | null>(null);
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

  /** 允许输入时优先显示用户正在输入的文本。 */
  protected readonly inputDisplayText = computed(() => this.draftText() ?? this.displayText());

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
    if (visible) this.syncViewToValue();
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
    const date = parseDate(raw, this.valueType());
    if (!date) return;
    this.commit(formatValue(date, this.valueType()), 'preset');
    this.closePanel();
  }

  protected pickDate(cell: DatePickerCell): void {
    if (this.isCellDisabled(cell)) return;
    this.commit(formatValue(cell.date, this.valueType()), 'pick');
    this.closePanel();
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.commit('', 'clear');
    this.closePanel();
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

  private openPanel(): void {
    this.open.set(true);
    this.visibleChange.emit(true);
    this.syncViewToValue();
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

    this.commit(formatValue(date, this.valueType()), 'enter');
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

    const activeYear = active.year === undefined ? null : parseDate(active.year, this.valueType());
    if (activeYear) this.viewYear.set(activeYear.getFullYear());

    if (active.month !== undefined) {
      if (typeof active.month === 'number') {
        const month = Math.min(Math.max(active.month - 1, 0), 11);
        this.viewMonth.set(month);
      } else {
        const activeMonth = parseDate(active.month, this.valueType());
        if (activeMonth) this.viewMonth.set(activeMonth.getMonth());
      }
    }
  }
}
