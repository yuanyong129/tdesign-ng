import { InitialRender } from '../../_utils/initial-render';
import { useFormReadonly } from '../../_utils/form-readonly';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
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
import type { InputAlign, InputChangeEvent, InputSize, InputStatus, InputType, InputValue, InputCompositionEvent, InputPasteEvent, InputValidateEvent } from './input.types';
import { limitInputText } from './input-options';

const PREFIX_CLS = 't-input';

/** 生成稳定的 id，供 `<label for>` 关联原生输入框。 */
let uid = 0;

/**
 * 把上游的 size / status / align 等维度翻译成 TDesign 的类名。
 * `medium` 与 `left` 是默认值，不产生类名；聚焦同时输出 `--focused` 与 `t-is-focused`
 * （前者控制边框，后者控制前置图标颜色，上游就是分开的两套选择器）。
 */
function buildClasses(options: {
  size: InputSize;
  status: InputStatus;
  align: InputAlign;
  borderless: boolean;
  focused: boolean;
  disabled: boolean;
  readonly: boolean;
}): string[] {
  const classes = [PREFIX_CLS, `${PREFIX_CLS}--prefix`, `${PREFIX_CLS}--suffix`];

  if (options.size === 'small') classes.push('t-size-s');
  else if (options.size === 'large') classes.push('t-size-l');
  if (options.status !== 'default') classes.push(`t-is-${options.status}`);
  if (options.align === 'center') classes.push('t-align-center');
  else if (options.align === 'right') classes.push('t-align-right');
  if (options.borderless) classes.push(`${PREFIX_CLS}--borderless`);
  if (options.focused) classes.push(`${PREFIX_CLS}--focused`, 't-is-focused');
  if (options.disabled) classes.push('t-is-disabled');
  if (options.readonly) classes.push('t-is-readonly');

  return classes;
}

/**
 * 输入框。
 *
 * ```html
 * <t-input placeholder="请输入" [(value)]="value" [clearable]="true" />
 * <t-input status="error" tips="校验失败" />
 * <t-input>
 *   <t-icon tInputPrefixIcon name="search" />
 * </t-input>
 * ```
 *
 * 支持 `ngModel` / `formControlName`（实现了 `ControlValueAccessor`）。
 */
@Component({
  selector: 't-input',
  hostDirectives: [InitialRender],
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TInput),
      multi: true,
    },
  ],
})
export class TInput implements ControlValueAccessor {
  /** @zh 受控输入值，未设置时使用非受控状态 @en Controlled value, omitted for uncontrolled usage @defaultValue undefined */
  readonly value = input<InputValue | undefined>(undefined);

  /** @zh 非受控初始值，仅初始化时读取 @en Initial uncontrolled value, read only on initialization @defaultValue '' */
  readonly defaultValue = input<InputValue>('');

  /** @zh 根据内容自动调整宽度 @en Adjust width to the content @defaultValue false */
  readonly autoWidth = input(false, { transform: booleanAttribute });

  /** @zh 内层输入框容器的类名 @en Classes on the inner input container @defaultValue undefined */
  readonly inputClass = input<string | string[] | Record<string, boolean> | undefined>(undefined);

  /** @zh 输入框尺寸 @en Size of the input @defaultValue 'medium' @values small medium large */
  readonly size = input<InputSize>('medium');

  /** @zh 输入框状态 @en Status of the input @defaultValue 'default' @values default success warning error */
  readonly status = input<InputStatus>('default');

  /** @zh 文本对齐方式 @en Text alignment @defaultValue 'left' @values left center right */
  readonly align = input<InputAlign>('left');

  /** @zh 输入框类型 @en Type of the input @defaultValue 'text' @values text number url tel password search submit hidden */
  readonly type = input<InputType>('text');

  /** @zh 占位文字 @en Placeholder text @defaultValue undefined */
  readonly placeholder = input<string | undefined>(undefined);

