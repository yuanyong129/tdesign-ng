import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  SelectChangeEvent,
  SelectMultipleValue,
  SelectOptionGroupView,
  SelectOptionInput,
  SelectOptionObj,
  SelectSingleValue,
  SelectSize,
  SelectStatus,
  SelectValue,
  SelectValueChangeTrigger,
  isSelectOptionGroup,
  normalizeSelectOption,
} from './select.types';

const PREFIX_CLS = 't-input';

/** 选中项的对勾，与 Checkbox 用的是同一个图标路径。 */
const CHECK_PATH = 'M19.5708 7.37842L10.3785 16.5708L5.42871 11.6211';

/**
 * 选择器。下拉面板用 CDK Overlay 渲染到 body，避免被祖先的 overflow 裁掉。
 *
 * ```html
 * <t-select [options]="options" [(value)]="value" placeholder="请选择" />
 * <t-select [multiple]="true" [filterable]="true" [options]="options" [(value)]="values" />
 * ```
 *
 * 支持 `ngModel` / `formControlName`（实现了 `ControlValueAccessor`）。
 */
@Component({
  selector: 't-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TSelect),
      multi: true,
    },
  ],
})
export class TSelect implements ControlValueAccessor {
  /** @zh 已选中的值，多选时是数组 @en Selected value, an array when multiple @defaultValue undefined */
  readonly value = input<SelectSingleValue | SelectMultipleValue | undefined>(undefined);

  /** @zh 选项列表，支持直接给值、选项对象与分组 @en Options, supports raw values, option objects and groups @defaultValue [] */
  readonly options = input<SelectOptionInput[]>([]);

  /** @zh 是否多选 @en Whether multiple selection is allowed @defaultValue false */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** @zh 是否可搜索 @en Whether the options can be filtered @defaultValue false */
  readonly filterable = input(false, { transform: booleanAttribute });

  /** @zh 是否可清空 @en Whether the value can be cleared @defaultValue false */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** @zh 是否允许创建新选项 @en Whether new options can be created @defaultValue false */
  readonly creatable = input(false, { transform: booleanAttribute });

  /** @zh 是否禁用 @en Whether the select is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否只读 @en Whether the select is readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @zh 是否加载中 @en Whether the options are loading @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @zh 加载中的提示文字 @en Loading text @defaultValue '加载中' */
  readonly loadingText = input<string>('加载中');

  /** @zh 没有选项时的提示文字 @en Text shown when there is no option @defaultValue '暂无数据' */
  readonly empty = input<string>('暂无数据');

  /** @zh 占位文字 @en Placeholder text @defaultValue undefined */
  readonly placeholder = input<string | undefined>(undefined);

  /** @zh 选择器尺寸 @en Size of the select @defaultValue 'medium' @values small medium large */
  readonly size = input<SelectSize>('medium');

  /** @zh 选择器状态 @en Status of the select @defaultValue 'default' @values default success warning error */
  readonly status = input<SelectStatus>('default');

  /** @zh 选择框下方的提示文字 @en Tips below the select @defaultValue undefined */
  readonly tips = input<string | undefined>(undefined);

  /** @zh 左侧标签文字 @en Label text @defaultValue undefined */
  readonly label = input<string | undefined>(undefined);

  /** @zh 是否显示下拉箭头 @en Whether to show the dropdown arrow @defaultValue true */
  readonly showArrow = input(true, { transform: booleanAttribute });

  /** @zh 是否无边框 @en Whether the select is borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** @zh 自动聚焦 @en Whether to focus automatically @defaultValue false */
  readonly autofocus = input(false, { transform: booleanAttribute });

  /** @zh 多选时最多能选中的数量 @en Maximum number of selected options @defaultValue undefined */
  readonly max = input<number | undefined>(undefined);

  /** @zh 值变化事件，用于双向绑定 @en Value change event, used for two-way binding */
  readonly valueChange = output<SelectSingleValue | SelectMultipleValue>();

  /** @zh 值变化事件，携带触发来源与选项 @en Change event with trigger and option */
  readonly change = output<SelectChangeEvent>();

  /** @zh 下拉面板展开状态变化 @en Popup visibility change */
  readonly popupVisibleChange = output<boolean>();

  /** @zh 创建新选项 @en Emitted when a new option is created */
  readonly create = output<string>();

  /** @zh 清空已选值 @en Emitted when the value is cleared */
  readonly clear = output<MouseEvent>();

  /** @zh 移除一个已选标签 @en Emitted when a selected tag is removed */
  readonly remove = output<{ value: SelectValue; option?: SelectOptionObj; event: Event }>();

  /** @zh 搜索关键词变化 @en Emitted when the search keyword changes */
  readonly search = output<string>();

  /** @zh 获得焦点 @en Focus event */
  readonly focus = output<FocusEvent>();

