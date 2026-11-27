import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputOptionsDirective, limitInputText } from '../input/input-options';
import type { InputOptions } from '../input/input-options';
import type {
  InputNumberAlign,
  InputNumberChangeEvent,
  InputNumberChangeSource,
  InputNumberDecimalPlaces,
  InputNumberFocusEvent,
  InputNumberFormat,
  InputNumberKeyboardEvent,
  InputNumberSize,
  InputNumberStatus,
  InputNumberTheme,
  InputNumberValidateEvent,
  InputNumberValue,
} from './input-number.types';
import {
  canAddNumber,
  canInputNumber,
  canReduceNumber,
  canSetValue,
  formatThousandths,
  formatUnCompleteNumber,
  getMaxOrMinValidateResult,
  getStepValue,
} from './input-number-utils';

const PREFIX_CLS = 't-input-number';

/**
 * 数字输入框。通过步进按钮和键盘上下键调整数值，支持范围限制、小数位与格式化展示。
 */
@Component({
  selector: 't-input-number',
  standalone: true,
  imports: [NgTemplateOutlet, InputOptionsDirective],
  templateUrl: './input-number.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TInputNumber),
      multi: true,
    },
  ],
  host: {
    class: 't-input-number',
    '[class.t-size-s]': "size() === 'small'",
    '[class.t-size-l]': "size() === 'large'",
    '[class.t-input-number--row]': "theme() === 'row'",
    '[class.t-input-number--column]': "theme() === 'column'",
    '[class.t-input-number--normal]': "theme() === 'normal'",
    '[class.t-input-number--auto-width]': 'autoWidth()',
    '[class.t-is-controls-right]': "theme() === 'column'",
    '[class.t-is-disabled]': 'mergedDisabled()',
  },
})
export class TInputNumber implements ControlValueAccessor {
  /** 输入框内容对齐方式，默认跟随主题（row 主题居中）。 @zh 对齐方式 @en align @values left,center,right */
  readonly align = input<InputNumberAlign | undefined>(undefined);

  /** 是否允许输入超过最大值或低于最小值的数字。 @zh 允许超限输入 @en allowInputOverLimit @defaultValue true */
  readonly allowInputOverLimit = input(true, { transform: booleanAttribute });

  /** 是否根据内容自适应宽度。 @zh 自适应宽度 @en autoWidth @defaultValue false */
  readonly autoWidth = input(false, { transform: booleanAttribute });

  /** 是否自动聚焦。 @zh 自动聚焦 @en autofocus @defaultValue false */
  readonly autofocus = input(false, { transform: booleanAttribute });

  /** @zh 原生编辑区配置，支持 InputOptions 白名单，值与数值格式化由本组件管理 @en Supported native editor options; value and numeric formatting remain controlled by InputNumber @defaultValue undefined */
  readonly inputProps = input<InputOptions | undefined>(undefined);

  protected readonly mergedReadonly = computed(() => this.readonly() || !!this.inputProps()?.readonly);
  protected readonly mergedAutofocus = computed(() => this.autofocus() || !!this.inputProps()?.autofocus);

  /** 保留小数位数，数字表示位数，对象形式可指定是否四舍五入。 @zh 小数位数 @en decimalPlaces */
  readonly decimalPlaces = input<InputNumberDecimalPlaces | undefined>(undefined);

  /** 是否禁用。 @zh 禁用 @en disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 展示值格式化函数。 @zh 格式化函数 @en format */
  readonly format = input<InputNumberFormat | undefined>(undefined);

  /** 输入框前缀文本或模板。 @zh 前缀内容 @en label */
  readonly label = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 是否开启大数模式，开启后值与步进以字符串精确运算。 @zh 大数模式 @en largeNumber @defaultValue false */
  readonly largeNumber = input(false, { transform: booleanAttribute });

  /** 最大值。 @zh 最大值 @en max @defaultValue Infinity */
  readonly max = input<InputNumberValue>(Infinity);

  /** 最小值。 @zh 最小值 @en min @defaultValue -Infinity */
  readonly min = input<InputNumberValue>(-Infinity);

  /** 占位提示文本。 @zh 占位文本 @en placeholder */
  readonly placeholder = input<string | undefined>(undefined);

  /** 是否只读。 @zh 只读 @en readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** 输入框尺寸。 @zh 尺寸 @en size @defaultValue medium @values small,medium,large */
  readonly size = input<InputNumberSize>('medium');

