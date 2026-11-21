import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TButton } from '../button/button.component';
import { TPopup } from '../popup';
import {
  DEFAULT_TIME_FORMAT,
  buildTimeColumns,
  emptyTimeValue,
  formatTimeParts,
  nowTimeValue,
  parseTimeParts,
} from './time-picker-utils';
import {
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
  imports: [TButton, TPopup],
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

  /** @zh 选中时间变化 @en Emitted when the selected time changes */
  readonly change = output<TimePickerChangeEvent>();

  /** @zh 弹层显隐变化 @en Emitted when the popup visibility changes */
  readonly visibleChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<TimePickerValue | null | undefined>(undefined);
  protected readonly draft = signal('');

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly currentValue = computed<TimePickerValue | null>(() => {
    if (this.value() !== undefined) return this.value() ?? null;
    if (this.innerValue() !== undefined) return this.innerValue() ?? null;
    return this.defaultValue() ?? null;
  });

  protected readonly hasValue = computed(() => !!this.currentValue());

  protected readonly displayText = computed(() => this.currentValue() ?? '');

  protected readonly columns = computed<TimePickerColumn[]>(() =>
    buildTimeColumns(this.format(), this.steps()),
  );

  protected readonly showNowButton = computed(() =>
    this.steps().every((step) => Number(step) <= 1),
  );

  protected readonly activeParts = computed(() => parseTimeParts(this.draft(), this.format()));

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
    if (visible) {
      this.draft.set(this.currentValue() ?? emptyTimeValue(this.format()));
      this.scheduleScroll();
    }
  }

  protected selectItem(type: TimePickerColumnType, item: string): void {
    if (this.disabled()) return;
    const parts = { ...this.activeParts(), [type]: Number(item) };
    this.draft.set(formatTimeParts(parts, this.format()));
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
    return [
      't-time-picker__panel-body-scroll-item',
      Number(item) === current ? 't-is-current' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private commit(value: TimePickerValue | null, trigger: TimePickerChangeEvent['trigger']): void {
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, trigger });
  }

  private closePanel(): void {
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
