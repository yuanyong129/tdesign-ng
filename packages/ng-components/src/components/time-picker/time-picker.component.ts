import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TButton } from '../button/button.component';
import { TPopup } from '../popup';
import { TTimePickerValueDisplay } from './time-picker-content.directives';
import {
  DEFAULT_TIME_FORMAT,
  buildTimeColumns,
  emptyTimeValue,
  formatTimeParts,
  normalizeTimeText,
  nowTimeValue,
  parseTimeParts,
} from './time-picker-utils';
import {
  DisableTime,
  PresetTime,
  TimePickerChangeEvent,
  TimePickerColumn,
  TimePickerColumnType,
  TimePickerValue,
} from './time-picker.types';

const SIZE_CLASS: Record<'small' | 'medium' | 'large', string> = {
  small: 't-size-s',
  medium: '',
  large: 't-size-l',
};

/**
 * @zh 时间选择器，通过时分秒三列选择时间。
 *
 * ```html
 * <t-time-picker [value]="value" (change)="value = $event.value" />
 * ```
 *
 * @en Time picker: choose a time from hour / minute / second columns.
 */
@Component({
  selector: 't-time-picker',
  standalone: true,
  imports: [NgTemplateOutlet, TButton, TPopup],
  templateUrl: './time-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 't-time-picker' },
})
export class TTimePicker {
  /**
   * @zh 选中的时间，受控用法。
   * @en Selected time in controlled mode.
   */
  readonly value = input<TimePickerValue | undefined>(undefined);

  /**
   * @zh 默认选中的时间，非受控用法。
   * @en Default selected time in uncontrolled mode.
   */
  readonly defaultValue = input<TimePickerValue | undefined>(undefined);

  /**
   * @zh 时间格式，支持 HH / mm / ss。
   * @en Time format; HH / mm / ss are supported.
   * @defaultValue 'HH:mm:ss'
   */
  readonly format = input<string>(DEFAULT_TIME_FORMAT);

  /**
   * @zh 每一列的步长，顺序为 HH / mm / ss。
   * @en Step of each column, in HH / mm / ss order.
   * @defaultValue [1, 1, 1]
   */
  readonly steps = input<Array<string | number>>([1, 1, 1]);

  /**
   * @zh 是否可清空。
   * @en Whether the value can be cleared.
   * @defaultValue false
   */
  readonly clearable = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否禁用。
   * @en Whether the time picker is disabled.
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
   * @defaultValue '请选择时间'
   */
  readonly placeholder = input('请选择时间');

  /**
   * @zh 预设时间：键为按钮文案，值为时间或返回时间的函数。
   * @en Preset times: key is the button label, value is a time or a factory.
   */
  readonly presets = input<PresetTime | undefined>(undefined);

  /**
   * @zh 禁用时间的判断函数，返回每列需要禁用的候选值。
   * @en Predicate returning the candidates to disable for each column.
   */
  readonly disableTime = input<DisableTime | undefined>(undefined);

  /**
   * @zh 是否隐藏被禁用的候选项（false 时置灰显示）。
   * @en Whether disabled candidates are hidden (shown greyed out when false).
   * @defaultValue true
   */
  readonly hideDisabledTime = input(true, { transform: booleanAttribute });

  /**
   * @zh 是否允许在输入框里直接输入时间（Enter / 失焦提交）。
   * @en Whether time can be typed in the input (committed on Enter or blur).
   * @defaultValue false
   */
  readonly allowInput = input(false, { transform: booleanAttribute });

  /** @zh 选中时间变化 @en Emitted when the selected time changes */
  readonly change = output<TimePickerChangeEvent>();

  /** @zh 弹层显隐变化 @en Emitted when the popup visibility changes */
  readonly visibleChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<TimePickerValue | null | undefined>(undefined);
  protected readonly draft = signal('');
  private readonly inputText = signal<string | null>(null);

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly valueDisplayDirectives = contentChildren(TTimePickerValueDisplay);

  protected readonly valueDisplayTemplate = computed(
    () => this.valueDisplayDirectives()[0]?.template ?? null,
  );

  protected readonly currentValue = computed<TimePickerValue | null>(() => {
    if (this.value() !== undefined) return this.value() ?? null;
    if (this.innerValue() !== undefined) return this.innerValue() ?? null;
    return this.defaultValue() ?? null;
  });

  protected readonly hasValue = computed(() => !!this.currentValue());

  protected readonly displayText = computed(() => this.currentValue() ?? '');

  /** 允许输入时优先显示用户正在输入的文本。 */
  protected readonly inputDisplayText = computed(() => {
    if (this.inputText() !== null) return this.inputText() as string;
    if (this.valueDisplayTemplate() && this.hasValue()) return '';
    return this.displayText();
  });

  protected readonly placeholderText = computed(() =>
    this.valueDisplayTemplate() && this.hasValue() ? '' : this.placeholder(),
  );

  protected readonly columns = computed<TimePickerColumn[]>(() =>
    buildTimeColumns(this.format(), this.steps()),
  );

  protected readonly presetEntries = computed(() =>
    Object.entries(this.presets() ?? {}).map(([key, value]) => ({ key, value })),
  );

  protected readonly showNowButton = computed(
    () =>
      this.presetEntries().length === 0 && this.steps().every((step) => Number(step) <= 1),
  );

