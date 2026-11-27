import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
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
import { createControllableState } from '../../_utils/controllable-state';
import { limitInputText } from '../input/input-options';
import type {
  TextareaAutosize,
  TextareaChangeEvent,
  TextareaStatus,
  TextareaValue,
  TextareaValidateEvent,
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
  /** @zh 受控输入值，未设置时使用非受控状态 @en Controlled textarea value, omitted for uncontrolled usage @defaultValue undefined */
  readonly value = input<TextareaValue | undefined>(undefined);

  /** @zh 非受控初始值，仅初始化时读取 @en Initial uncontrolled value, read once @defaultValue '' */
  readonly defaultValue = input<TextareaValue>('');

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

  /** @zh 最大字符数，ASCII 计 1，非 ASCII 每个 UTF-16 单元计 2，超出时截断 @en Maximum weighted length: ASCII counts as 1, non-ASCII UTF-16 units as 2 @defaultValue undefined */
  readonly maxcharacter = input<number | undefined>(undefined);

  /** @zh 最大 Unicode 码点数，组件主动限制以保留完整 emoji 与组合输入 @en Maximum Unicode code points, preserving emoji and composition @defaultValue undefined */
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

  /** @zh 字符按键事件（原生 keypress），不以 keydown 代替 @en Native keypress event */
  readonly keypress = output<KeyboardEvent>();

  /** @zh 超过长度限制或恢复正常时触发 @en Emitted when the length limit is exceeded or the value becomes valid again */
  readonly validate = output<TextareaValidateEvent>();

  protected readonly innerId = `${PREFIX_CLS}-${++uid}`;

  private readonly innerTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('inner');

  private readonly disabledByForms = signal(false);

  private readonly state = createControllableState(this.value, () => this.defaultValue());
  private readonly editRevision = signal(0);
  private readonly draft = signal<string | null>(null);

  private onChange: (value: TextareaValue) => void = () => {};

  private onTouched: () => void = () => {};

  private composing = false;
  private compositionInput: string | undefined;

  constructor() {
    afterRenderEffect(() => {
      this.editRevision();
      const text = this.displayText();
      const element = this.innerTextarea()?.nativeElement;
      if (element && element.value !== text) element.value = text;
      this.autosize();
      this.resize();
    });

    afterNextRender(() => this.resize());

    let previousError: TextareaValidateEvent['error'];
    effect(() => {
      const error = this.lengthError();
      if (error !== previousError) {
        previousError = error;
        untracked(() => this.validate.emit({ error }));
      }
    });
  }

  protected readonly text = computed(() => String(this.state.current() ?? ''));
  protected readonly displayText = computed(() => this.draft() ?? this.text());

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  protected readonly maxlengthValue = computed(() => {
    const raw = this.maxlength();
    if (raw === undefined || raw === null || raw === '') return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
  });

  protected readonly characterCount = computed(() => this.weightedLength(this.text()));

  private readonly lengthError = computed<TextareaValidateEvent['error']>(() => {
    const max = this.maxlengthValue();
    const weightedMax = this.maxcharacter();
    const exceeded = max !== null && max > 0
      ? Array.from(this.text()).length > max
      : max === 0 ? this.text().length > 0 : weightedMax !== undefined && weightedMax >= 0 && this.characterCount() > weightedMax;
    return exceeded ? 'exceed-maximum' : undefined;
  });

  protected readonly showLimit = computed(
    () => this.maxlengthValue() !== null || this.maxcharacter() !== undefined,
  );

  protected readonly limitText = computed(() => {
    const max = this.maxlengthValue() ?? this.maxcharacter() ?? 0;
    const count = this.maxlengthValue() === null ? this.characterCount() : Array.from(this.text()).length;
    return `${count}/${max}`;
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
    this.composing = false;
    this.compositionInput = undefined;
    this.draft.set(null);
    this.state.write(value ?? '');
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
    if (this.mergedDisabled() || this.readonly()) { element.value = this.text(); return; }
    if (this.composing || (event as InputEvent).isComposing) { this.draft.set(element.value); return; }
    if (this.compositionInput !== undefined) {
      const duplicate = element.value === this.compositionInput || element.value === this.text();
      this.compositionInput = undefined;
      if (duplicate) return;
    }
    let next = element.value;
    // 部分浏览器在 compositionend 后再派发同值 input，避免重复提交一次编辑。
    if (next === this.text()) return;

    const max = this.maxlengthValue();
    next = limitInputText(next, { maxlength: max ?? undefined, maxcharacter: max === null ? this.maxcharacter() : undefined, allowInputOverMax: this.allowInputOverMax() });
    element.value = next;

    this.state.set(next);
    this.onChange(next);
    this.valueChange.emit(next);
    this.change.emit({ value: next, event });
    this.editRevision.update((revision) => revision + 1);
    this.resize();
  }

  protected handleCompositionStart(): void {
    if (this.mergedDisabled() || this.readonly()) return;
    this.composing = true;
    this.compositionInput = undefined;
  }

  protected handleCompositionEnd(event: CompositionEvent): void {
    if (!this.composing) return;
    this.composing = false;
    this.draft.set(null);
    this.handleInput(event);
    this.compositionInput = (event.target as HTMLTextAreaElement).value;
  }

  protected handleKeypress(event: KeyboardEvent): void {
    event.stopPropagation();
    if (!this.mergedDisabled()) this.keypress.emit(event);
  }

  private weightedLength(value: string): number {
    let length = 0;
    for (let index = 0; index < value.length; index++) length += value.charCodeAt(index) > 127 ? 2 : 1;
    return length;
  }

  protected handleFocus(event: FocusEvent): void {
    this.focus.emit(event);
  }

  protected handleBlur(event: FocusEvent): void {
    this.composing = false;
    this.compositionInput = undefined;
    this.draft.set(null);
    this.onTouched();
    this.blur.emit(event);
  }

  protected handleKey(event: KeyboardEvent, type: 'keydown' | 'keyup'): void {
    event.stopPropagation();
    if (!this.mergedDisabled()) this[type].emit(event);
  }

  /** 按内容撑高：先归零再读 `scrollHeight`，再按 minRows/maxRows 夹逼。 */
  private resize(): void {
    const element = this.innerTextarea()?.nativeElement;
    const autosize = this.autosize();
    if (!element || !autosize) {
      if (element) element.style.height = '';
      return;
    }
    if (typeof getComputedStyle === 'undefined') return;

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
