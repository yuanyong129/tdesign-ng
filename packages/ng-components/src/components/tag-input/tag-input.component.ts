import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TTag } from '../tag/tag.component';
import { InputOptionsDirective, limitInputText } from '../input/input-options';
import type { InputOptions } from '../input/input-options';
import type {
  TagInputChangeEvent,
  TagInputChangeTrigger,
  TagInputCollapsedContext,
  TagInputDragSortEvent,
  TagInputEnterEvent,
  TagInputExcessTagsDisplayType,
  TagInputFocusEvent,
  TagInputInputChangeEvent,
  TagInputInputChangeTrigger,
  TagInputPasteEvent,
  TagInputRemoveEvent,
  TagInputRichText,
  TagInputSize,
  TagInputStatus,
  TagInputValue,
  TagInputValueDisplayContext,
  TagInputTagProps,
} from './tag-input.types';

/** 把 `size` 翻译成类名，`medium` 是默认值不产生类名。 */
const SIZE_CLASS: Record<TagInputSize, string> = {
  small: 't-size-s',
  medium: '',
  large: 't-size-l',
};

/** `number` 属性允许被写成字符串（静态属性），统一转换。 */
function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * 标签输入框。
 *
 * ```html
 * <t-tag-input [(value)]="value" placeholder="请输入" [clearable]="true" />
 * <t-tag-input [(value)]="value" [max]="3" [minCollapsedNum]="2" />
 * ```
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类；
 * 标签复用 `t-tag`，`max` 只限制新增数量，`minCollapsedNum` 控制折叠。
 * 支持 `ngModel` / `formControlName`（实现了 `ControlValueAccessor`，值为数组）。
 */
@Component({
  selector: 't-tag-input',
  standalone: true,
  imports: [NgTemplateOutlet, TTag, InputOptionsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tag-input.component.html',
  host: {
    '[class]': 'classes()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TTagInput),
      multi: true,
    },
  ],
})
export class TTagInput implements ControlValueAccessor {
  /** 标签列表。 @zh 标签列表 @en Value of the tag input */
  readonly value = input<TagInputValue | undefined>(undefined);

  /** 非受控模式下的初始标签列表。 @zh 初始标签列表 @en Default value @defaultValue [] */
  readonly defaultValue = input<TagInputValue>([]);

  /** 输入框的内容。 @zh 输入框内容 @en Input value */
  readonly inputValue = input<string | undefined>(undefined);

  /** @zh 原生编辑区配置，支持 InputOptions 白名单，标签值与输入值仍由本组件管理 @en Supported native editor options; tag and input values remain managed by TagInput @defaultValue undefined */
  readonly inputProps = input<InputOptions | undefined>(undefined);

  /** @zh 标签外观与关闭配置，尺寸、内容和删除流程由本组件管理 @en Tag appearance and close options; size, content and removal remain managed by TagInput @defaultValue undefined */
  readonly tagProps = input<TagInputTagProps | undefined>(undefined);

  /** 非受控模式下输入框的初始内容。 @zh 初始输入内容 @en Default input value @defaultValue '' */
  readonly defaultInputValue = input<string>('');

  /** 占位文字，已有标签时不显示。 @zh 占位文字 @en Placeholder text */
  readonly placeholder = input<string | undefined>(undefined);

  /** 标签输入框尺寸。 @zh 尺寸 @en Size of the tag input @defaultValue medium @values small,medium,large */
  readonly size = input<TagInputSize>('medium');

  /** 标签输入框状态。 @zh 状态 @en Status of the tag input @defaultValue default @values default,success,warning,error */
  readonly status = input<TagInputStatus>('default');

  /** 最多可添加的标签数量，不限制时不传。 @zh 最大标签数量 @en Max number of tags */
  readonly max = input<number | undefined, unknown>(undefined, { transform: toNumber });

  /** 折叠时保留的标签数量，0 表示不折叠。 @zh 折叠时保留数量 @en Number of tags kept when collapsed @defaultValue 0 */
  readonly minCollapsedNum = input(0, { transform: (value: unknown) => toNumber(value) ?? 0 });

  /** 超出显示方式。 @zh 超出显示方式 @en Display type of excess tags @defaultValue break-line @values scroll,break-line */
  readonly excessTagsDisplayType = input<TagInputExcessTagsDisplayType>('break-line');

