import { InitialRender } from '../../_utils/initial-render';
import { useFormReadonly } from '../../_utils/form-readonly';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  contentChildren,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { createControllableState } from '../../_utils/controllable-state';
import { TRadio } from './radio.component';
import {
  normalizeRadioOption,
  type RadioChangeEvent,
  type RadioDirection,
  type RadioGroupChangeEvent,
  type RadioOption,
  type RadioSize,
  type RadioTheme,
  type RadioValue,
  type RadioVariant,
} from './radio.types';

const SIZE_CLASS: Record<RadioSize, string> = {
  small: 't-size-s',
  medium: 't-size-m',
  large: 't-size-l',
};

@Component({
  selector: 't-radio-group',
  hostDirectives: [InitialRender],
  templateUrl: './radio-group.component.html',
  standalone: true,
  imports: [TRadio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    role: 'radiogroup',
    '(keydown)': 'handleGroupKeydown($event)',
    '(focusout)': 'handleFocusOut($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TRadioGroup),
      multi: true,
    },
  ],
})
export class TRadioGroup implements ControlValueAccessor {
  /**
   * @zh 选中的值
   * @en The selected value
   * @defaultValue undefined
   */
  readonly value = input<RadioValue | undefined>(undefined);

  /** @zh 非受控初始值，仅初始化时读取 @en Initial uncontrolled value, read once @defaultValue undefined */
  readonly defaultValue = input<RadioValue | undefined>(undefined);

  /**
   * @zh 选项列表，也可以用内容投影声明单选框
   * @en Option list, radios can also be declared by content projection
   * @defaultValue undefined
   */
  readonly options = input<RadioOption[] | undefined>(undefined);

  /**
   * @zh 排列方向
   * @en The layout direction
   * @defaultValue horizontal
   * @values horizontal, vertical
   */
  readonly direction = input<RadioDirection>('horizontal');

  /**
   * @zh 形态：普通单选框或按钮式单选框
   * @en The theme: plain radios or button style
   * @defaultValue radio
   * @values radio, button
   */
  readonly theme = input<RadioTheme>('radio');

  /**
   * @zh 按钮式单选框的样式变体
   * @en The variant of button style radios
   * @defaultValue outline
   * @values outline, primary-filled, default-filled
   */
  readonly variant = input<RadioVariant>('outline');

  /**
   * @zh 尺寸，只在按钮式形态下生效
   * @en The size, only works with the button theme
   * @defaultValue medium
   * @values small, medium, large
   */
  readonly size = input<RadioSize>('medium');

  /**
   * @zh 是否禁用整组
   * @en Whether the whole group is disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否只读整组
   * @en Whether the whole group is readonly
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  protected readonly formReadonly = useFormReadonly(this.readonly);

  /**
   * @zh 原生 name 属性，会下发给组内的单选框
   * @en Native name attribute, passed down to radios in the group
   * @defaultValue undefined
   */
  readonly name = input<string | undefined>(undefined);

  /**
   * @zh 再次点击已选中的单选框时是否允许取消选中
   * @en Whether to allow unchecking when clicking a checked radio again
   * @defaultValue false
   */
  readonly allowUncheck = input(false, { transform: booleanAttribute });

  /** @zh 选中值变化事件，用于双向绑定 @en Value change event, used for two-way binding */
  readonly valueChange = output<RadioValue | undefined>();

  /** @zh 值变化事件 @en Change event */
  readonly change = output<RadioGroupChangeEvent>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly bgBlock = viewChild<ElementRef<HTMLElement>>('bgBlock');
  private readonly viewRadios = viewChildren(TRadio);
  private readonly contentRadios = contentChildren(TRadio, { descendants: true });

  private readonly state = createControllableState<RadioValue | undefined>(this.value, () => this.defaultValue());
  private readonly disabledByForms = signal(false);
  private bgFrame: number | undefined;
  private initializedBgBlock: HTMLElement | undefined;

  private onChange: (value: RadioValue | undefined) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly radios = computed(() => [...this.viewRadios(), ...this.contentRadios()]);

  protected readonly normalizedOptions = computed(() => (this.options() ?? []).map(normalizeRadioOption));

  protected readonly isFilled = computed(
    () => this.theme() === 'button' && this.variant() !== 'outline',
  );