  /** @zh 失去焦点 @en Blur event */
  readonly blur = output<FocusEvent>();

  protected readonly checkPath = CHECK_PATH;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly overlay = inject(Overlay);

  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly destroyRef = inject(DestroyRef);

  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');

  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inner');

  /** 表单通过 `setDisabledState` 下发的禁用态，与模板上的 `disabled` 取并集。 */
  private readonly disabledByForms = signal(false);

  private readonly innerValue = signal<SelectSingleValue | SelectMultipleValue | null>(null);

  private readonly popupVisible = signal(false);

  private readonly focused = signal(false);

  private readonly query = signal('');

  private readonly activeValue = signal<SelectValue | null>(null);

  private overlayRef: OverlayRef | null = null;

  private onChange: (value: SelectSingleValue | SelectMultipleValue) => void = () => {};

  private onTouched: () => void = () => {};

  constructor() {
    // 外部 `[value]` 变化时同步到内部状态；用户操作时不回写，避免打断交互。
    effect(() => {
      const next = this.value();
      untracked(() => {
        if (this.multiple()) {
          const array = this.toArray(next);
          if (!this.sameValues(array, this.selectedValues())) this.innerValue.set(array);
        } else {
          const single = this.toSingle(next);
          if (single !== this.selectedValues()[0] && !(single === null && this.selectedValues().length === 0)) {
            this.innerValue.set(single);
          }
        }
      });
    });

    // 面板打开时若筛选结果变化，重新对齐位置。
    effect(() => {
      this.visibleGroups();
      untracked(() => {
        if (this.overlayRef?.hasAttached()) this.overlayRef.updatePosition();
      });
    });

    this.destroyRef.onDestroy(() => this.overlayRef?.dispose());
  }

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  protected readonly selectedValues = computed<SelectValue[]>(() => this.toArray(this.innerValue()));

  /** 折叠分组后得到的分组视图。 */
  protected readonly optionGroups = computed<SelectOptionGroupView[]>(() => {
    const groups: SelectOptionGroupView[] = [];
    let current: SelectOptionGroupView | null = null;

    for (const item of this.options()) {
      if (isSelectOptionGroup(item)) {
        current = { label: item.group, options: item.children.map(normalizeSelectOption) };
        groups.push(current);
        continue;
      }
      if (!current) {
        current = { label: null, options: [] };
        groups.push(current);
      }
      current.options.push(normalizeSelectOption(item));
    }

    return groups;
  });

  /** 值到选项的索引，用于回显选中项的文案。 */
  protected readonly optionIndex = computed(() => {
    const map = new Map<SelectValue, SelectOptionObj>();
    for (const group of this.optionGroups()) {
      for (const option of group.options) map.set(option.value, option);
    }
    return map;
  });

  protected readonly selectedOptions = computed<SelectOptionObj[]>(() =>
    this.selectedValues().map((value) => this.optionIndex().get(value) ?? { value, label: String(value) }),
  );

  protected readonly displayText = computed(() =>
    this.selectedOptions()
      .map((option) => option.label ?? String(option.value))
      .join(', '),
  );

  /** 面板里真正显示的分组（考虑搜索词）。 */
  protected readonly visibleGroups = computed<SelectOptionGroupView[]>(() => {
    const groups = this.optionGroups();
    const keyword = this.query().trim().toLowerCase();
    if (!this.filterable() || !keyword) return groups;

    return groups
      .map((group) => ({
        label: group.label,
        options: group.options.filter((option) =>
          (option.label ?? String(option.value)).toLowerCase().includes(keyword),
        ),
      }))
      .filter((group) => group.options.length > 0);
  });

  /** 面板里可见且未禁用的选项，键盘导航只在其中移动。 */
  protected readonly navigableOptions = computed<SelectOptionObj[]>(() =>
    this.visibleGroups()
      .flatMap((group) => group.options)
      .filter((option) => !option.disabled),
  );

  protected readonly visibleCount = computed(() =>
    this.visibleGroups().reduce((count, group) => count + group.options.length, 0),
  );

  /** 可创建的新选项文案，不满足条件时为 `null`。 */
  protected readonly createLabel = computed<string | null>(() => {
    if (!this.creatable()) return null;
    const keyword = this.query().trim();
    if (!keyword) return null;
    const exists = this.navigableOptions().some(
      (option) => (option.label ?? String(option.value)).toLowerCase() === keyword.toLowerCase(),
    );
    return exists ? null : keyword;
  });

  protected readonly allowInput = computed(() => this.filterable());

  /** 已选中值时不再显示占位文字，否则多选的标签后面会紧跟一串占位符。 */
  protected readonly placeholderText = computed(() =>
    this.selectedValues().length === 0 ? this.placeholder() : undefined,
  );

