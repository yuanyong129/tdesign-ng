import { InitialRender } from '../../_utils/initial-render';
import { useFormReadonly } from '../../_utils/form-readonly';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  ElementRef,
  inject,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputOptionsDirective, limitInputText } from '../input/input-options';
import type { InputOptions } from '../input/input-options';
import type {
  RangeInputChangeEvent,
  RangeInputClearEvent,
  RangeInputClickEvent,
  RangeInputEnterEvent,
  RangeInputFocusEvent,
  RangeInputFormat,
  RangeInputMouseEvent,
  RangeInputPosition,
  RangeInputSize,
  RangeInputStatus,
  RangeInputTrigger,
  RangeInputValue,
} from './range-input.types';

const COMPONENT_CLS = 't-range-input';

/**
 * 范围输入框。由左右两个输入框与中间分隔符组成，常用于金额、时间等区间录入场景。
 */
@Component({
  selector: 't-range-input',
  hostDirectives: [InitialRender],
  standalone: true,
  imports: [NgTemplateOutlet, InputOptionsDirective],
  templateUrl: './range-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TRangeInput),
      multi: true,
    },
  ],
})
export class TRangeInput implements ControlValueAccessor {
  /** 高亮输入框索引，0 为左侧，1 为右侧。 @zh 高亮索引 @en activeIndex */
  readonly activeIndex = input<number | undefined>(undefined);

  /** 是否无边框。 @zh 无边框 @en borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** 是否可清空。 @zh 可清空 @en clearable @defaultValue false */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** 是否禁用，传数组可分别控制左右输入框。 @zh 禁用 @en disabled @defaultValue false */
  readonly disabled = input<boolean | boolean[]>(false);

  /** 展示值格式化函数，传数组可分别格式化左右输入框。 @zh 格式化函数 @en format */
  readonly format = input<RangeInputFormat | RangeInputFormat[] | undefined>(undefined);

  /** @zh 编辑区的 InputOptions 配置，单对象作用于两侧，数组分别配置左右两侧 @en Supported editor options, shared as one object or configured separately as an array @defaultValue undefined */
  readonly inputProps = input<InputOptions | ReadonlyArray<InputOptions> | undefined>(undefined);

  protected readonly fieldOptions = computed<readonly [InputOptions | undefined, InputOptions | undefined]>(() => {
    const options = this.inputProps();
    return Array.isArray(options) ? [options[0], options[1]] : [options as InputOptions | undefined, options as InputOptions | undefined];
  });
  protected readonly readonlyFields = computed(() => this.fieldOptions().map((options) => this.formReadonly() || !!options?.readonly));

  /** 整体前缀文本或模板。 @zh 前缀内容 @en label */
  readonly label = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 占位提示文本，传数组可分别设置左右输入框。 @zh 占位文本 @en placeholder */
  readonly placeholder = input<string | string[] | undefined>(undefined);

  /** 输入框前置图标模板。 @zh 前置图标 @en prefixIcon */
  readonly prefixIcon = input<TemplateRef<unknown> | undefined>(undefined);

  /** 是否只读。 @zh 只读 @en readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });
  protected readonly formReadonly = useFormReadonly(this.readonly);

  /** 左右输入框之间的分隔符。 @zh 分隔符 @en separator @defaultValue - */
  readonly separator = input<string | TemplateRef<unknown> | undefined>('-');

  /** 值为空时是否显示清除图标。 @zh 空值显示清除图标 @en showClearIconOnEmpty @defaultValue false */
  readonly showClearIconOnEmpty = input(false, { transform: booleanAttribute });

  /** 输入框尺寸。 @zh 尺寸 @en size @defaultValue medium @values small,medium,large */
  readonly size = input<RangeInputSize>('medium');

  /** 输入框状态。 @zh 状态 @en status @defaultValue default @values default,success,warning,error */
  readonly status = input<RangeInputStatus>('default');

  /** 整体后缀文本或模板。 @zh 后缀内容 @en suffix */
  readonly suffix = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 输入框后置图标模板。 @zh 后置图标 @en suffixIcon */
  readonly suffixIcon = input<TemplateRef<unknown> | undefined>(undefined);

  /** 输入框下方提示文本或模板。 @zh 提示内容 @en tips */
  readonly tips = input<string | TemplateRef<unknown> | undefined>(undefined);

  /** 当前值，支持双向绑定。 @zh 值 @en value */
  readonly value = input<RangeInputValue | undefined>(undefined);

  /** 非受控模式下的初始值。 @zh 默认值 @en defaultValue @defaultValue [] */
  readonly defaultValue = input<RangeInputValue>([]);

  /** 值变化时触发，配合 `[(value)]` 双向绑定。 @zh 值变化 @en valueChange */
  readonly valueChange = output<RangeInputValue>();

  /** 值变化时触发，携带触发位置、来源与原始事件。 @zh 值变化 @en change */
  readonly change = output<RangeInputChangeEvent>();

