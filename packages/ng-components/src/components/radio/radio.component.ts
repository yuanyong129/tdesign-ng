import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  ElementRef,
  inject,
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
   * @defaultValue undefined
   */
  readonly checked = input<boolean | undefined, boolean | string | undefined>(undefined, { transform: (value) => value === undefined ? undefined : booleanAttribute(value) });

  /** @zh 非受控初始选中态，仅初始化时读取 @en Initial uncontrolled checked state, read once @defaultValue false */
  readonly defaultChecked = input(false, { transform: booleanAttribute });

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

  private readonly state = createControllableState<boolean>(this.checked, () => this.defaultChecked());
  private readonly former = viewChild<ElementRef<HTMLInputElement>>('former');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly editRevision = signal(0);
  private readonly groupChecked = signal<boolean | null>(null);
  private readonly groupDisabled = signal(false);
  private readonly groupReadonly = signal(false);
  private readonly groupName = signal<string | undefined>(undefined);
  private readonly groupAllowUncheck = signal(false);
  protected readonly groupTabIndex = signal(0);
  private readonly disabledByForms = signal(false);
  private readonly isButton = signal(false);

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly prefixClass = computed(() => (this.isButton() ? 't-radio-button' : 't-radio'));

  protected readonly isDisabled = computed(
    () => this.disabled() || this.disabledByForms() || this.groupDisabled(),
  );

  protected readonly isReadonly = computed(() => this.readonly() || this.groupReadonly());

  protected readonly isChecked = computed(() => this.groupChecked() ?? this.state.current());

  protected readonly mergedName = computed(() => this.name() ?? this.groupName());

  protected readonly classes = computed(() => {
    const classes = [this.prefixClass()];
    if (this.isChecked()) classes.push('t-is-checked');
    if (this.isDisabled()) classes.push('t-is-disabled');
    return classes.join(' ');
  });

  constructor() {
    afterRenderEffect(() => {
      this.editRevision();
      const checked = this.isChecked();
      const input = this.former()?.nativeElement;
      if (input) input.checked = checked;
    });
  }

  /** 由单选框组调用，下发选中态与形态。 */
  setGroupState(checked: boolean, isButton: boolean, name?: string, allowUncheck = false, tabIndex = 0): void {
    untracked(() => {
      this.groupChecked.set(checked);
      this.isButton.set(isButton);
      this.groupName.set(name);
      this.groupAllowUncheck.set(allowUncheck);
      this.groupTabIndex.set(tabIndex);
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

  clearGroup(): void {
    this.groupChecked.set(null); this.groupDisabled.set(false); this.groupReadonly.set(false);
    this.groupName.set(undefined); this.groupAllowUncheck.set(false); this.groupTabIndex.set(0); this.isButton.set(false);
  }

  focusInput(): void { this.former()?.nativeElement.focus(); }
  containsTarget(target: EventTarget | null): boolean { return target instanceof Node && this.host.nativeElement.contains(target); }
  isEditable(): boolean { return !this.isDisabled() && !this.isReadonly(); }
  selectFromGroup(event: KeyboardEvent): void { if (this.isEditable() && !this.isChecked()) this.commit(true, event); }

  protected handleClick(event: MouseEvent): void {
    if (this.isDisabled() || this.isReadonly()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 阻止原生 radio 的选中行为，由组件按 allowUncheck 自行决定
    event.preventDefault();
    this.focusInput();
    const next = this.isChecked() ? !(this.allowUncheck() || this.groupAllowUncheck()) : true;
    if (next === this.isChecked()) return;
    this.commit(next, event);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.isReadonly() && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (this.isDisabled() || this.isReadonly()) return;
    event.preventDefault();
    if (event.repeat) return;
    const next = this.isChecked() ? !(this.allowUncheck() || this.groupAllowUncheck()) : true;
    if (next === this.isChecked()) return;
    this.commit(next, event);
  }

  private commit(checked: boolean, event: Event): void {
    if (this.groupChecked() === null) this.state.set(checked);
    this.onChange(checked);
    this.checkedChange.emit(checked);
    this.change.emit({ checked, value: this.value(), event });
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