  protected readonly inputValue = computed(() => {
    if (this.allowInput() && this.popupVisible()) return this.query();
    return this.multiple() ? '' : this.displayText();
  });

  protected readonly canClear = computed(
    () => this.clearable() && !this.mergedDisabled() && !this.readonly() && this.selectedValues().length > 0,
  );

  protected readonly wrapperClasses = computed(() => {
    const classes = ['t-select-input', 't-select'];
    classes.push(this.multiple() ? 't-select-input--multiple' : 't-select-input--single');
    if (this.borderless()) classes.push('t-select-input--borderless');
    if (this.popupVisible()) classes.push('t-select-input--popup-visible');
    if (this.selectedValues().length === 0) classes.push('t-select-input--empty');
    return classes.join(' ');
  });

  protected readonly boxClasses = computed(() => {
    const classes = [PREFIX_CLS, `${PREFIX_CLS}--prefix`, `${PREFIX_CLS}--suffix`];

    if (this.size() === 'small') classes.push('t-size-s');
    else if (this.size() === 'large') classes.push('t-size-l');
    if (this.status() !== 'default') classes.push(`t-is-${this.status()}`);
    if (this.borderless()) classes.push(`${PREFIX_CLS}--borderless`);
    if (this.focused() || this.popupVisible()) classes.push(`${PREFIX_CLS}--focused`, 't-is-focused');
    if (this.mergedDisabled()) classes.push('t-is-disabled');
    if (this.readonly()) classes.push('t-is-readonly');

    return classes.join(' ');
  });

  protected readonly tipsClasses = computed(() => `${PREFIX_CLS}__tips ${PREFIX_CLS}__tips--${this.status()}`);

  protected readonly arrowClasses = computed(() => {
    const classes = ['t-fake-arrow', 't-select__right-icon'];
    if (this.popupVisible()) classes.push('t-fake-arrow--active');
    return classes.join(' ');
  });

  /** 面板与选项共用同一个尺寸后缀：small→s、medium→m、large→l。 */
  private readonly sizeSuffix = computed(() => {
    const size = this.size();
    return size === 'small' ? 's' : size === 'large' ? 'l' : 'm';
  });

  protected readonly dropdownInnerClasses = computed(
    () => `t-select__dropdown-inner t-select__dropdown-inner--size-${this.sizeSuffix()}`,
  );

  writeValue(value: SelectSingleValue | SelectMultipleValue | null | undefined): void {
    this.innerValue.set(this.multiple() ? this.toArray(value) : this.toSingle(value));
  }