  protected readonly classes = computed(() => {
    const classes = ['t-radio-group'];
    if (this.theme() === 'button') {
      classes.push(SIZE_CLASS[this.size()]);
      if (this.variant() === 'outline') {
        classes.push('t-radio-group__outline');
      } else {
        classes.push('t-radio-group--filled');
        if (this.variant() === 'primary-filled') classes.push('t-radio-group--primary-filled');
      }
    }
    if (this.direction() === 'vertical') classes.push('t-radio-group--vertical');
    return classes.join(' ');
  });

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.radios().forEach((radio) => radio.clearGroup());
      if (this.bgFrame !== undefined && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.bgFrame);
    });
    // 把选中态、形态、name 下发给组内单选框，并按需更新按钮式的滑块
    effect(() => {
      const value = this.state.current();
      const isButton = this.theme() === 'button';
      const name = this.name();
      const radios = this.radios();
      const first = radios.find((radio) => !radio.disabled());
      const selected = radios.find((radio) => radio.value() === value && !radio.disabled()) ?? first;
      const allowUncheck = this.allowUncheck();
      for (const radio of radios) {
        radio.setGroupState(radio.value() === value, isButton, name, allowUncheck, radio === selected ? 0 : -1);
      }
      this.scheduleBgBlockUpdate();
    });

    // 下发禁用与只读
    effect(() => {
      const disabled = this.mergedDisabled();
      const readonly = this.formReadonly();
      for (const radio of this.radios()) {
        radio.setGroupDisabled(disabled);
        radio.setGroupReadonly(readonly);
      }
    });

    // 订阅子项的选中事件
    effect((onCleanup) => {
      const subscriptions = this.radios().map((radio) =>
        radio.change.subscribe((event) => this.handleRadioChange(radio, event)),
      );
      const radios = this.radios();
      onCleanup(() => { subscriptions.forEach((subscription) => subscription.unsubscribe()); untracked(() => radios.filter((radio) => !this.radios().includes(radio)).forEach((radio) => radio.clearGroup())); });
    });
  }

  private handleRadioChange(radio: TRadio, event: RadioChangeEvent): void {
    if (this.mergedDisabled() || this.formReadonly()) return;
    if (!event.checked) {
      // 允许取消选中
      this.apply(undefined, event.event);
      return;
    }
    this.apply(radio.value(), event.event);
  }

  private apply(value: RadioValue | undefined, event: Event): void {
    if (value === this.state.current()) return;
    this.state.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.change.emit({ value, event });
  }

  protected handleGroupKeydown(event: KeyboardEvent): void {
    if (this.mergedDisabled() || this.formReadonly() || event.altKey || event.ctrlKey || event.metaKey) return;
    const radios = this.radios().filter((radio) => radio.isEditable());
    const index = radios.findIndex((radio) => radio.containsTarget(event.target));
    if (index < 0 || !radios.length) return;
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % radios.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + radios.length) % radios.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = radios.length - 1;
    else return;
    event.preventDefault();
    radios[next].focusInput(); radios[next].selectFromGroup(event);
  }

  protected handleFocusOut(event: FocusEvent): void {
    if (!event.relatedTarget || !this.host.nativeElement.contains(event.relatedTarget as Node)) this.onTouched();
  }

  /** 按钮式填充变体需要用一块背景色跟随选中的按钮，这里同步它的位置和宽度。 */
  private scheduleBgBlockUpdate(): void {
    if (typeof requestAnimationFrame === 'undefined') return;
    if (this.bgFrame !== undefined) cancelAnimationFrame(this.bgFrame);
    this.bgFrame = requestAnimationFrame(() => { this.bgFrame = undefined; this.updateBgBlock(); });
  }

  private updateBgBlock(): void {
    const block = this.bgBlock()?.nativeElement;
    if (!block) return;

    // 首次定位直接落在选中项，之后的选择变化仍使用 vendor 的滑动过渡。
    const initial = this.initializedBgBlock !== block;
    if (initial) block.style.transition = 'none';

    const host = this.host.nativeElement;
    const checked = host.querySelector<HTMLElement>('.t-radio-button.t-is-checked');
    if (!checked) {
      block.style.width = '0px';
      if (initial) {
        block.getBoundingClientRect();
        block.style.removeProperty('transition');
        this.initializedBgBlock = block;
      }
      return;
    }

    const paddingLeft = parseFloat(getComputedStyle(host).paddingLeft) || 0;
    const hostRect = host.getBoundingClientRect();
    const checkedRect = checked.getBoundingClientRect();
    block.style.width = `${checkedRect.width}px`;
    block.style.transform = `translateX(${checkedRect.left - hostRect.left - paddingLeft}px)`;
    if (initial) {
      block.getBoundingClientRect();
      block.style.removeProperty('transition');
      this.initializedBgBlock = block;
    }
  }

  writeValue(value: RadioValue | null): void {
    this.state.write(value ?? undefined);
  }

  registerOnChange(fn: (value: RadioValue | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }
}
