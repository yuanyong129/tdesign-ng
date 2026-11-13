import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import type { RadioChangeEvent, RadioValue } from './radio.types';

@Component({
  selector: 't-radio',
  templateUrl: './radio.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TRadio),
      multi: true,
    },
  ],
})
export class TRadio implements ControlValueAccessor {
  /**
   * @zh 是否选中，独立使用时生效
   * @en Whether the radio is checked, used when standalone
   * @defaultValue false
   */
  readonly checked = input(false, { transform: booleanAttribute });

  /**
   * @zh 单选框的值，在单选框组中用于匹配
   * @en The value of the radio, matched inside a radio group
   * @defaultValue true
   */
  readonly value = input<RadioValue>(true);

  /**
   * @zh 是否禁用
   * @en Whether the radio is disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否只读
   * @en Whether the radio is readonly
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * @zh 再次点击已选中的单选框时是否允许取消选中
   * @en Whether to allow unchecking when clicking a checked radio again
   * @defaultValue false
   */
  readonly allowUncheck = input(false, { transform: booleanAttribute });

  /**
   * @zh 原生 name 属性，未设置时继承单选框组的 name
   * @en Native name attribute, inherits from the radio group when unset
   * @defaultValue undefined
   */
  readonly name = input<string | undefined>(undefined);

  /**
   * @zh 单选框文字
   * @en The label of the radio
   * @defaultValue undefined
   */
  readonly label = input<string | undefined>(undefined);

  /** @zh 选中状态变化事件 @en Checked change event */
  readonly checkedChange = output<boolean>();

  /** @zh 值变化事件 @en Change event */
  readonly change = output<RadioChangeEvent>();

  private readonly innerChecked = signal(false);
  private readonly groupChecked = signal<boolean | null>(null);
  private readonly groupDisabled = signal(false);
  private readonly groupReadonly = signal(false);
  private readonly groupName = signal<string | undefined>(undefined);
  private readonly disabledByForms = signal(false);
  private readonly isButton = signal(false);

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly prefixClass = computed(() => (this.isButton() ? 't-radio-button' : 't-radio'));

  protected readonly isDisabled = computed(
    () => this.disabled() || this.disabledByForms() || this.groupDisabled(),
  );

  protected readonly isReadonly = computed(() => this.readonly() || this.groupReadonly());

  protected readonly isChecked = computed(() => this.groupChecked() ?? this.innerChecked());

  protected readonly mergedName = computed(() => this.name() ?? this.groupName());

  protected readonly classes = computed(() => {
    const classes = [this.prefixClass()];
    if (this.isChecked()) classes.push('t-is-checked');
    if (this.isDisabled()) classes.push('t-is-disabled');
    return classes.join(' ');
  });

  constructor() {
    // 独立使用时，外部 checked 变化同步到内部状态；受组控制时不覆盖组下发的状态
    effect(() => {
      const checked = this.checked();
      if (this.groupChecked() !== null) return;
      untracked(() => this.innerChecked.set(checked));
    });
  }

  /** 由单选框组调用，下发选中态与形态。 */
  setGroupState(checked: boolean, isButton: boolean, name?: string): void {
    untracked(() => {
      this.groupChecked.set(checked);
      this.isButton.set(isButton);
      this.groupName.set(name);
    });
  }

  /** 由单选框组调用，下发禁用态。 */
  setGroupDisabled(disabled: boolean): void {
    this.groupDisabled.set(disabled);
  }

  /** 由单选框组调用，下发只读态。 */
  setGroupReadonly(readonly: boolean): void {
    this.groupReadonly.set(readonly);
  }

  protected handleClick(event: MouseEvent): void {
    if (this.isDisabled() || this.isReadonly()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 阻止原生 radio 的选中行为，由组件按 allowUncheck 自行决定
    event.preventDefault();
    const next = this.isChecked() ? !this.allowUncheck() : true;
    if (next === this.isChecked()) return;
    this.commit(next, event);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (this.isDisabled() || this.isReadonly()) return;
    event.preventDefault();
    const next = this.isChecked() ? !this.allowUncheck() : true;
    if (next === this.isChecked()) return;
    this.commit(next, event);
  }

  private commit(checked: boolean, event: Event): void {
    this.innerChecked.set(checked);
    this.onTouched();
    this.onChange(checked);
    this.checkedChange.emit(checked);
    this.change.emit({ checked, value: this.value(), event });
  }

  writeValue(value: boolean | null): void {
    this.innerChecked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }
}