  /** 输入框状态。 @zh 状态 @en status @defaultValue default @values default,success,warning,error */
  readonly status = input<InputNumberStatus>('default');

  /** 每次调整的步长。 @zh 步长 @en step @defaultValue 1 */
  readonly step = input<InputNumberValue>(1);

  /** 输入框后置文本或模板。 @zh 后缀内容 @en suffix */
  readonly suffix = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 按钮布局主题。 @zh 主题 @en theme @defaultValue row @values column,row,normal */
  readonly theme = input<InputNumberTheme>('row');

  /** 输入框下方提示文本或模板。 @zh 提示内容 @en tips */
  readonly tips = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 当前值，支持双向绑定。 @zh 值 @en value */
  readonly value = input<InputNumberValue | undefined>(undefined);

  /** 非受控模式下的初始值。 @zh 默认值 @en defaultValue */
  readonly defaultValue = input<InputNumberValue | undefined>(undefined);

  /** 值变化时触发，配合 `[(value)]` 双向绑定。 @zh 值变化 @en valueChange */
  readonly valueChange = output<InputNumberValue | undefined>();

  /** 值变化时触发，携带触发来源与原始事件。 @zh 值变化 @en change */
  readonly change = output<InputNumberChangeEvent>();

  /** 失焦时触发。 @zh 失焦 @en blur */
  readonly blur = output<InputNumberFocusEvent>();

  /** 回车时触发。 @zh 回车 @en enter */
  readonly enter = output<InputNumberKeyboardEvent>();

  /** 聚焦时触发。 @zh 聚焦 @en focus */
  readonly focus = output<InputNumberFocusEvent>();

  /** 按键按下时触发。 @zh 按键按下 @en keydown */
  readonly keydown = output<InputNumberKeyboardEvent>();

  /** 按键输入时触发。 @zh 按键输入 @en keypress */
  readonly keypress = output<InputNumberKeyboardEvent>();

  /** 按键抬起时触发。 @zh 按键抬起 @en keyup */
  readonly keyup = output<InputNumberKeyboardEvent>();

  /** 数值校验时触发，超出范围会返回 error。 @zh 数值校验 @en validate */
  readonly validate = output<InputNumberValidateEvent>();

  /** 输入框内实际展示的文本。 */
  protected readonly userInput = signal('');

  /** 是否处于聚焦态（用于拼装 t-is-focused）。 */
  protected readonly focused = signal(false);

  private readonly innerValue = signal<InputNumberValue | null | undefined>(undefined);
  private readonly editRevision = signal(0);

  private readonly disabledByForms = signal(false);

  private onChange: (value: InputNumberValue | undefined) => void = () => {};

  private onTouched: () => void = () => {};

  /** 受控值优先，其次内部值，最后回落到 defaultValue。 */
  protected readonly current = computed<InputNumberValue | undefined>(() => {
    const outer = this.value();
    if (outer !== undefined) return outer;
    const inner = this.innerValue();
    if (inner !== undefined) return inner === null ? undefined : inner;
    const initial = this.defaultValue();
    return initial === '' ? undefined : initial;
  });