  /** 是否禁用。 @zh 是否禁用 @en Whether the tag input is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 是否只读。 @zh 是否只读 @en Whether the tag input is readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** 是否可清空，悬浮时显示清空图标。 @zh 是否可清空 @en Whether the tag input is clearable @defaultValue false */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** 是否无边框。 @zh 是否无边框 @en Whether the tag input is borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** 宽度是否随内容自适应。 @zh 宽度自适应 @en Whether the width fits the content @defaultValue false */
  readonly autoWidth = input(false, { transform: booleanAttribute });

  /** 是否开启标签拖拽排序。 @zh 是否开启拖拽排序 @en Whether drag sort is enabled @defaultValue false */
  readonly dragSort = input(false, { transform: booleanAttribute });

  /** 标签内容，传模板时带上 `value` 上下文。 @zh 标签内容 @en Tag content */
  readonly tag = input<TagInputRichText>(undefined);

  /** 折叠的标签内容，默认渲染为 `+N`。 @zh 折叠标签内容 @en Content of collapsed tags */
  readonly collapsedItems = input<TagInputRichText>(undefined);

  /** 自定义标签列表渲染，优先级高于 `tag`。 @zh 自定义标签列表 @en Custom tag list render */
  readonly valueDisplay = input<TagInputRichText>(undefined);

  /** 输入框左侧的标签文字。 @zh 左侧标签文字 @en Label on the left */
  readonly label = input<TagInputRichText>(undefined);

  /** 输入框前缀图标。 @zh 前缀图标 @en Prefix icon */
  readonly prefixIcon = input<TagInputRichText>(undefined);

  /** 输入框后缀图标。 @zh 后缀图标 @en Suffix icon */
  readonly suffixIcon = input<TagInputRichText>(undefined);

  /** 输入框后缀内容。 @zh 后缀内容 @en Suffix content */
  readonly suffix = input<TagInputRichText>(undefined);

  /** 输入框下方的提示文字。 @zh 提示文字 @en Tips below the tag input */
  readonly tips = input<TagInputRichText>(undefined);

  /** 标签列表变化事件，用于双向绑定。 @zh 标签列表变化 @en Value change event */
  readonly valueChange = output<TagInputValue>();

  /** 标签列表变化事件，携带触发来源。 @zh 标签列表变化（带来源） @en Change event with trigger source */
  readonly change = output<TagInputChangeEvent>();

  /** 输入框内容变化事件，用于双向绑定。 @zh 输入内容变化 @en Input value change event */
  readonly inputValueChange = output<string>();

  /** 输入框内容变化事件，携带触发来源。 @zh 输入内容变化（带来源） @en Input change event with trigger source */
  readonly inputChange = output<TagInputInputChangeEvent>();

  /** 删除标签事件。 @zh 删除标签 @en Remove tag event */
  readonly remove = output<TagInputRemoveEvent>();

  /** 拖拽排序事件，`newTags` 为排序后的标签列表。 @zh 拖拽排序 @en Drag sort event */
  readonly dragSortChange = output<TagInputDragSortEvent>();

  /** 按下回车事件。 @zh 按下回车 @en Enter key event */
  readonly enter = output<TagInputEnterEvent>();

  /** 获得焦点事件。 @zh 获得焦点 @en Focus event */
  readonly focus = output<TagInputFocusEvent>();

  /** 失去焦点事件。 @zh 失去焦点 @en Blur event */
  readonly blur = output<TagInputFocusEvent>();

  /** 点击清空图标事件。 @zh 点击清空图标 @en Clear icon click event */
  readonly clear = output<MouseEvent>();

  /** 鼠标移入事件。 @zh 鼠标移入 @en Mouse enter event */
  readonly mouseenter = output<MouseEvent>();

  /** 鼠标移出事件。 @zh 鼠标移出 @en Mouse leave event */
  readonly mouseleave = output<MouseEvent>();

  /** 粘贴事件，`pasteValue` 为剪贴板文本。 @zh 粘贴 @en Paste event */
  readonly paste = output<TagInputPasteEvent>();

  private readonly injector = inject(Injector);

  private readonly innerInput = viewChild<ElementRef<HTMLInputElement>>('inner');

