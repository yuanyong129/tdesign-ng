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
import type { CheckboxChangeEvent, CheckboxValue } from './checkbox.types';

@Component({
  selector: 't-checkbox',
  templateUrl: './checkbox.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TCheckbox),
      multi: true,
    },
  ],
})
export class TCheckbox implements ControlValueAccessor {
  /**
   * @zh 是否选中，独立使用时生效
   * @en Whether the checkbox is checked, used when standalone
   * @defaultValue false
   */
  readonly checked = input(false, { transform: booleanAttribute });

  /**
   * @zh 复选框的值，在复选框组中用于匹配
   * @en The value of the checkbox, matched inside a checkbox group
   * @defaultValue true
   */
  readonly value = input<CheckboxValue>(true);

  /**
   * @zh 是否禁用
   * @en Whether the checkbox is disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否只读
   * @en Whether the checkbox is readonly
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否显示为半选状态
   * @en Whether to display the indeterminate state
   * @defaultValue false
   */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  /**
   * @zh 作为全选开关使用，只对复选框组有效
   * @en Use as a check-all switch, only works inside a checkbox group
   * @defaultValue false
   */
  readonly checkAll = input(false, { transform: booleanAttribute });

  /**
   * @zh 原生 name 属性
   * @en Native name attribute
   * @defaultValue undefined
   */
  readonly name = input<string | undefined>(undefined);

  /**
   * @zh 复选框文字
   * @en The label of the checkbox
   * @defaultValue undefined
   */
  readonly label = input<string | undefined>(undefined);

  /**
   * @zh 原生 title 属性
   * @en Native title attribute
   * @defaultValue undefined
   */
  readonly title = input<string | undefined>(undefined);

  /** @zh 选中状态变化事件，用于双向绑定 @en Checked change event, used for two-way binding */
  readonly checkedChange = output<boolean>();

  /** @zh 值变化事件 @en Change event */
  readonly change = output<CheckboxChangeEvent>();

  private readonly innerChecked = signal(false);
  private readonly groupChecked = signal<boolean | null>(null);
  private readonly groupIndeterminate = signal(false);
  private readonly groupDisabled = signal(false);
  private readonly groupReadonly = signal(false);
  private readonly disabledByForms = signal(false);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isDisabled = computed(
    () => this.disabled() || this.disabledByForms() || this.groupDisabled(),
  );

  protected readonly isReadonly = computed(() => this.readonly() || this.groupReadonly());

  protected readonly isChecked = computed(() => this.groupChecked() ?? this.innerChecked());

  protected readonly isIndeterminate = computed(
    () => this.groupIndeterminate() || (this.indeterminate() && !this.isChecked()),
  );

  protected readonly classes = computed(() => {
    const classes = ['t-checkbox'];
    if (this.isChecked()) classes.push('t-is-checked');
    if (this.isIndeterminate()) classes.push('t-is-indeterminate');
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

  /** 由复选框组调用，下发选中态与半选态。 */
  setGroupState(checked: boolean, indeterminate = false): void {
    untracked(() => {
      this.groupChecked.set(checked);
      this.groupIndeterminate.set(indeterminate);
    });
  }

  /** 由复选框组调用，下发禁用态。 */
  setGroupDisabled(disabled: boolean): void {
    this.groupDisabled.set(disabled);
  }

  /** 由复选框组调用，下发只读态。 */
  setGroupReadonly(readonly: boolean): void {
    this.groupReadonly.set(readonly);
  }

  /** 供复选框组在取消失败时回滚显示。 */
  resetFromInput(): void {
    this.innerChecked.set(this.checked());
  }

  protected handleClick(event: MouseEvent): void {
    if (this.isDisabled() || this.isReadonly()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  protected handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isDisabled() || this.isReadonly()) {
      input.checked = this.isChecked();
      return;
    }

    const next = !this.isChecked();
    this.innerChecked.set(next);
    this.onTouched();
    this.onChange(next);
    this.checkedChange.emit(next);
    this.change.emit({ checked: next, value: this.value(), event });
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
