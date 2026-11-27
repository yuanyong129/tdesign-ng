import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { createControllableState } from '../../_utils/controllable-state';
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
   * @defaultValue undefined
   */
  readonly checked = input<boolean | undefined, boolean | string | undefined>(undefined, { transform: (value) => value === undefined ? undefined : booleanAttribute(value) });

  /** @zh 非受控初始选中态，仅初始化时读取 @en Initial uncontrolled checked state, read once @defaultValue false */
  readonly defaultChecked = input(false, { transform: booleanAttribute });

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

  private readonly state = createControllableState<boolean>(this.checked, () => this.defaultChecked());
  private readonly former = viewChild<ElementRef<HTMLInputElement>>('former');
  private readonly editRevision = signal(0);
  private readonly groupChecked = signal<boolean | null>(null);
  private readonly groupIndeterminate = signal(false);
  private readonly groupDisabled = signal(false);
  private readonly groupReadonly = signal(false);
  private readonly groupName = signal<string | undefined>(undefined);
  protected readonly mergedName = computed(() => this.name() ?? this.groupName());
  private readonly disabledByForms = signal(false);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isDisabled = computed(
    () => this.disabled() || this.disabledByForms() || this.groupDisabled(),
  );

  protected readonly isReadonly = computed(() => this.readonly() || this.groupReadonly());

  protected readonly isChecked = computed(() => this.groupChecked() ?? this.state.current());

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
    afterRenderEffect(() => {
      this.editRevision();
      const input = this.former()?.nativeElement;
      const checked = this.isChecked(), indeterminate = this.isIndeterminate();
      if (input) { input.checked = checked; input.indeterminate = indeterminate; }
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

  setGroupName(name: string | undefined): void { this.groupName.set(name); }
  isProtectedForGroup(): boolean { return this.disabled() || this.disabledByForms() || this.readonly(); }

  clearGroup(): void {
    this.groupChecked.set(null); this.groupIndeterminate.set(false);
    this.groupDisabled.set(false); this.groupReadonly.set(false); this.groupName.set(undefined);
  }

  /** 供复选框组在取消失败时回滚显示。 */
  resetFromInput(): void {
    this.editRevision.update((revision) => revision + 1);
  }

  protected handleClick(event: MouseEvent): void {
    if (this.isDisabled() || this.isReadonly()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  protected handleChange(event: Event): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    if (this.isDisabled() || this.isReadonly()) {
      input.checked = this.isChecked();
      return;
    }

    const next = !this.isChecked();
    if (this.groupChecked() === null) this.state.set(next);
    this.onChange(next);
    this.checkedChange.emit(next);
    this.change.emit({ checked: next, value: this.value(), event });
    this.editRevision.update((revision) => revision + 1);
  }

  protected handleBlur(): void { this.onTouched(); }

  writeValue(value: boolean | null): void {
    this.state.write(!!value);
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