  private readonly prefixRef = viewChild<ElementRef<HTMLElement>>('prefix');

  private readonly preRef = viewChild<ElementRef<HTMLElement>>('pre');

  /** 非受控模式下的标签列表，`null` 表示还没被用户改过。 */
  private readonly valueOverride = signal<TagInputValue | null>(null);

  /** 非受控模式下的输入内容。 */
  private readonly inputOverride = signal<string | null>(null);

  /** 表单通过 `setDisabledState` 下发的禁用态，与模板上的 `disabled` 取并集。 */
  private readonly disabledByForms = signal(false);

  private readonly hovered = signal(false);

  private readonly focused = signal(false);

  protected readonly inputWidth = signal<number | null>(null);

  private readonly scrollable = signal(false);

  private readonly dragIndex = signal<number | null>(null);

  private onChange: (value: TagInputValue) => void = () => {};

  private onTouched: () => void = () => {};

  constructor() {
    // 值变化后重新测量输入框宽度与标签区是否溢出。
    effect(() => {
      this.value();
      this.inputValue();
      this.excessTagsDisplayType();
      afterNextRender(() => this.measure(), { injector: this.injector });
    });
  }

  /** 合并后的标签列表：受控 `value` 优先，其次用户改动，最后 `defaultValue`。 */
  protected readonly mergedValue = computed<TagInputValue>(
    () => this.value() ?? this.valueOverride() ?? this.defaultValue(),
  );