  registerOnChange(fn: (value: SelectSingleValue | SelectMultipleValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
    if (isDisabled) this.closePanel();
  }

  /** 供外部（如表单重置）主动聚焦。 */
  focusSelect(): void {
    this.inputElement()?.nativeElement.focus();
  }

  protected isSelected(value: SelectValue): boolean {
    return this.selectedValues().includes(value);
  }

  protected optionSizeClass(): string {
    return `t-size-${this.sizeSuffix()}`;
  }

  protected optionClasses(option: SelectOptionObj): string {
    const classes = ['t-select-option', this.optionSizeClass()];
    if (option.disabled) classes.push('t-is-disabled');
    if (this.isSelected(option.value)) classes.push('t-is-selected');
    if (!option.disabled && this.activeValue() === option.value) classes.push('t-select-option__hover');
    return classes.join(' ');
  }

  protected checkboxClasses(option: SelectOptionObj): string {
    const classes = ['t-checkbox'];
    if (this.isSelected(option.value)) classes.push('t-is-checked');
    if (option.disabled) classes.push('t-is-disabled');
    return classes.join(' ');
  }

  protected setActive(option: SelectOptionObj): void {
    if (option.disabled) return;
    this.activeValue.set(option.value);
  }

  protected handleWrapperClick(event: MouseEvent): void {
    if (this.mergedDisabled() || this.readonly()) return;
    if (this.popupVisible()) this.closePanel();
    else this.openPanel();
    this.focusSelect();
    event.stopPropagation();
  }

  protected handleInput(event: Event): void {
    if (!this.allowInput()) return;
    const keyword = (event.target as HTMLInputElement).value;
    this.query.set(keyword);
    this.search.emit(keyword);
    if (!this.popupVisible()) this.openPanel();
  }

  protected handleFocus(event: FocusEvent): void {
    this.focused.set(true);
    this.focus.emit(event);
  }

  protected handleBlur(event: FocusEvent): void {
    this.focused.set(false);
    this.onTouched();
    this.blur.emit(event);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.mergedDisabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.popupVisible()) {
          this.openPanel();
          return;
        }
        this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }
      case 'Enter': {
        if (!this.popupVisible()) {
          event.preventDefault();
          this.openPanel();
          return;
        }
        event.preventDefault();
        const active = this.activeValue();
        const option = active === null ? null : this.navigableOptions().find((item) => item.value === active);
        if (option) this.pickOption(option, event);
        else if (this.createLabel()) this.pickCreate(event);
        return;
      }
      case 'Escape': {
        if (!this.popupVisible()) return;
        event.preventDefault();
        this.closePanel();
        return;
      }
      case 'Backspace': {
        if (!this.multiple() || this.query() !== '') return;
        const values = this.selectedValues();
        if (values.length === 0) return;
        this.removeTag(values[values.length - 1], event);
        return;
      }
      case 'Tab': {
        this.closePanel();
        return;
      }
      default:
    }
  }

  protected pickOption(option: SelectOptionObj, event?: Event): void {
    if (option.disabled) return;

    if (!this.multiple()) {
      this.commit(option.value, 'default', option, event);
      this.closePanel();
      return;
    }

    const values = this.selectedValues();
    const exists = values.includes(option.value);
    if (exists) {
      const next = values.filter((value) => value !== option.value);
      this.commit(next, 'uncheck', option, event);
      return;
    }

    const max = this.max();
    if (max !== undefined && values.length >= max) return;

    this.commit([...values, option.value], 'check', option, event);
    this.query.set('');
  }

  protected pickCreate(event: Event): void {
    const label = this.createLabel();
    if (!label) return;
    this.create.emit(label);
    this.pickOption({ value: label, label }, event);
  }

  protected removeTag(value: SelectValue, event: Event): void {
    event.stopPropagation();
    if (this.mergedDisabled() || this.readonly()) return;
    const next = this.selectedValues().filter((item) => item !== value);
    const option = this.optionIndex().get(value);
    this.remove.emit({ value, option, event });
    this.commit(next, 'tag-remove', option, event);
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.mergedDisabled() || this.readonly()) return;
    this.clear.emit(event);
    this.commit(this.multiple() ? [] : null, 'clear', undefined, event);
    this.focusSelect();
  }

  private commit(
    value: SelectSingleValue | SelectMultipleValue,
    trigger: SelectValueChangeTrigger,
    option?: SelectOptionObj,
    event?: Event,
  ): void {
    this.innerValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.change.emit({
      value,
      option,
      selectedOptions: this.optionsFor(value),
      trigger,
      event,
    });
  }

  private optionsFor(value: SelectSingleValue | SelectMultipleValue): SelectOptionObj[] {
    return this.toArray(value).map((item) => this.optionIndex().get(item) ?? { value: item, label: String(item) });
  }

  private moveActive(delta: number): void {
    const options = this.navigableOptions();
    if (options.length === 0) return;

    const current = this.activeValue();
    const index = current === null ? -1 : options.findIndex((option) => option.value === current);
    const nextIndex = (index + delta + options.length) % options.length;
    this.activeValue.set(options[nextIndex].value);
  }

  private openPanel(): void {
    if (this.mergedDisabled() || this.readonly() || this.popupVisible()) return;

    const template = this.panelTemplate();
    if (!this.overlayRef) {
      const width = this.host.nativeElement.getBoundingClientRect().width;
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(this.host)
          .withPositions([
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
          ])
          .withPush(true),
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        width: `${Math.round(width)}px`,
        hasBackdrop: false,
      });

      this.overlayRef.outsidePointerEvents().subscribe((event) => {
        if (!this.overlayRef?.hasAttached()) return;
        const target = event.target as Node | null;
        if (target && this.host.nativeElement.contains(target)) return;
        this.closePanel();
      });

      this.overlayRef.keydownEvents().subscribe((event) => {
        if (event.key !== 'Escape' || !this.overlayRef?.hasAttached()) return;
        event.preventDefault();
        this.closePanel();
        this.focusSelect();
      });
    }

    this.overlayRef.attach(new TemplatePortal(template, this.viewContainerRef));
    this.popupVisible.set(true);
    this.query.set('');
    this.activeValue.set(this.navigableOptions()[0]?.value ?? null);
    this.popupVisibleChange.emit(true);
  }

  private closePanel(): void {
    if (!this.popupVisible()) return;
    this.overlayRef?.detach();
    this.popupVisible.set(false);
    this.query.set('');
    this.activeValue.set(null);
    this.popupVisibleChange.emit(false);
  }

  private toArray(value: SelectSingleValue | SelectMultipleValue | null | undefined): SelectValue[] {
    if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined);
    if (value === null || value === undefined || value === '') return [];
    return [value];
  }

  private toSingle(value: SelectSingleValue | SelectMultipleValue | null | undefined): SelectValue | null {
    if (Array.isArray(value)) return value.length > 0 ? value[0] : null;
    if (value === null || value === undefined || value === '') return null;
    return value;
  }

  private sameValues(left: SelectValue[], right: SelectValue[]): boolean {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }
}