  protected readonly activeParts = computed(() => parseTimeParts(this.draft(), this.format()));

  /** 每列被 disableTime 禁用的候选值。 */
  protected readonly disabledValues = computed<Record<TimePickerColumnType, Set<number>>>(() => {
    const result: Record<TimePickerColumnType, Set<number>> = {
      hour: new Set<number>(),
      minute: new Set<number>(),
      second: new Set<number>(),
    };
    const disableTime = this.disableTime();
    if (!disableTime) return result;

    const parts = this.activeParts();
    for (const column of this.columns()) {
      for (const item of column.items) {
        const candidate = Number(item);
        const query = { ...parts, [column.type]: candidate };
        const disabled = disableTime(query.hour, query.minute, query.second, 0);
        if (disabled?.[column.type]?.includes(candidate)) result[column.type].add(candidate);
      }
    }
    return result;
  });

  protected readonly inputClasses = computed(() => {
    const classes = ['t-input', 't-input--prefix', 't-input--suffix'];
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

  protected readonly valueDisplayContext = computed<Record<string, unknown>>(() => ({
    $implicit: this.currentValue(),
    value: this.currentValue(),
  }));

  protected handleVisibleChange(visible: boolean): void {
    if (this.disabled()) return;
    this.open.set(visible);
    this.visibleChange.emit(visible);
    if (visible) {
      this.draft.set(this.currentValue() ?? emptyTimeValue(this.format()));
      this.scheduleScroll();
    }
  }

  protected handleInputText(event: Event): void {
    if (!this.allowInput() || this.disabled()) return;
    this.inputText.set((event.target as HTMLInputElement).value);
  }

  protected handleInputClick(event: MouseEvent): void {
    if (!this.allowInput()) return;
    // 允许输入时点击输入框只负责打开面板，不触发 TPopup 的收起
    event.stopPropagation();
    if (this.disabled()) return;
    if (!this.open()) {
      this.open.set(true);
      this.visibleChange.emit(true);
      this.draft.set(this.currentValue() ?? emptyTimeValue(this.format()));
      this.scheduleScroll();
    }
  }

  protected handleInputEnter(event: Event): void {
    if (!this.allowInput()) return;
    this.commitInputText(true);
    (event.target as HTMLInputElement).value = this.displayText();
  }

  protected handleInputBlur(event: Event): void {
    if (!this.allowInput()) return;
    if (this.inputText() !== null) this.commitInputText(false);
    (event.target as HTMLInputElement).value = this.displayText();
  }

  protected selectItem(type: TimePickerColumnType, item: string): void {
    if (this.disabled() || this.disabledValues()[type].has(Number(item))) return;
    const parts = { ...this.activeParts(), [type]: Number(item) };
    this.draft.set(formatTimeParts(parts, this.format()));
    this.scheduleScroll();
  }

  protected applyPreset(preset: { key: string; value: TimePickerValue | (() => TimePickerValue) }): void {
    if (this.disabled()) return;
    const raw = typeof preset.value === 'function' ? preset.value() : preset.value;
    const normalized = normalizeTimeText(raw, this.format());
    if (!normalized) return;
    this.draft.set(normalized);
    this.scheduleScroll();
  }

  protected confirm(): void {
    if (this.disabled()) return;
    const value = this.draft() || emptyTimeValue(this.format());
    this.commit(value, 'confirm');
    this.closePanel();
  }

  protected setNow(): void {
    if (this.disabled()) return;
    this.draft.set(nowTimeValue(this.format()));
    this.scheduleScroll();
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.commit(null, 'clear');
    this.closePanel();
  }

  protected itemClasses(type: TimePickerColumnType, item: string): string {
    const current = this.activeParts()[type];
    const number = Number(item);
    const disabled = this.disabledValues()[type].has(number);
    return [
      't-time-picker__panel-body-scroll-item',
      number === current ? 't-is-current' : '',
      disabled ? (this.hideDisabledTime() ? 't-is-hidden' : 't-is-disabled') : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private commit(value: TimePickerValue | null, trigger: TimePickerChangeEvent['trigger']): void {
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, trigger });
  }

  /** 提交输入框里手输的时间；非法时回退到已有值。 */
  private commitInputText(close: boolean): void {
    const text = this.inputText();
    if (text === null) return;
    this.inputText.set(null);

    if (!text.trim()) {
      this.commit(null, 'clear');
      if (close) this.closePanel();
      return;
    }

    const normalized = normalizeTimeText(text, this.format());
    if (!normalized) return;

    this.commit(normalized, 'confirm');
    if (close) this.closePanel();
  }

  private closePanel(): void {
    this.inputText.set(null);
    this.open.set(false);
    this.visibleChange.emit(false);
  }

  /** 打开面板后把每列滚动到当前值附近。 */
  private scheduleScroll(): void {
    setTimeout(() => this.scrollToCurrent(), 60);
  }

  private scrollToCurrent(): void {
    const document = this.hostRef.nativeElement.ownerDocument;
    const columns = document.querySelectorAll<HTMLElement>(
      '.t-time-picker__popup:not(.t-popup--hidden) .t-time-picker__panel-body-scroll',
    );
    columns.forEach((column) => {
      const current = column.querySelector<HTMLElement>('.t-is-current');
      if (!current) return;
      column.scrollTop = current.offsetTop - column.clientHeight / 2 + current.clientHeight / 2;
    });
  }
}