  /** 点击清除图标时触发。 @zh 清除 @en clear */
  readonly clear = output<RangeInputClearEvent>();

  /** 点击输入框时触发，携带点击位置。 @zh 点击 @en click */
  readonly click = output<RangeInputClickEvent>();

  /** 失焦时触发。 @zh 失焦 @en blur */
  readonly blur = output<RangeInputFocusEvent>();

  /** 回车时触发。 @zh 回车 @en enter */
  readonly enter = output<RangeInputEnterEvent>();

  /** 聚焦时触发。 @zh 聚焦 @en focus */
  readonly focus = output<RangeInputFocusEvent>();

  /** 鼠标移入时触发。 @zh 鼠标移入 @en mouseenter */
  readonly mouseenter = output<RangeInputMouseEvent>();

  /** 鼠标移出时触发。 @zh 鼠标移出 @en mouseleave */
  readonly mouseleave = output<RangeInputMouseEvent>();

  private readonly innerValue = signal<RangeInputValue | null | undefined>(undefined);

  private readonly innerDisabled = signal(false);

  private readonly hover = signal(false);

  private readonly focused = signal(false);

  private readonly activeField = signal<number | null>(null);

  private onChange: (value: RangeInputValue) => void = () => {};

  private onTouched: () => void = () => {};