  /** 是否被禁用的合并结果。 */
  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms() || !!this.inputProps()?.disabled);

  /** 当前值是否越界（用于状态与校验事件）。 */
  protected readonly error = computed(() => this.errorOf(this.current()));

  /** 实际生效的状态，越界时强制为 error。 */
  protected readonly resolvedStatus = computed<InputNumberStatus>(() =>
    this.error() === undefined ? this.status() : 'error',
  );

  /** 减少按钮可用状态。 */
  protected readonly canReduce = computed(
    () => !this.mergedDisabled() && !this.mergedReadonly() && canReduceNumber(this.current(), this.min(), this.largeNumber()),
  );

  /** 增加按钮可用状态。 */
  protected readonly canAdd = computed(
    () => !this.mergedDisabled() && !this.mergedReadonly() && canAddNumber(this.current(), this.max(), this.largeNumber()),
  );

  /** 减少按钮类名。 */
  protected readonly decreaseClasses = computed(
    () => `${PREFIX_CLS}__decrease${this.canReduce() ? '' : ' t-is-disabled'}`,
  );

  /** 增加按钮类名。 */
  protected readonly increaseClasses = computed(
    () => `${PREFIX_CLS}__increase${this.canAdd() ? '' : ' t-is-disabled'}`,
  );

  /** 内部输入框容器的类名。 */
  protected readonly inputClasses = computed(() => {
    const classes = ['t-input'];
    const status = this.resolvedStatus();
    if (status !== 'default') classes.push(`t-is-${status}`);
    if (this.label()) classes.push('t-input--prefix');
    if (this.suffix()) classes.push('t-input--suffix');
    const align = this.align() ?? (this.theme() === 'row' ? 'center' : undefined);
    if (align === 'center') classes.push('t-align-center');
    if (align === 'right') classes.push('t-align-right');
    if (this.focused()) classes.push('t-input--focused', 't-is-focused');
    if (this.mergedDisabled()) classes.push('t-is-disabled');
    if (this.mergedReadonly()) classes.push('t-is-readonly');
    return classes.join(' ');
  });

  /** 提示文本类名。 */
  protected readonly tipsClasses = computed(() => `t-input__tips t-input__tips--${this.resolvedStatus()}`);

  constructor() {
    effect(() => {
      this.editRevision();
      const next = this.current();
      untracked(() => this.syncDisplay(next));
    });
  }

  /** 把 `TemplateRef` 识别出来，供模板统一渲染文本 / 模板。 */
  protected asTemplate(value: unknown): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  writeValue(value: InputNumberValue | null | undefined): void {
    this.innerValue.set(value ?? null);
  }

  registerOnChange(fn: (value: InputNumberValue | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }

  /** 点击减少按钮。 */
  protected handleReduce(event: MouseEvent): void {
    this.handleStep('reduce', event);
  }

  /** 点击增加按钮。 */
  protected handleAdd(event: MouseEvent): void {
    this.handleStep('add', event);
  }

  /** 输入过程中的处理。 */
  protected handleInput(event: Event): void {
    if (this.mergedDisabled() || this.mergedReadonly()) return;
    const element = event.target as HTMLInputElement;
    const processed = this.clampDecimals(formatThousandths(limitInputText(element.value, this.inputProps())));
    if (!canInputNumber(processed, this.largeNumber())) {
      element.value = this.userInput();
      return;
    }
    this.userInput.set(processed);
    if (element.value !== processed) element.value = processed;
    this.inputProps()?.onChange?.(processed, { e: event });
    if (processed === '') {
      this.applyValue(undefined, 'input', event);
      return;
    }
    if (this.largeNumber()) {
      this.applyValue(processed, 'input', event);
      return;
    }
    const next = Number(processed);
    if (!Number.isNaN(next) && canSetValue(processed, this.current())) this.applyValue(next, 'input', event);
  }

  /** 聚焦时展示原始值。 */
  protected handleFocus(event: FocusEvent): void {
    this.focused.set(true);
    const current = this.current();
    this.userInput.set(current === undefined ? '' : String(current));
    this.focus.emit({ value: current, e: event });
  }

  /** 失焦时整理小数位并按需收敛到区间端点。 */
  protected handleBlur(event: FocusEvent): void {
    this.focused.set(false);
    this.onTouched();
    const current = this.current();
    const error = this.errorOf(current);
    if (!this.allowInputOverLimit() && error !== undefined) {
      const clamped = error === 'below-minimum' ? this.min() : this.max();
      this.applyValue(clamped, 'blur', event);
      this.userInput.set(this.formatDisplay(String(clamped)));
      this.blur.emit({ value: clamped, e: event });
      return;
    }
    const next = this.normalizeValue(this.userInput());
    if (next !== current) {
      this.applyValue(next, 'blur', event);
      this.userInput.set(this.formatDisplay(next === undefined ? '' : String(next)));
    } else {
      this.userInput.set(this.formatDisplay(current === undefined ? '' : String(current)));
    }
    this.blur.emit({ value: next, e: event });
  }

  /** 按键处理：上下键步进、回车提交。 */
  protected handleKeydown(event: KeyboardEvent): void {
    const code = event.code || event.key;
    if (!this.mergedDisabled() && !this.mergedReadonly()) {
      if (code === 'ArrowUp' || code === 'Up') {
        event.preventDefault();
        this.handleStep('add', event);
      } else if (code === 'ArrowDown' || code === 'Down') {
        event.preventDefault();
        this.handleStep('reduce', event);
      } else if (code === 'Enter') {
        this.handleEnter(event);
      }
    }
    this.keydown.emit({ value: this.current(), e: event });
  }

  /** 按键输入事件透传。 */
  protected handleKeypress(event: KeyboardEvent): void {
    this.keypress.emit({ value: this.current(), e: event });
  }

  /** 按键抬起事件透传。 */
  protected handleKeyup(event: KeyboardEvent): void {
    this.keyup.emit({ value: this.current(), e: event });
  }

  /** 回车提交当前输入。 */
  private handleEnter(event: KeyboardEvent): void {
    const current = this.current();
    const next = this.normalizeValue(this.userInput());
    if (next !== current) this.applyValue(next, 'enter', event);
    this.userInput.set(this.formatDisplay(next === undefined ? '' : String(next)));
    this.enter.emit({ value: next, e: event });
  }

  /** 步进逻辑，与上游 handleStepValue 一致。 */
  private handleStep(op: 'add' | 'reduce', event: MouseEvent | KeyboardEvent): void {
    if (this.mergedDisabled() || this.mergedReadonly()) return;
    const next = getStepValue({
      op,
      step: this.step(),
      lastValue: this.current(),
      max: this.max(),
      min: this.min(),
      largeNumber: this.largeNumber(),
    });
    if (next === undefined) return;
    if (this.errorOf(next) !== undefined && !this.allowInputOverLimit()) return;
    this.applyValue(next, op, event);
    this.userInput.set(this.formatDisplay(String(next)));
  }

  /** 写回内部值并派发事件。 */
  private applyValue(value: InputNumberValue | undefined, type: InputNumberChangeSource, e?: Event): void {
    if (this.value() === undefined) this.innerValue.set(value === undefined ? null : value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.change.emit({ value, type, e });
    // 受控父级可能拒绝或归一化本次修改，即使 value 不变也须恢复展示值。
    if (this.value() !== undefined) this.editRevision.update((revision) => revision + 1);
    this.validate.emit({ error: this.errorOf(value) });
  }

  /** 取当前值的越界错误类型。 */
  private errorOf(value: InputNumberValue | undefined): 'exceed-maximum' | 'below-minimum' | undefined {
    return getMaxOrMinValidateResult({
      value,
      max: this.max(),
      min: this.min(),
      largeNumber: this.largeNumber(),
    });
  }

  /** 外部值变化时同步展示文本，用户正在输入相同数字时不打断。 */
  private syncDisplay(value: InputNumberValue | undefined): void {
    const text = value === undefined || value === null ? '' : String(value);
    const shown = this.userInput();
    if (text === '') {
      if (shown !== '') this.userInput.set('');
      return;
    }
    const shownNumber = parseFloat(shown);
    if (!Number.isNaN(shownNumber) && shownNumber === Number(text)) return;
    this.userInput.set(this.formatDisplay(text));
  }

  /** 展示文本：先按小数位定点，再交给 format。 */
  private formatDisplay(source: string): string {
    if (source === '') return '';
    const fixed = formatUnCompleteNumber(source, {
      decimalPlaces: this.decimalPlaces(),
      largeNumber: this.largeNumber(),
      isToFixed: true,
    });
    const text = fixed === undefined ? '' : String(fixed);
    const formatter = this.format();
    return formatter ? String(formatter(source, { fixedNumber: text })) : text;
  }

  /** 把输入文本整理成最终值。 */
  private normalizeValue(raw: string): InputNumberValue | undefined {
    const next = formatUnCompleteNumber(raw, {
      decimalPlaces: this.decimalPlaces(),
      largeNumber: this.largeNumber(),
    });
    if (next === undefined) return undefined;
    if (this.largeNumber()) return String(next);
    return typeof next === 'number' ? next : Number(next);
  }

  /** 按小数位配置截断输入中的小数部分。 */
  private clampDecimals(text: string): string {
    const decimalPlaces = this.decimalPlaces();
    if (decimalPlaces === undefined || !text.includes('.')) return text;
    const places = typeof decimalPlaces === 'number' ? decimalPlaces : decimalPlaces.places;
    const [integerPart, fractionPart = ''] = text.split('.');
    if (fractionPart.length <= places) return text;
    return `${integerPart}.${fractionPart.slice(0, places)}`;
  }
}
