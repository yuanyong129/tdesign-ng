import { useFormReadonly } from '../../_utils/form-readonly';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { PopupPlacement, PopupTrigger } from '../popup/popup.types';
import { TLoading } from '../loading/loading.component';
import { TPopup } from '../popup/popup.component';
import { TTag } from '../tag/tag.component';
import type { TagTheme, TagVariant } from '../tag/tag.types';
import {
  SelectInputBlurEvent,
  SelectInputClearEvent,
  SelectInputCollapsedItemsContext,
  SelectInputEnterEvent,
  SelectInputFocusEvent,
  SelectInputInputChangeEvent,
  SelectInputKeys,
  SelectInputPasteEvent,
  SelectInputPopupProps,
  SelectInputSize,
  SelectInputStatus,
  SelectInputTagChangeEvent,
  SelectInputTagContext,
  SelectInputTagProps,
  SelectInputTagValue,
  SelectInputValue,
  SelectInputValueChangeContext,
  SelectInputValueDisplayContext,
} from './select-input.types';
import type { Content } from '../../_utils/content';

const PREFIX_CLS = 't-input';

/** 对象取值的默认字段名。 */
const DEFAULT_KEYS: Required<SelectInputKeys> = { label: 'label', value: 'value', children: 'children' };

/** 富文本属性：字符串按文本渲染，`TemplateRef` 交给 `ngTemplateOutlet` 渲染。 */
export type SelectInputContent = Content;