  private readonly composing = new Set<number>();
  private readonly compositionValues = new Map<number, string>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterRenderEffect(() => {
      const fields = this.readonlyFields();
      const texts = this.displayTexts();
      const inputs = this.host.nativeElement.querySelectorAll<HTMLInputElement>('input');
      fields.forEach((readonly, index) => {
        if (!readonly) return;
        this.composing.delete(index); this.compositionValues.delete(index);
        if (inputs[index]) inputs[index].value = texts[index];
      });
    });
  }

  /** 受控值优先，其次内部值，最后回落到 defaultValue。 */
  protected readonly current = computed<RangeInputValue>(() => {
    const outer = this.value();
    if (outer !== undefined) return this.normalize(outer);
    const inner = this.innerValue();
    if (inner !== undefined) return this.normalize(inner ?? []);
    return this.normalize(this.defaultValue());
  });

  /** 左右输入框展示文本。 */
  protected readonly displayTexts = computed<readonly [string, string]>(() => {
    const current = this.current();
    return [this.formatText(0, current[0]), this.formatText(1, current[1])];
  });

  /** 左右占位文本。 */
  protected readonly placeholders = computed<readonly [string, string]>(() => {
    const placeholder = this.placeholder();
    if (Array.isArray(placeholder)) return [placeholder[0] ?? '', placeholder[1] ?? ''];
    return [placeholder ?? '', placeholder ?? ''];
  });

  /** 左右禁用状态。 */
  protected readonly disabledFields = computed<readonly [boolean, boolean]>(() => {
    if (this.innerDisabled()) return [true, true];
    const disabled = this.disabled();
    const flags = Array.isArray(disabled) ? disabled : [disabled, disabled];
    return [!!flags[0] || !!this.fieldOptions()[0]?.disabled, !!flags[1] || !!this.fieldOptions()[1]?.disabled];
  });

  /** 是否整体禁用。 */
  protected readonly allDisabled = computed(() => this.disabledFields().every(Boolean));

  /** 是否已有内容。 */
  protected readonly hasValue = computed(() => {
    const current = this.current();
    return Boolean(String(current[0] ?? '')) || Boolean(String(current[1] ?? ''));
  });

  /** 是否展示清除图标。 */
  protected readonly showClearIcon = computed(() => {
    if (this.readonlyFields().some(Boolean) || this.disabledFields().some(Boolean)) return false;
    const clearable = this.clearable() && this.hasValue();
    return (clearable || this.showClearIconOnEmpty()) && this.hover();
  });

  /** 外层边框容器的类名。 */
  protected readonly boxClasses = computed(() => {
    const classes = [COMPONENT_CLS];
    if (this.size() === 'small') classes.push('t-size-s');
    if (this.size() === 'large') classes.push('t-size-l');
    if (this.allDisabled()) classes.push('t-is-disabled');
    if (this.focused()) classes.push('t-is-focused');
    if (this.status() !== 'default') classes.push(`t-is-${this.status()}`);
    if (this.prefixIcon() || this.label()) classes.push(`${COMPONENT_CLS}--prefix`);
    if (this.suffix() || this.suffixIcon()) classes.push(`${COMPONENT_CLS}--suffix`);
    if (this.borderless()) classes.push(`${COMPONENT_CLS}--borderless`);
    return classes.join(' ');
  });

  /** 提示文本类名。 */
  protected readonly tipsClasses = computed(
    () => `${COMPONENT_CLS}__tips t-tips t-is-${this.status()}`,
  );

  /** 把 `TemplateRef` 识别出来，供模板统一渲染文本 / 模板。 */
  protected asTemplate(value: unknown): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  writeValue(value: RangeInputValue | null | undefined): void {
    this.innerValue.set(value ?? null);
  }

  registerOnChange(fn: (value: RangeInputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.innerDisabled.set(isDisabled);
  }

  /** 内部输入框的类名。 */
  protected fieldClasses(index: number): string {
    const classes = ['t-input'];
    if (this.disabledFields()[index]) classes.push('t-is-disabled');
    if (this.activeField() === index || this.activeIndex() === index) classes.push('t-is-focused');
    if (this.readonlyFields()[index]) classes.push('t-is-readonly');
    return classes.join(' ');
  }

  /** 输入过程中的处理。 */
  protected handleInput(index: number, event: Event): void {
    const element = event.target as HTMLInputElement;
    if (this.disabledFields()[index] || this.readonlyFields()[index]) { element.value = this.displayTexts()[index]; return; }
    if (this.composing.has(index)) return;
    if (event.type === 'input' && this.compositionValues.has(index)) {
      const previous = this.compositionValues.get(index);
      this.compositionValues.delete(index);
      if (element.value === previous) return;
    }
    element.value = limitInputText(element.value, this.fieldOptions()[index]);
    if (String(this.current()[index] ?? '') === element.value) return;
    const next = [...this.current()];
    next[index] = element.value;
    this.commit(next, 'input', this.positionOf(index), event);
    this.fieldOptions()[index]?.onChange?.(element.value, { e: event });
  }

  protected handleCompositionStart(index: number): void {
    this.composing.add(index);
    this.compositionValues.delete(index);
  }

  protected handleCompositionEnd(index: number, event: CompositionEvent): void {
    this.composing.delete(index);
    this.handleInput(index, event);
    this.compositionValues.set(index, (event.target as HTMLInputElement).value);
  }

  /** 聚焦时上报位置。 */
  protected handleFocus(index: number, event: FocusEvent): void {
    this.focused.set(true);
    this.activeField.set(index);
    this.focus.emit({ value: this.current(), position: this.positionOf(index), e: event });
  }

  /** 失焦时上报位置。 */
  protected handleBlur(index: number, event: FocusEvent): void {
    this.focused.set(false);
    this.activeField.set(null);
    this.onTouched();
    this.blur.emit({ value: this.current(), position: this.positionOf(index), e: event });
  }

  /** 按键处理：回车上报。 */
  protected handleKeydown(index: number, event: KeyboardEvent): void {
    if (this.disabledFields()[index]) return;
    if (event.code === 'Enter' || event.key === 'Enter') {
      this.enter.emit({ value: this.current(), position: this.positionOf(index), e: event });
    }
  }

  /** 点击事件，按点击位置区分左右。 */
  protected handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const position: RangeInputPosition = target?.closest(`.${COMPONENT_CLS}__inner-left`)
      ? 'first'
      : target?.closest(`.${COMPONENT_CLS}__inner-right`)
        ? 'second'
        : 'all';
    this.click.emit({ position, e: event });
  }

  /** 鼠标移入，控制清除图标显隐。 */
  protected handleMouseenter(event: MouseEvent): void {
    this.hover.set(true);
    this.mouseenter.emit({ e: event });
  }

  /** 鼠标移出，控制清除图标显隐。 */
  protected handleMouseleave(event: MouseEvent): void {
    this.hover.set(false);
    this.mouseleave.emit({ e: event });
  }

  /** 点击清除图标。 */
  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.readonlyFields().some(Boolean) || this.disabledFields().some(Boolean)) return;
    this.clear.emit({ e: event });
    this.commit(['', ''], 'clear', 'all');
  }

  /** 写回内部值并派发事件。 */
  private commit(
    next: RangeInputValue,
    trigger: RangeInputTrigger,
    position: RangeInputPosition,
    e?: Event,
  ): void {
    const normalized: RangeInputValue = [next[0] ?? '', next[1] ?? ''];
    if (this.value() === undefined) this.innerValue.set(normalized);
    this.onChange(normalized);
    this.valueChange.emit(normalized);
    this.change.emit({ value: normalized, position, trigger, e });
  }

  /** 补齐为两元数组。 */
  private normalize(value: RangeInputValue | null | undefined): RangeInputValue {
    const items = value ?? [];
    return [items[0] ?? '', items[1] ?? ''];
  }

  /** 按位置格式化展示文本。 */
  private formatText(index: number, value: string | number): string {
    if (value === undefined || value === null) return '';
    const format = this.format();
    const formatter = Array.isArray(format) ? format[index] : format;
    return formatter ? String(formatter(value)) : String(value);
  }

  /** 索引转位置枚举。 */
  private positionOf(index: number): RangeInputPosition {
    return index === 0 ? 'first' : 'second';
  }
}