  /** @zh 是否禁用 @en Whether the input is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否只读 @en Whether the input is readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });
  protected readonly formReadonly = useFormReadonly(this.readonly);

  /** @zh 是否可清空 @en Whether the input is clearable @defaultValue false */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** @zh 值为空时是否也显示清空图标 @en Whether to show the clear icon when empty @defaultValue false */
  readonly showClearIconOnEmpty = input(false, { transform: booleanAttribute });

  /** @zh 是否无边框 @en Whether the input is borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** @zh 自动聚焦 @en Whether to focus automatically @defaultValue false */
  readonly autofocus = input(false, { transform: booleanAttribute });

  /** @zh 原生的 spellcheck 属性 @en Native spellcheck attribute @defaultValue true */
  readonly spellCheck = input(true, { transform: booleanAttribute });

  /** @zh 原生的 autocomplete 属性 @en Native autocomplete attribute @defaultValue undefined */
  readonly autocomplete = input<string | undefined>(undefined);

  /** @zh 原生的 name 属性 @en Native name attribute @defaultValue undefined */
  readonly name = input<string | undefined>(undefined);

  /** @zh 最大加权长度，ASCII 计 1，非 ASCII 每个 UTF-16 单元计 2 @en Maximum weighted length: ASCII counts as 1, non-ASCII UTF-16 units as 2 @defaultValue undefined */
  readonly maxcharacter = input<number | undefined>(undefined);

  /** @zh 最大 Unicode 码点数，由组件限制以保留完整 emoji 和组合输入 @en Maximum Unicode code points, preserving emoji and composition @defaultValue undefined */
  readonly maxlength = input<string | number | undefined>(undefined);

  /** @zh 是否允许输入超过最大字符数 @en Whether input over the maximum is allowed @defaultValue false */
  readonly allowInputOverMax = input(false, { transform: booleanAttribute });

  /** @zh 是否显示字数统计 @en Whether to show the character counter @defaultValue false */
  readonly showLimitNumber = input(false, { transform: booleanAttribute });

  /** @zh 格式化函数，在写入值之前调用 @en Formatter applied before the value is written @defaultValue undefined */
  readonly format = input<((value: string) => string) | undefined>(undefined);

  /** @zh 输入框下方的提示文字 @en Tips below the input @defaultValue undefined */
  readonly tips = input<string | undefined>(undefined);

  /** @zh 输入框左侧的标签文字 @en Label on the left of the input @defaultValue undefined */
  readonly label = input<string | undefined>(undefined);

  /** @zh 值变化事件，用于双向绑定 @en Value change event, used for two-way binding */
  readonly valueChange = output<InputValue>();

  /** @zh 值变化事件，携带触发来源 @en Change event with the trigger source */
  readonly change = output<InputChangeEvent>();

  /** @zh 获得焦点 @en Focus event */
  readonly focus = output<FocusEvent>();

  /** @zh 失去焦点 @en Blur event */
  readonly blur = output<FocusEvent>();

  /** @zh 按下回车 @en Enter key event */
  readonly enter = output<KeyboardEvent>();

  /** @zh 键盘按下 @en Keydown event */
  readonly keydown = output<KeyboardEvent>();

  /** @zh 键盘抬起 @en Keyup event */
  readonly keyup = output<KeyboardEvent>();

  /** @zh 点击清空图标 @en Clear icon click event */
  readonly clear = output<MouseEvent>();

  /** @zh 原生字符按键事件 @en Native keypress event */
  readonly keypress = output<KeyboardEvent>();
  /** @zh 组合输入开始 @en Composition started */
  readonly compositionstart = output<InputCompositionEvent>();
  /** @zh 组合输入结束 @en Composition ended */
  readonly compositionend = output<InputCompositionEvent>();
  /** @zh 粘贴事件与纯文本内容 @en Paste event and plain text */
  readonly paste = output<InputPasteEvent>();
  /** @zh 滚轮事件 @en Wheel event */
  readonly wheel = output<{ e: WheelEvent }>();
  /** @zh 超过长度限制或恢复正常时触发 @en Length limit exceeded or recovered */
  readonly validate = output<InputValidateEvent>();

  protected readonly innerId = `${PREFIX_CLS}-${++uid}`;

