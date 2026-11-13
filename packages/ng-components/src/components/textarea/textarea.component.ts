import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
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
import type {
  TextareaAutosize,
  TextareaChangeEvent,
  TextareaStatus,
  TextareaValue,
} from './textarea.types';

const PREFIX_CLS = 't-textarea';

let uid = 0;

/**
 * `autosize` 既可以写 `<t-textarea autosize>`（等价 `true`），也可以传 `{ minRows, maxRows }`。
 * `booleanAttribute` 会把对象压成 `true`，所以这里单独写一个转换函数。
 */
function toAutosize(value: boolean | TextareaAutosize | string): boolean | TextareaAutosize {
  if (typeof value === 'object' && value !== null) return value;
  if (value === '' || value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return Boolean(value);
}

/**
 * 多行文本输入框。
 *
 * ```html
 * <t-textarea placeholder="请输入" [(value)]="value" />
 * <t-textarea [autosize]="{ minRows: 3, maxRows: 6 }" [(value)]="value" />
 * <t-textarea status="error" tips="内容不能为空" [maxcharacter]="20" />
 * ```
 *
 * 支持 `ngModel` / `formControlName`（实现了 `ControlValueAccessor`）。
 */
@Component({
  selector: 't-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './textarea.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TTextarea),
      multi: true,
    },
  ],
})
export class TTextarea implements ControlValueAccessor {
  /** @zh 输入框的值 @en Value of the textarea @defaultValue '' */
  readonly value = input<TextareaValue>('');

  /** @zh 占位文字 @en Placeholder text @defaultValue undefined */
  readonly placeholder = input<string | undefined>(undefined);

  /** @zh 输入框状态 @en Status of the textarea @defaultValue 'default' @values default success warning error */
  readonly status = input<TextareaStatus>('default');

  /** @zh 是否禁用 @en Whether the textarea is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否只读 @en Whether the textarea is readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @zh 自动聚焦 @en Whether to focus automatically @defaultValue false */
  readonly autofocus = input(false, { transform: booleanAttribute });

  /** @zh 是否根据内容自动撑高，可传 `{ minRows, maxRows }` @en Whether to grow with the content @defaultValue false */
  readonly autosize = input<boolean | TextareaAutosize, boolean | TextareaAutosize | ''>(false, {
    transform: toAutosize,
  });

  /** @zh 最大字符数，按字符（而非字节）计算，超出时截断 @en Maximum characters, truncates when exceeded @defaultValue undefined */
  readonly maxcharacter = input<number | undefined>(undefined);

  /** @zh 原生 maxlength，超出时浏览器直接阻止输入 @en Native maxlength @defaultValue undefined */
  readonly maxlength = input<string | number | undefined>(undefined);

  /** @zh 是否允许输入超过最大字符数 @en Whether input over the maximum is allowed @defaultValue false */
  readonly allowInputOverMax = input(false, { transform: booleanAttribute });

  /** @zh 原生的 name 属性 @en Native name attribute @defaultValue undefined */
  readonly name = input<string | undefined>(undefined);

  /** @zh 输入框下方的提示文字 @en Tips below the textarea @defaultValue undefined */
  readonly tips = input<string | undefined>(undefined);

  /** @zh 值变化事件，用于双向绑定 @en Value change event, used for two-way binding */
  readonly valueChange = output<TextareaValue>();

  /** @zh 值变化事件，携带原始事件 @en Change event with the raw event */
  readonly change = output<TextareaChangeEvent>();

  /** @zh 获得焦点 @en Focus event */
  readonly focus = output<FocusEvent>();

  /** @zh 失去焦点 @en Blur event */
  readonly blur = output<FocusEvent>();

  /** @zh 键盘按下 @en Keydown event */
  readonly keydown = output<KeyboardEvent>();

  /** @zh 键盘抬起 @en Keyup event */
  readonly keyup = output<KeyboardEvent>();

  protected readonly innerId = `${PREFIX_CLS}-${++uid}`;

