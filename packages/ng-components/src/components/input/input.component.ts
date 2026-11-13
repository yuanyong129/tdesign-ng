import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
import type { InputAlign, InputChangeEvent, InputSize, InputStatus, InputType, InputValue } from './input.types';

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
  standalone: true,
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
  /** @zh 输入框的值 @en Value of the input @defaultValue '' */
  readonly value = input<InputValue>('');

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

  /** @zh 最大字符数，按字符（而非字节）计算，超出时截断 @en Maximum characters, truncates when exceeded @defaultValue undefined */
  readonly maxcharacter = input<number | undefined>(undefined);

  /** @zh 原生 maxlength，超出时浏览器直接阻止输入 @en Native maxlength @defaultValue undefined */
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

  protected readonly innerId = `${PREFIX_CLS}-${++uid}`;

  private readonly innerInput = viewChild<ElementRef<HTMLInputElement>>('inner');

  /** 表单通过 `setDisabledState` 下发的禁用态，与模板上的 `disabled` 取并集。 */
  private readonly disabledByForms = signal(false);

  private readonly focused = signal(false);

  private readonly innerValue = signal<InputValue>('');

  private onChange: (value: InputValue) => void = () => {};

  private onTouched: () => void = () => {};

  constructor() {
    // 外部 `[value]` 变化时同步到内部状态；用户输入时不回写，避免打断正在输入的内容。
    effect(() => {
      const next = this.value();
      untracked(() => {
        if (next !== this.innerValue()) this.innerValue.set(next);
      });
    });
  }

  /** 当前值的字符串形式，`number` 也要能喂给 `<input>`。 */
  protected readonly text = computed(() => String(this.innerValue() ?? ''));

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  /** 原生 maxlength 只接受数字，上游允许传字符串。 */
  protected readonly maxlengthValue = computed(() => {
    const raw = this.maxlength();
    if (raw === undefined || raw === null || raw === '') return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  });

  /** 字符数按码点计算，避免 emoji 被拆成两个字符。 */
  protected readonly characterCount = computed(() => Array.from(this.text()).length);

  protected readonly showLimit = computed(
    () => this.showLimitNumber() && !!(this.maxcharacter() ?? this.maxlengthValue()),
  );

  protected readonly limitText = computed(() => {
    const max = this.maxcharacter() ?? this.maxlengthValue() ?? 0;
    return `${this.characterCount()}/${max}`;
  });

  protected readonly canClear = computed(() => {
    if (!this.clearable() || this.mergedDisabled() || this.readonly()) return false;
    return this.text() !== '' || this.showClearIconOnEmpty();
  });

  protected readonly classes = computed(() =>
    buildClasses({
      size: this.size(),
      status: this.status(),
      align: this.align(),
      borderless: this.borderless(),
      focused: this.focused(),
      disabled: this.mergedDisabled(),
      readonly: this.readonly(),
    }).join(' '),
  );

  protected readonly tipsClasses = computed(() => `${PREFIX_CLS}__tips ${PREFIX_CLS}__tips--${this.status()}`);

  writeValue(value: InputValue | null | undefined): void {
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
    const formatter = this.format();
    let next = formatter ? formatter(element.value) : element.value;

    const max = this.maxcharacter();
    if (max !== undefined && !this.allowInputOverMax() && Array.from(next).length > max) {
      next = Array.from(next).slice(0, max).join('');
      element.value = next;
    }

    this.commit(next, 'input', event);
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
    if (event.key === 'Enter') this.enter.emit(event);
    this.keydown.emit(event);
  }

  protected handleKeyup(event: KeyboardEvent): void {
    this.keyup.emit(event);
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.mergedDisabled() || this.readonly()) return;
    this.commit('', 'clear', event);
    this.clear.emit(event);
    this.focusInput();
  }

  private commit(value: InputValue, trigger: InputChangeEvent['trigger'], event?: Event): void {
    this.innerValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.change.emit({ value, trigger, event });
  }
}