  private readonly innerInput = viewChild<ElementRef<HTMLInputElement>>('inner');
  private readonly inputPre = viewChild<ElementRef<HTMLElement>>('inputPre');
  protected readonly inputWidth = signal<number | null>(null);
  private readonly compositionDraft = signal<string | null>(null);
  private readonly formsBound = signal(false);
  private readonly editRevision = signal(0);
  private initialized = false;
  private composing = false;
  private compositionInput: string | undefined;

  /** 表单通过 `setDisabledState` 下发的禁用态，与模板上的 `disabled` 取并集。 */
  private readonly disabledByForms = signal(false);

  private readonly focused = signal(false);

  private readonly innerValue = signal<InputValue>('');

  private onChange: (value: InputValue) => void = () => {};

  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      if (this.formReadonly() || this.mergedDisabled()) untracked(() => {
        this.composing = false; this.compositionInput = undefined; this.compositionDraft.set(null);
      });
    });
    // defaultValue 仅在第一次渲染读取；CVA 写值优先于默认值。
    effect(() => {
      untracked(() => {
        if (!this.initialized && !this.formsBound()) this.innerValue.set(this.defaultValue());
        this.initialized = true;
      });
    });
    afterRenderEffect((cleanup) => {
      this.editRevision();
      const text = this.displayText();
      const element = this.innerInput()?.nativeElement;
      if (element && element.value !== text) element.value = text;
      this.autoWidth(); this.placeholder(); this.size(); this.inputClass();
      const pre = this.inputPre()?.nativeElement;
      this.inputWidth.set(this.autoWidth() && pre ? Math.ceil(pre.getBoundingClientRect().width) + 2 : null);
      if (this.autoWidth() && pre && typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => this.inputWidth.set(Math.ceil(pre.getBoundingClientRect().width) + 2));
        observer.observe(pre);
        cleanup(() => observer.disconnect());
      }
    });
    afterNextRender(() => { if (this.autofocus() && !this.mergedDisabled()) this.focusInput(); });
    let previousError: InputValidateEvent['error'];
    effect(() => {
      const error = this.lengthError();
      if (error !== previousError) {
        previousError = error;
        untracked(() => this.validate.emit({ error }));
      }
    });
  }

  /** 当前值的字符串形式，`number` 也要能喂给 `<input>`。 */
  protected readonly text = computed(() => String((this.formsBound() ? this.innerValue() : this.value() ?? this.innerValue()) ?? ''));
  protected readonly displayText = computed(() => this.compositionDraft() ?? this.text());

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  /** 原生 maxlength 只接受数字，上游允许传字符串。 */
  protected readonly maxlengthValue = computed(() => {
    const raw = this.maxlength();
    if (raw === undefined || raw === null || raw === '') return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
  });

  /** 字符数按码点计算，避免 emoji 被拆成两个字符。 */
  protected readonly characterCount = computed(() => {
    if (this.maxlengthValue() !== null) return Array.from(this.text()).length;
    let count = 0;
    for (let i = 0; i < this.text().length; i++) count += this.text().charCodeAt(i) > 127 ? 2 : 1;
    return count;
  });
  private readonly lengthError = computed<InputValidateEvent['error']>(() => {
    const max = this.maxlengthValue() ?? this.maxcharacter();
    return max !== undefined && max !== null && max >= 0 && this.characterCount() > max ? 'exceed-maximum' : undefined;
  });
  protected readonly resolvedStatus = computed(() => this.status() !== 'default' ? this.status() : this.lengthError() ? 'error' : 'default');

  protected readonly showLimit = computed(
    () => this.showLimitNumber() && (this.maxlengthValue() !== null || this.maxcharacter() !== undefined),
  );

  protected readonly limitText = computed(() => {
    const max = this.maxlengthValue() ?? this.maxcharacter() ?? 0;
    return `${this.characterCount()}/${max}`;
  });

  protected readonly canClear = computed(() => {
    if (!this.clearable() || this.mergedDisabled() || this.formReadonly()) return false;
    return this.text() !== '' || this.showClearIconOnEmpty();
  });

  protected readonly classes = computed(() =>
    buildClasses({
      size: this.size(),
      status: this.resolvedStatus(),
      align: this.align(),
      borderless: this.borderless(),
      focused: this.focused(),
      disabled: this.mergedDisabled(),
      readonly: this.formReadonly(),
    }).join(' '),
  );

  protected readonly tipsClasses = computed(() => `${PREFIX_CLS}__tips ${PREFIX_CLS}__tips--${this.resolvedStatus()}`);

  writeValue(value: InputValue | null | undefined): void {
    this.formsBound.set(true);
    this.composing = false;
    this.compositionDraft.set(null);
    this.innerValue.set(value ?? '');
  }

  registerOnChange(fn: (value: InputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }

  /** 供外部（如表单重置）主动聚焦。 */
  focusInput(): void {
    this.innerInput()?.nativeElement.focus();
  }

  protected handleInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (this.mergedDisabled() || this.formReadonly()) { element.value = this.text(); return; }
    if (this.composing || (event as InputEvent).isComposing) {
      this.compositionDraft.set(element.value);
      return;
    }
    if (this.compositionInput !== undefined) {
      const duplicate = element.value === this.compositionInput || element.value === this.text();
      this.compositionInput = undefined;
      if (duplicate) return;
    }
    const formatter = this.format();
    let next = formatter ? formatter(element.value) : element.value;
    const max = this.maxlengthValue();
    next = limitInputText(next, { maxlength: max ?? undefined, maxcharacter: max === null ? this.maxcharacter() : undefined, allowInputOverMax: this.allowInputOverMax() });
    element.value = next;
    this.commit(next, 'input', event);
  }

  protected handleCompositionStart(event: CompositionEvent): void {
    event.stopPropagation();
    if (this.mergedDisabled() || this.formReadonly()) return;
    this.composing = true;
    this.compositionInput = undefined;
    this.compositionDraft.set((event.target as HTMLInputElement).value);
    this.compositionstart.emit({ value: (event.target as HTMLInputElement).value, e: event });
  }

  protected handleCompositionEnd(event: CompositionEvent): void {
    event.stopPropagation();
    if (!this.composing) return;
    this.composing = false;
    this.compositionDraft.set(null);
    this.handleInput(event);
    this.compositionInput = (event.target as HTMLInputElement).value;
    this.compositionend.emit({ value: this.compositionInput, e: event });
  }

  protected handleKeypress(event: KeyboardEvent): void {
    event.stopPropagation();
    if (!this.mergedDisabled()) this.keypress.emit(event);
  }

  protected handlePaste(event: ClipboardEvent): void {
    event.stopPropagation();
    if (!this.mergedDisabled()) this.paste.emit({ e: event, pasteValue: event.clipboardData?.getData('text/plain') ?? '' });
  }

  protected handleWheel(event: WheelEvent): void {
    event.stopPropagation();
    this.wheel.emit({ e: event });
  }

  protected handleFocus(event: FocusEvent): void {
    this.focused.set(true);
    this.focus.emit(event);
  }

  protected handleBlur(event: FocusEvent): void {
    this.composing = false;
    this.compositionDraft.set(null);
    this.compositionInput = undefined;
    this.editRevision.update((revision) => revision + 1);
    this.focused.set(false);
    this.onTouched();
    this.blur.emit(event);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (this.mergedDisabled()) return;
    if (event.key === 'Enter' && !this.composing && !event.isComposing && event.keyCode !== 229) this.enter.emit(event);
    this.keydown.emit(event);
  }

  protected handleKeyup(event: KeyboardEvent): void {
    event.stopPropagation();
    if (!this.mergedDisabled()) this.keyup.emit(event);
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.mergedDisabled() || this.formReadonly()) return;
    this.composing = false;
    this.compositionDraft.set(null);
    this.compositionInput = undefined;
    this.commit('', 'clear', event);
    this.clear.emit(event);
    this.focusInput();
  }

  private commit(value: InputValue, trigger: InputChangeEvent['trigger'], event?: Event): void {
    if (this.formsBound() || this.value() === undefined) this.innerValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.change.emit({ value, trigger, event });
    this.editRevision.update((revision) => revision + 1);
  }
}