  private readonly innerTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('inner');

  private readonly disabledByForms = signal(false);

  private readonly innerValue = signal<TextareaValue>('');

  private onChange: (value: TextareaValue) => void = () => {};

  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const next = this.value();
      untracked(() => {
        if (next !== this.innerValue()) {
          this.innerValue.set(next);
          queueMicrotask(() => this.resize());
        }
      });
    });

    afterNextRender(() => this.resize());
  }

  protected readonly text = computed(() => String(this.innerValue() ?? ''));

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  protected readonly maxlengthValue = computed(() => {
    const raw = this.maxlength();
    if (raw === undefined || raw === null || raw === '') return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  });

  protected readonly characterCount = computed(() => Array.from(this.text()).length);

  protected readonly showLimit = computed(
    () => !!(this.maxcharacter() ?? this.maxlengthValue()),
  );

  protected readonly limitText = computed(() => {
    const max = this.maxcharacter() ?? this.maxlengthValue() ?? 0;
    return `${this.characterCount()}/${max}`;
  });

  /** `autosize` 打开后交给脚本算高度，原生 resize 手柄要关掉。 */
  protected readonly innerClasses = computed(() => {
    const classes = [`${PREFIX_CLS}__inner`];
    if (this.status() !== 'default') classes.push(`t-is-${this.status()}`);
    if (this.mergedDisabled()) classes.push('t-is-disabled');
    if (this.autosize()) classes.push('t-resize-none');
    return classes.join(' ');
  });

  /** 只有字数统计、没有提示文字时，统计靠右。 */
  protected readonly infoWrapperClasses = computed(() => {
    const classes = [`${PREFIX_CLS}__info_wrapper`];
    if (!this.tips() && this.showLimit()) classes.push(`${PREFIX_CLS}__info_wrapper_align`);
    return classes.join(' ');
  });

  protected readonly tipsClasses = computed(() => `${PREFIX_CLS}__tips ${PREFIX_CLS}__tips--${this.status()}`);

  writeValue(value: TextareaValue | null | undefined): void {
    this.innerValue.set(value ?? '');
    queueMicrotask(() => this.resize());
  }

  registerOnChange(fn: (value: TextareaValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }

  /** 供外部（如表单重置）主动聚焦。 */
  focusTextarea(): void {
    this.innerTextarea()?.nativeElement.focus();
  }

  protected handleInput(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    let next = element.value;

    const max = this.maxcharacter();
    if (max !== undefined && !this.allowInputOverMax() && Array.from(next).length > max) {
      next = Array.from(next).slice(0, max).join('');
      element.value = next;
    }

    this.innerValue.set(next);
    this.onChange(next);
    this.valueChange.emit(next);
    this.change.emit({ value: next, event });
    this.resize();
  }

  protected handleFocus(event: FocusEvent): void {
    this.focus.emit(event);
  }

  protected handleBlur(event: FocusEvent): void {
    this.onTouched();
    this.blur.emit(event);
  }

  /** 按内容撑高：先归零再读 `scrollHeight`，再按 minRows/maxRows 夹逼。 */
  private resize(): void {
    const element = this.innerTextarea()?.nativeElement;
    const autosize = this.autosize();
    if (!element || !autosize) {
      if (element) element.style.height = '';
      return;
    }

    element.style.height = 'auto';

    const style = getComputedStyle(element);
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5 || 24;
    const vertical = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
    const border = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);

    const options: TextareaAutosize = typeof autosize === 'object' ? autosize : {};
    const minHeight = options.minRows ? options.minRows * lineHeight + vertical + border : 0;
    const maxHeight = options.maxRows ? options.maxRows * lineHeight + vertical + border : Number.POSITIVE_INFINITY;

    const contentHeight = element.scrollHeight;
    const height = Math.min(Math.max(contentHeight, minHeight), maxHeight);

    element.style.height = `${height}px`;
    element.style.overflowY = element.scrollHeight > height ? 'auto' : 'hidden';
  }
}