  /** 合并后的输入内容。 */
  protected readonly mergedInputValue = computed(
    () => this.inputValue() ?? this.inputOverride() ?? this.defaultInputValue(),
  );

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms() || !!this.inputProps()?.disabled);

  protected readonly mergedReadonly = computed(() => this.readonly() || !!this.inputProps()?.readonly);

  protected readonly hasTags = computed(() => this.mergedValue().length > 0);

  protected readonly dragEnabled = computed(
    () => this.dragSort() && !this.mergedReadonly() && !this.mergedDisabled(),
  );

  protected readonly classes = computed(() => {
    const classes = ['t-tag-input'];
    if (this.excessTagsDisplayType() === 'break-line') classes.push('t-tag-input--break-line');
    if (this.hasTags()) classes.push('t-tag-input--with-tag');
    else classes.push('t-is-empty');
    if (this.dragEnabled()) classes.push('t-tag-input--drag-sort');
    if (this.autoWidth()) classes.push('t-input--auto-width');
    if (this.suffixIcon()) classes.push('t-tag-input__with-suffix-icon');
    return classes.join(' ');
  });

  protected readonly boxClasses = computed(() => {
    const classes = ['t-input', 't-input--prefix', 't-input--suffix'];
    const sizeClass = SIZE_CLASS[this.size()];
    if (sizeClass) classes.push(sizeClass);
    if (this.status() !== 'default') classes.push(`t-is-${this.status()}`);
    if (this.borderless()) classes.push('t-input--borderless');
    if (this.focused()) classes.push('t-input--focused', 't-is-focused');
    if (this.mergedDisabled()) classes.push('t-is-disabled');
    if (this.mergedReadonly()) classes.push('t-is-readonly');
    return classes.join(' ');
  });

  protected readonly prefixClasses = computed(() =>
    this.scrollable() ? 't-input__prefix t-input__prefix--scrollable' : 't-input__prefix',
  );

  protected readonly suffixClasses = computed(() =>
    this.suffixIcon() ? 't-input__suffix t-input__suffix-icon' : 't-input__suffix',
  );

  protected readonly tipsClasses = computed(() => `t-input__tips t-input__tips--${this.status()}`);

  /** 只读且已有标签时输入框收缩为 0 宽。 */
  protected readonly showInput = computed(() => !this.mergedReadonly() || !this.hasTags());

  protected readonly placeholderText = computed(() => (this.hasTags() ? '' : (this.placeholder() ?? '')));

  protected readonly previewText = computed(() => this.mergedInputValue() || this.placeholderText());

  protected readonly canClear = computed(
    () =>
      this.clearable() &&
      !this.mergedDisabled() &&
      !this.mergedReadonly() &&
      this.hovered() &&
      (this.hasTags() || this.mergedInputValue() !== ''),
  );

  /** 需要直接渲染的标签（折叠时只渲染前 `minCollapsedNum` 个），带原始下标。 */
  protected readonly visibleTags = computed<ReadonlyArray<{ item: string | number; index: number }>>(() => {
    const list = this.mergedValue();
    const minCollapsedNum = this.minCollapsedNum();
    const count = minCollapsedNum > 0 ? Math.min(minCollapsedNum, list.length) : list.length;
    return list.slice(0, count).map((item, index) => ({ item, index }));
  });

  protected readonly collapsedCount = computed(() => {
    const minCollapsedNum = this.minCollapsedNum();
    const length = this.mergedValue().length;
    return minCollapsedNum > 0 && length > minCollapsedNum ? length - minCollapsedNum : 0;
  });

  protected readonly collapsedSelectedItems = computed(() =>
    this.mergedValue().slice(this.minCollapsedNum()),
  );

  protected readonly collapsedContext = computed<TagInputCollapsedContext>(() => ({
    value: this.mergedValue(),
    collapsedSelectedItems: this.collapsedSelectedItems(),
    count: this.collapsedCount(),
    onClose: (context) => this.removeTag(context.index, context.e),
  }));

  protected readonly valueDisplayContext = computed<TagInputValueDisplayContext>(() => ({
    value: this.mergedValue(),
  }));

  protected readonly tagTemplate = computed<TemplateRef<unknown> | null>(() => this.asTemplate(this.tag()));

  protected readonly tagLabel = computed(() => this.asText(this.tag()));

  protected readonly collapsedTemplate = computed<TemplateRef<unknown> | null>(() =>
    this.asTemplate(this.collapsedItems()),
  );

  /**
   * 同步表单值。
   */
  writeValue(value: TagInputValue | null | undefined): void {
    this.valueOverride.set(Array.isArray(value) ? [...value] : []);
  }

  registerOnChange(fn: (value: TagInputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }

  /** 供外部主动聚焦。 */
  focusInput(): void {
    this.innerInput()?.nativeElement.focus();
  }

  protected asTemplate(value: TagInputRichText): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  protected asText(value: TagInputRichText): string | null {
    return typeof value === 'string' ? value : null;
  }

  protected handleMouseEnter(event: MouseEvent): void {
    this.hovered.set(true);
    this.mouseenter.emit(event);
  }

  protected handleMouseLeave(event: MouseEvent): void {
    this.hovered.set(false);
    this.mouseleave.emit(event);
  }

  /** 点击输入框任意位置都聚焦到原生输入框。 */
  protected handleBoxClick(): void {
    if (this.mergedDisabled()) return;
    this.focusInput();
  }

  protected handleFocus(event: FocusEvent): void {
    this.focused.set(true);
    this.focus.emit({ value: this.mergedValue(), inputValue: this.mergedInputValue(), event });
  }

  protected handleBlur(event: FocusEvent): void {
    this.focused.set(false);
    this.onTouched();
    this.blur.emit({ value: this.mergedValue(), inputValue: this.mergedInputValue(), event });
    if (this.mergedInputValue() !== '') this.updateInputValue('', 'blur', event);
  }

  protected handleInput(event: Event): void {
    if (this.mergedDisabled() || this.mergedReadonly() || this.composing) return;
    const target = event.target as HTMLInputElement;
    if (event.type === 'input' && this.compositionValue !== undefined) {
      const previous = this.compositionValue;
      this.compositionValue = undefined;
      if (target.value === previous) return;
    }
    target.value = limitInputText(target.value, this.inputProps());
    if (target.value === this.mergedInputValue()) return;
    this.updateInputValue(target.value, 'input', event);
    this.inputProps()?.onChange?.(target.value, { e: event });
  }

  protected handlePaste(event: ClipboardEvent): void {
    this.paste.emit({ pasteValue: event.clipboardData?.getData('text') ?? '', event });
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.mergedDisabled() || this.mergedReadonly() || event.isComposing || this.composing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      const inputValue = this.mergedInputValue();
      this.updateInputValue('', 'enter', event);
      let next = this.mergedValue();
      const text = inputValue.trim();
      const max = this.max();
      if (!event.isComposing && text !== '' && (max === undefined || next.length < max)) {
        next = [...next, text];
        this.commitValue(next, 'enter', { index: next.length - 1, item: text, event });
      }
      this.enter.emit({ value: next, inputValue, event });
      return;
    }

    const isDeleteKey = event.key === 'Backspace' || event.key === 'Delete';
    if (
      isDeleteKey &&
      this.mergedInputValue() === '' &&
      this.hasTags() &&
      !this.mergedDisabled() &&
      !this.mergedReadonly()
    ) {
      event.preventDefault();
      const list = this.mergedValue();
      const index = list.length - 1;
      const item = list[index];
      const next = list.slice(0, index);
      this.commitValue(next, 'backspace', { index, item, event });
      this.remove.emit({ value: next, index, item, trigger: 'backspace', event });
    }
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.mergedDisabled() || this.mergedReadonly()) return;
    this.updateInputValue('', 'clear', event);
    this.commitValue([], 'clear', { event });
    this.clear.emit(event);
    this.focusInput();
  }

  protected removeTag(index: number, event?: MouseEvent): void {
    if (this.mergedDisabled() || this.mergedReadonly() || this.tagProps()?.disabled || this.tagProps()?.closable === false) return;
    const list = this.mergedValue();
    const item = list[index];
    if (item === undefined) return;
    const next = list.filter((_, i) => i !== index);
    this.commitValue(next, 'tag-remove', { index, item, event });
    this.remove.emit({ value: next, index, item, trigger: 'tag-remove', event });
    if (event) this.tagProps()?.onClose?.({ e: event });
  }

  private composing = false;
  private compositionValue: string | undefined;

  protected handleCompositionStart(): void {
    this.composing = true;
    this.compositionValue = undefined;
  }
  protected handleCompositionEnd(event: CompositionEvent): void {
    this.composing = false;
    if ((event.target as HTMLInputElement).value !== this.mergedInputValue()) this.handleInput(event);
    this.compositionValue = (event.target as HTMLInputElement).value;
  }

  protected handleDragStart(event: DragEvent, index: number): void {
    if (!this.dragEnabled()) return;
    this.dragIndex.set(index);
    event.dataTransfer?.setData('text/plain', String(index));
  }

  protected handleDragOver(event: DragEvent, index: number): void {
    if (!this.dragEnabled()) return;
    event.preventDefault();
    const from = this.dragIndex();
    if (from === null || from === index) return;
    const list = this.mergedValue();
    const current = list[from];
    const target = list[index];
    if (current === undefined || target === undefined) return;
    const newTags = [...list];
    newTags.splice(from, 1);
    newTags.splice(index, 0, current);
    this.dragIndex.set(index);
    this.valueOverride.set(newTags);
    this.dragSortChange.emit({ newTags, currentIndex: from, current, targetIndex: index, target });
  }

  protected handleDrop(event: DragEvent): void {
    if (!this.dragEnabled()) return;
    event.preventDefault();
  }

  protected handleDragEnd(): void {
    this.dragIndex.set(null);
  }

  /** 标签列表变化统一出口：内部状态、表单、双向绑定与事件一起更新。 */
  private commitValue(
    next: TagInputValue,
    trigger: TagInputChangeTrigger,
    extra: { index?: number; item?: string | number; event?: MouseEvent | KeyboardEvent } = {},
  ): void {
    this.valueOverride.set(next);
    this.onChange(next);
    this.valueChange.emit(next);
    this.change.emit({ value: next, trigger, ...extra });
  }

  /** 输入内容变化统一出口。 */
  private updateInputValue(next: string, trigger: TagInputInputChangeTrigger, event?: Event): void {
    this.inputOverride.set(next);
    this.inputValueChange.emit(next);
    this.inputChange.emit({ value: next, trigger, event });
  }

  /** 测量输入框内容宽度与标签区是否横向溢出。 */
  private measure(): void {
    const pre = this.preRef()?.nativeElement;
    if (pre) {
      const width = Math.round(pre.getBoundingClientRect().width);
      if (width > 0 && width !== this.inputWidth()) this.inputWidth.set(width);
    }

    const prefix = this.prefixRef()?.nativeElement;
    if (prefix) {
      const scrollable =
        this.excessTagsDisplayType() === 'scroll' && prefix.scrollWidth > prefix.clientWidth;
      if (scrollable !== this.scrollable()) this.scrollable.set(scrollable);
    }
  }
}