/** 值是否为「对象形态」（用于按 `keys.label` 取值）。 */
function isObjectLike(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

/** 取对象里的展示文本。 */
function readLabel(value: unknown, keys: Required<SelectInputKeys>): string | number | undefined {
  if (isObjectLike(value)) {
    const label = value[keys.label];
    return typeof label === 'string' || typeof label === 'number' ? label : undefined;
  }
  if (value === undefined || value === null) return undefined;
  return typeof value === 'string' || typeof value === 'number' ? value : String(value);
}

/**
 * 选择器输入框。
 *
 * 既是可编辑输入框，也是标签回显容器与下拉面板的插槽底座：
 * `t-select` / `t-tree-select` / `t-cascader` 都以它为视觉与交互基座。
 *
 * ```html
 * <t-select-input [(value)]="value" [allowInput]="true" placeholder="请输入" />
 * <t-select-input [multiple]="true" [value]="tags" [minCollapsedNum]="2" />
 * <t-select-input [value]="value" [panel]="panelTpl" [(popupVisible)]="visible" />
 * ```
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-select-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './select-input.component.html',
  imports: [NgTemplateOutlet, TLoading, TPopup, TTag],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TSelectInput),
      multi: true,
    },
  ],
  host: {
    '[class]': 'classes()',
  },
})
export class TSelectInput implements OnInit, AfterViewInit, ControlValueAccessor {
  /** 是否允许输入。 @zh 是否允许输入 @en allowInput @defaultValue false */
  readonly allowInput = input(false, { transform: booleanAttribute });

  /** 宽度是否随内容自适应。 @zh 宽度自适应 @en autoWidth @defaultValue false */
  readonly autoWidth = input(false, { transform: booleanAttribute });

  /** 是否自动聚焦。 @zh 自动聚焦 @en autofocus @defaultValue false */
  readonly autofocus = input(false, { transform: booleanAttribute });

  /** 是否无边框。 @zh 无边框 @en borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** 是否可清空。 @zh 可清空 @en clearable @defaultValue false */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** 折叠标签的自定义渲染模板。 @zh 折叠标签模板 @en collapsedItems @defaultValue undefined */
  readonly collapsedItems = input<TemplateRef<SelectInputCollapsedItemsContext> | undefined>(undefined);

  /** 是否禁用。 @zh 禁用 @en disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 受控的输入框文本。 @zh 输入框文本 @en inputValue @defaultValue undefined */
  readonly inputValue = input<string | number | undefined>(undefined);

  /** 非受控的初始输入框文本。 @zh 默认输入框文本 @en defaultInputValue @defaultValue undefined */
  readonly defaultInputValue = input<string | number | undefined>(undefined);

  /** 对象取值的字段映射。 @zh 字段映射 @en keys @defaultValue undefined */
  readonly keys = input<SelectInputKeys | undefined>(undefined);

  /** 左侧标签文字。 @zh 标签文字 @en label @defaultValue undefined */
  readonly label = input<SelectInputContent>(undefined);

  /** 是否处于加载状态。 @zh 加载中 @en loading @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /** 多选时超过该数量就折叠标签，0 表示不折叠。 @zh 折叠数量 @en minCollapsedNum @defaultValue 0 */
  readonly minCollapsedNum = input(0);

  /** 是否多选。 @zh 多选 @en multiple @defaultValue false */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** 下拉面板内容。 @zh 下拉面板 @en panel @defaultValue undefined */
  readonly panel = input<SelectInputContent>(undefined);

  /** 占位文字。 @zh 占位文字 @en placeholder @defaultValue '' */
  readonly placeholder = input('');

  /** 弹层属性，当前支持 trigger / placement / overlayClassName / showArrow。 @zh 弹层属性 @en popupProps @defaultValue undefined */
  readonly popupProps = input<SelectInputPopupProps | undefined>(undefined);

  /** 受控的弹层展开状态。 @zh 弹层展开 @en popupVisible @defaultValue undefined */
  readonly popupVisible = input<boolean | undefined>(undefined);

  /** 非受控的初始弹层展开状态。 @zh 默认弹层展开 @en defaultPopupVisible @defaultValue false */
  readonly defaultPopupVisible = input(false, { transform: booleanAttribute });

  /** 是否只读。 @zh 只读 @en readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });
  protected readonly formReadonly = useFormReadonly(this.readonly);

  /** 弹层收起后是否保留输入的关键字。 @zh 保留关键字 @en reserveKeyword @defaultValue false */
  readonly reserveKeyword = input(false, { transform: booleanAttribute });

  /** 选择器尺寸。 @zh 尺寸 @en size @defaultValue 'medium' @values small,medium,large */
  readonly size = input<SelectInputSize>('medium');

  /** 选择器状态。 @zh 状态 @en status @defaultValue 'default' @values default,success,warning,error */
  readonly status = input<SelectInputStatus>('default');

  /** 输入框后缀内容。 @zh 后缀内容 @en suffix @defaultValue undefined */
  readonly suffix = input<SelectInputContent>(undefined);

  /** 自定义标签模板。 @zh 自定义标签 @en tag @defaultValue undefined */
  readonly tag = input<TemplateRef<SelectInputTagContext> | string | undefined>(undefined);

  /** 标签属性，当前支持 theme / variant / maxWidth。 @zh 标签属性 @en tagProps @defaultValue undefined */
  readonly tagProps = input<SelectInputTagProps | undefined>(undefined);

  /** 输入框下方的提示文字。 @zh 提示文字 @en tips @defaultValue undefined */
  readonly tips = input<SelectInputContent>(undefined);

  /** 当前的值，多选时是数组。 @zh 当前值 @en value @defaultValue undefined */
  readonly value = input<SelectInputValue | undefined>(undefined);

  /** 自定义值展示模板。 @zh 值展示模板 @en valueDisplay @defaultValue undefined */
  readonly valueDisplay = input<TemplateRef<SelectInputValueDisplayContext> | string | undefined>(undefined);

  /** 失焦事件。 @zh 失焦 @en blur */
  readonly blur = output<SelectInputBlurEvent>();

  /** 清空事件。 @zh 清空 @en clear */
  readonly clear = output<SelectInputClearEvent>();

  /** 回车事件。 @zh 回车 @en enter */
  readonly enter = output<SelectInputEnterEvent>();

  /** 聚焦事件。 @zh 聚焦 @en focus */
  readonly focus = output<SelectInputFocusEvent>();

  /** 输入框文本变化事件。 @zh 输入变化 @en inputChange */
  readonly inputChange = output<SelectInputInputChangeEvent>();

  /** 粘贴事件。 @zh 粘贴 @en paste */
  readonly paste = output<SelectInputPasteEvent>();

  /** 弹层展开状态变化，用于双向绑定。 @zh 弹层展开变化 @en popupVisibleChange */
  readonly popupVisibleChange = output<boolean>();

  /** 标签变化事件。 @zh 标签变化 @en tagChange */
  readonly tagChange = output<SelectInputTagChangeEvent>();

  /** 值变化事件，用于双向绑定。 @zh 值变化 @en valueChange */
  readonly valueChange = output<SelectInputValue>();

  private readonly singleInputRef = viewChild<ElementRef<HTMLInputElement>>('singleInput');

  private readonly multipleInputRef = viewChild<ElementRef<HTMLInputElement>>('multipleInput');

  /** 表单通过 `setDisabledState` 下发的禁用态，与模板上的 `disabled` 取并集。 */
  private readonly disabledByForms = signal(false);

  private readonly focused = signal(false);

  private readonly innerValue = signal<SelectInputValue | undefined>(undefined);

  private readonly innerInputValue = signal('');

  private readonly innerPopupVisible = signal(false);

  private onChange: (value: SelectInputValue) => void = () => {};

  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      if (this.formReadonly() || this.mergedDisabled()) untracked(() => {
        this.innerPopupVisible.set(false);
      });
    });
    // 外部 `[value]` 变化时同步到内部状态；用户操作时不回写，避免打断交互。
    effect(() => {
      const next = this.value();
      untracked(() => {
        if (!this.sameValue(next, this.innerValue())) this.innerValue.set(next);
      });
    });

    // 受控的 `inputValue`：父组件改了才回写输入框。
    effect(() => {
      const next = this.inputValue();
      untracked(() => {
        if (next === undefined) return;
        const text = String(next);
        if (text !== this.innerInputValue()) this.innerInputValue.set(text);
      });
    });

    // 受控的 `popupVisible`。
    effect(() => {
      const next = this.popupVisible();
      untracked(() => {
        if (next === undefined) return;
        if (next !== this.innerPopupVisible()) this.innerPopupVisible.set(next);
      });
    });
  }

  ngOnInit(): void {
    if (this.innerValue() === undefined && this.value() !== undefined) {
      this.innerValue.set(this.value());
    }
    const controlled = this.inputValue();
    if (controlled !== undefined) {
      this.innerInputValue.set(String(controlled));
    } else if (this.defaultInputValue() !== undefined) {
      this.innerInputValue.set(String(this.defaultInputValue()));
    }
    this.innerPopupVisible.set(this.popupVisible() ?? this.defaultPopupVisible());
  }

  ngAfterViewInit(): void {
    if (this.autofocus()) this.focusInput();
  }

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  protected readonly isPopupVisible = computed(() => !this.formReadonly() && !this.mergedDisabled() && (this.popupVisible() ?? this.innerPopupVisible()));

  protected readonly hasPanel = computed(() => {
    const panel = this.panel();
    return panel !== undefined && panel !== '';
  });

  /** 多选模式下的值列表，非数组时按单项处理。 */
  protected readonly valueItems = computed<SelectInputValue[]>(() => {
    const value = this.innerValue();
    if (Array.isArray(value)) return value;
    return value === undefined || value === null ? [] : [value];
  });

  /** 多选模式下展示的标签值。 */
  protected readonly tags = computed<SelectInputTagValue[]>(() => {
    const keys = this.mergedKeys();
    return this.valueItems()
      .map((item) => readLabel(item, keys))
      .filter((item): item is SelectInputTagValue => item !== undefined);
  });

  protected readonly wrapperClasses = computed(() =>
    [
      't-select-input',
      this.multiple() ? 't-select-input--multiple' : 't-select-input--single',
      this.borderless() ? 't-select-input--borderless' : '',
      this.isPopupVisible() ? 't-select-input--popup-visible' : '',
      this.isEmptyValue() ? 't-select-input--empty' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly classes = computed(() => this.wrapperClasses());

  protected readonly boxClasses = computed(() => {
    const classes = [PREFIX_CLS, `${PREFIX_CLS}--prefix`, `${PREFIX_CLS}--suffix`];

    if (this.size() === 'small') classes.push('t-size-s');
    else if (this.size() === 'large') classes.push('t-size-l');
    if (this.status() !== 'default') classes.push(`t-is-${this.status()}`);
    if (this.borderless()) classes.push(`${PREFIX_CLS}--borderless`);
    if (this.autoWidth()) classes.push(`${PREFIX_CLS}--auto-width`);
    if (this.focused() || this.isPopupVisible()) classes.push(`${PREFIX_CLS}--focused`, 't-is-focused');
    if (this.mergedDisabled()) classes.push('t-is-disabled');
    if (this.formReadonly()) classes.push('t-is-readonly');

    return classes.join(' ');
  });

  protected readonly tagInputClasses = computed(() =>
    ['t-tag-input', this.tags().length ? 't-tag-input--with-tag' : 't-is-empty'].filter(Boolean).join(' '),
  );

  protected readonly tipsClasses = computed(() => `${PREFIX_CLS}__tips t-tips t-is-${this.status()}`);

  protected readonly labelText = computed(() => {
    const label = this.label();
    return typeof label === 'string' ? label : '';
  });

  protected readonly labelTemplate = computed(() => this.asTemplate(this.label()));

  protected readonly suffixText = computed(() => {
    const suffix = this.suffix();
    return typeof suffix === 'string' ? suffix : '';
  });

  protected readonly suffixTemplate = computed(() => this.asTemplate(this.suffix()));

  protected readonly panelText = computed(() => {
    const panel = this.panel();
    return typeof panel === 'string' ? panel : '';
  });

  protected readonly panelTemplate = computed(() => this.asTemplate(this.panel()));

  protected readonly tipsText = computed(() => {
    const tips = this.tips();
    return typeof tips === 'string' ? tips : '';
  });

  protected readonly tipsTemplate = computed(() => this.asTemplate(this.tips()));

  protected readonly tagTemplate = computed(() => this.asTemplate(this.tag()));

  protected readonly valueDisplayTemplate = computed(() => this.asTemplate(this.valueDisplay()));

  protected readonly collapsedItemsTemplate = computed(() => {
    const template = this.collapsedItems();
    return template instanceof TemplateRef ? template : null;
  });

  protected readonly valueDisplayText = computed(() => {
    const display = this.valueDisplay();
    return typeof display === 'string' ? display : '';
  });

  /** 是否配置了自定义值展示，配置后输入框本身不再回显文本。 */
  protected readonly hasValueDisplay = computed(
    () => this.valueDisplayTemplate() !== null || this.valueDisplayText() !== '',
  );

  protected readonly valueDisplayContext = computed<SelectInputValueDisplayContext>(() => ({
    $implicit: this.tags(),
    value: this.tags(),
    onClose: (index: number, item?: SelectInputTagValue) => this.removeTagAt(index, item),
  }));

  protected readonly collapsedItemsContext = computed<SelectInputCollapsedItemsContext>(() => {
    const min = this.minCollapsedNum();
    const tags = this.tags();
    const collapsed = min > 0 ? tags.slice(min) : [];
    return {
      $implicit: tags,
      value: tags,
      collapsedSelectedItems: collapsed,
      count: collapsed.length,
      onClose: (context: { index: number; e?: MouseEvent }) => this.removeTagAt(min + context.index, undefined, context.e),
    };
  });

  protected readonly visibleTags = computed<SelectInputTagValue[]>(() => {
    const tags = this.tags();
    const min = this.minCollapsedNum();
    return min > 0 && tags.length > min ? tags.slice(0, min) : tags;
  });

  protected readonly collapsedCount = computed(() => {
    const tags = this.tags();
    const min = this.minCollapsedNum();
    return min > 0 && tags.length > min ? tags.length - min : 0;
  });

  protected readonly collapsedTitle = computed(() => this.tags().slice(this.minCollapsedNum()).join(', '));

  protected readonly tagTheme = computed<TagTheme>(() => this.tagProps()?.theme ?? 'default');

  protected readonly tagVariant = computed<TagVariant>(() => this.tagProps()?.variant ?? 'light');

  protected readonly tagMaxWidth = computed(() => this.tagProps()?.maxWidth ?? 300);

  protected readonly popupTrigger = computed<PopupTrigger>(() => this.popupProps()?.trigger ?? 'click');

  protected readonly popupPlacement = computed<PopupPlacement>(() => this.popupProps()?.placement ?? 'bottom-left');

  protected readonly popupShowArrow = computed(() => this.popupProps()?.showArrow ?? false);

  protected readonly popupOverlayClassName = computed(() => this.popupProps()?.overlayClassName ?? null);

  /** 单选模式下输入框里真实展示的文本。 */
  protected readonly singleInputValue = computed(() => {
    if (this.isPopupVisible() && this.allowInput()) return this.innerInputValue();
    return this.hasValueDisplay() ? '' : this.displayText();
  });

  /** 单选模式下的回显文本，按 `keys.label` 从对象里取。 */
  protected readonly displayText = computed(() => {
    const label = readLabel(this.innerValue(), this.mergedKeys());
    return label === undefined ? '' : String(label);
  });

  protected readonly singlePlaceholder = computed(() => {
    if (!this.hasValueDisplay()) return this.placeholder();
    if (!this.hasValue() || (this.allowInput() && this.isPopupVisible())) return this.placeholder();
    return '';
  });

  protected readonly singleReadonly = computed(() => !this.allowInput() || this.formReadonly());

  protected readonly multipleInputValue = computed(() =>
    this.isPopupVisible() && this.allowInput() ? this.innerInputValue() : '',
  );

  protected readonly multiplePlaceholder = computed(() => (this.tags().length === 0 ? this.placeholder() : ''));

  protected readonly multipleReadonly = computed(() => !this.allowInput() || this.formReadonly());

  protected readonly showClearIcon = computed(() => {
    if (!this.clearable() || this.mergedDisabled() || this.formReadonly()) return false;
    if (this.multiple()) return this.tags().length > 0;
    return this.innerInputValue() !== '' || this.displayText() !== '';
  });

  protected readonly loadingIcon = computed(() => this.loading() && !this.mergedDisabled());

  /** 自定义标签的渲染上下文。 */
  protected tagContext(tag: SelectInputTagValue): SelectInputTagContext {
    return { $implicit: tag, value: tag };
  }

  protected handleInput(event: Event): void {
    if (!this.allowInput() || this.mergedDisabled() || this.formReadonly()) return;
    const text = (event.target as HTMLInputElement).value;
    this.commitInputValue(text, { trigger: 'input', e: event });
  }

  protected handleFocus(event: FocusEvent): void {
    this.focused.set(true);
    this.focus.emit({
      value: this.innerValue(),
      e: event,
      inputValue: this.innerInputValue(),
      ...(this.multiple() ? { tagInputValue: this.tags() } : {}),
    });
  }

  protected handleBlur(event: FocusEvent): void {
    this.focused.set(false);
    this.onTouched();
    // 点在弹层面板上不算失焦（弹层挂在 CDK overlay 上，DOM 里不在宿主内）。
    const related = event.relatedTarget;
    if (related instanceof Element && related.closest('.t-popup')) return;
    this.blur.emit({
      value: this.innerValue(),
      e: event,
      inputValue: this.innerInputValue(),
      ...(this.multiple() ? { tagInputValue: this.tags() } : {}),
    });
  }

  protected handleKeydown(event: KeyboardEvent): void {
    const isArrow = event.key === 'ArrowDown' || event.key === 'ArrowUp';
    if (isArrow && !this.isPopupVisible() && this.hasPanel() && !this.mergedDisabled()) {
      event.preventDefault();
      this.handlePopupVisibleChange(true);
      return;
    }
    if (event.key === 'Enter') {
      this.enter.emit({
        value: this.innerValue(),
        e: event,
        inputValue: this.innerInputValue(),
        ...(this.multiple() ? { tagInputValue: this.tags() } : {}),
      });
    }
  }

  protected handlePaste(event: ClipboardEvent): void {
    this.paste.emit({ e: event, pasteValue: event.clipboardData?.getData('text') ?? '' });
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.formReadonly() || this.mergedDisabled()) return;
    this.clear.emit({ e: event });
    this.commitInputValue('', { trigger: 'clear', e: event });
    if (this.multiple() && this.tags().length > 0) {
      this.emitValue([]);
      this.tagChange.emit({ value: [], trigger: 'clear', e: event });
    }
  }

  protected handlePopupVisibleChange(visible: boolean): void {
    if (visible && (this.formReadonly() || this.mergedDisabled())) return;
    if (this.popupVisible() === undefined) this.innerPopupVisible.set(visible);
    this.popupVisibleChange.emit(visible);
  }

  protected handleBoxClick(event: MouseEvent): void {
    if (this.mergedDisabled() || this.formReadonly()) return;
    const target = event.target;
    if (target instanceof Element && target.closest('.t-tag__icon-close, .t-input__suffix-clear, .t-tag-input__suffix-clear')) return;
    this.focusInput();
  }

  protected removeTag(index: number, event?: MouseEvent): void {
    event?.stopPropagation();
    this.removeTagAt(index, undefined, event);
  }

  /** 外部可主动聚焦输入框。 */
  focusInput(): void {
    const input = this.multiple() ? this.multipleInputRef() : this.singleInputRef();
    input?.nativeElement.focus();
  }

  writeValue(value: SelectInputValue | null | undefined): void {
    this.innerValue.set(value ?? undefined);
  }

  registerOnChange(fn: (value: SelectInputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }

  private mergedKeys(): Required<SelectInputKeys> {
    return { ...DEFAULT_KEYS, ...(this.keys() ?? {}) };
  }

  /** 移除某个标签，并按上游上下文派发 `tagChange`。 */
  private removeTagAt(index: number, item?: SelectInputTagValue, event?: MouseEvent): void {
    if (this.formReadonly() || this.mergedDisabled()) return;
    const items = this.valueItems();
    if (index < 0 || index >= items.length) return;
    const removed = items[index];
    const next = items.filter((_, current) => current !== index);
    const label = readLabel(removed, this.mergedKeys());
    this.emitValue(next);
    this.tagChange.emit({
      value: this.tagsOf(next),
      trigger: 'tag-remove',
      index,
      item: item ?? label,
      e: event,
    });
  }

  private tagsOf(items: SelectInputValue[]): SelectInputTagValue[] {
    const keys = this.mergedKeys();
    return items
      .map((item) => readLabel(item, keys))
      .filter((item): item is SelectInputTagValue => item !== undefined);
  }

  private commitInputValue(text: string, context: SelectInputValueChangeContext): void {
    if (this.inputValue() === undefined) this.innerInputValue.set(text);
    this.inputChange.emit({ value: text, trigger: context.trigger, e: context.e });
  }

  private emitValue(value: SelectInputValue): void {
    if (this.formReadonly() || this.mergedDisabled()) return;
    this.innerValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  private hasValue(): boolean {
    const value = this.innerValue();
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }

  private isEmptyValue(): boolean {
    return !this.hasValue();
  }

  private sameValue(left: SelectInputValue | undefined, right: SelectInputValue | undefined): boolean {
    if (Array.isArray(left) && Array.isArray(right)) {
      return left.length === right.length && left.every((item, index) => item === right[index]);
    }
    return left === right;
  }

  private asTemplate(value: SelectInputContent | string | TemplateRef<unknown> | undefined): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }
}
