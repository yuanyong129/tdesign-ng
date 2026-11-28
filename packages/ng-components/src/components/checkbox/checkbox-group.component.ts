import { useFormReadonly } from '../../_utils/form-readonly';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  contentChildren,
  viewChildren,
  effect,
  forwardRef,
  input,
  inject,
  output,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { createControllableState } from '../../_utils/controllable-state';
import { TCheckbox } from './checkbox.component';
import {
  normalizeOption,
  type CheckboxGroupChangeEvent,
  type CheckboxGroupValue,
  type CheckboxOption,
  type CheckboxValue,
} from './checkbox.types';

@Component({
  selector: 't-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  host: { class: 't-checkbox-group', role: 'group', '(focusout)': 'handleFocusOut($event)' },
  standalone: true,
  imports: [TCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TCheckboxGroup),
      multi: true,
    },
  ],
})
export class TCheckboxGroup implements ControlValueAccessor {
  /**
   * @zh 选中的值集合
   * @en The checked values
   * @defaultValue undefined
   */
  readonly value = input<CheckboxGroupValue | undefined>(undefined);

  /** @zh 非受控初始值，仅初始化时读取 @en Initial uncontrolled value, read once @defaultValue [] */
  readonly defaultValue = input<CheckboxGroupValue>([]);

  /**
   * @zh 选项列表，配置后用 options 渲染；不配置时使用内容投影
   * @en Options to render; when omitted, projected content is used
   * @defaultValue undefined
   */
  readonly options = input<CheckboxOption[] | undefined>(undefined);

  /**
   * @zh 最多可选中个数
   * @en Maximum number of checked items
   * @defaultValue undefined
   */
  readonly max = input<number | undefined>(undefined);

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
   * @zh 原生 name 属性
   * @en Native name attribute
   * @defaultValue undefined
   */
  readonly name = input<string | undefined>(undefined);

  /** @zh 值变化事件，用于双向绑定 @en Value change event, used for two-way binding */
  readonly valueChange = output<CheckboxGroupValue>();

  /** @zh 变更事件，附带本次变化的选项信息 @en Change event with the changed option */
  readonly change = output<CheckboxGroupChangeEvent>();

  /**
   * 子项有两种来源：
   * - 内容投影（写在调用方模板里，拿不到本组件的 DI，只能用内容查询）
   * - options 渲染（在本组件模板里，属于视图查询）
   * 两者合并后才能统一驱动。
   */
  private readonly contentCheckboxes = contentChildren(TCheckbox, { descendants: true });
  private readonly viewCheckboxes = viewChildren(TCheckbox);
  private readonly children = computed(() => [...this.viewCheckboxes(), ...this.contentCheckboxes()]);

  private readonly state = createControllableState(this.value, () => [...this.defaultValue()]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly disabledByForms = signal(false);

  private onChange: (value: CheckboxGroupValue) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly items = computed(() => (this.options() ?? []).map((option) => normalizeOption(option)));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.children().forEach((child) => child.clearGroup()));
    // 组内选中态统一由 group 决定，向下推送
    effect(() => {
      const value = this.state.current();
      const children = this.children();
      if (!children.length) return;
      this.syncChildren(value, children);
    });

    // 禁用与只读向下推送，并订阅子项变更
    effect((onCleanup) => {
      const children = this.children();
      const disabled = this.disabled() || this.disabledByForms();
      const readonly = this.formReadonly();
      const name = this.name();
      const value = this.state.current();
      const max = this.max();
      const subscriptions = children.map((child) => {
        child.setGroupDisabled(disabled || (!child.checkAll() && !value.includes(child.value()) && max !== undefined && value.length >= max));
        child.setGroupReadonly(readonly);
        child.setGroupName(name);
        return child.change.subscribe((event) => this.handleChildChange(child, event));
      });
      onCleanup(() => { subscriptions.forEach((subscription) => subscription.unsubscribe()); untracked(() => children.filter((child) => !this.children().includes(child)).forEach((child) => child.clearGroup())); });
    });
  }

  private syncChildren(value: CheckboxGroupValue, children: readonly TCheckbox[]): void {
    const items = children.filter((child) => !child.checkAll());
    const editable = items.filter((child) => !child.isProtectedForGroup());
    let checkedCount = 0;
    for (const child of items) {
      const checked = value.includes(child.value());
      if (checked && editable.includes(child)) checkedCount += 1;
      child.setGroupState(checked);
    }
    const allChecked = editable.length > 0 && checkedCount === editable.length;
    const indeterminate = checkedCount > 0 && checkedCount < editable.length;
    for (const child of children) {
      if (child.checkAll()) child.setGroupState(allChecked, indeterminate);
    }
  }

  private handleChildChange(child: TCheckbox, event: { checked: boolean; event: Event }): void {
    if (this.isDisabled() || this.isReadonly()) {
      this.syncChildren(this.state.current(), this.children());
      return;
    }

    if (child.checkAll()) {
      this.setAll(event.checked, event.event);
      return;
    }

    const current = this.state.current();
    const value = child.value();
    const exists = current.includes(value);
    const max = this.max();
    if (!exists && max !== undefined && current.length >= max) {
      this.syncChildren(current, this.children());
      return;
    }

    const next = exists ? current.filter((item) => item !== value) : [...current, value];
    this.apply(next, value, exists ? 'uncheck' : 'check', event.event);
  }

  private setAll(checked: boolean, event: Event): void {
    if (this.isDisabled() || this.isReadonly()) return;
    const editable = this.children().filter((child) => !child.checkAll() && !child.isProtectedForGroup()).map((child) => child.value());
    const current = this.state.current();
    const next = checked ? [...current] : current.filter((value) => !editable.includes(value));
    if (checked) {
      const max = this.max();
      for (const value of editable) {
        if (max !== undefined && next.length >= max) break;
        if (!next.includes(value)) next.push(value);
      }
    }
    if (next.length === current.length && next.every((value, index) => value === current[index])) return;
    this.apply(next, undefined, checked ? 'check' : 'uncheck', event);
  }

  private apply(
    next: CheckboxGroupValue,
    current: CheckboxValue | undefined,
    type: 'check' | 'uncheck',
    event: Event,
  ): void {
    this.state.set(next);
    this.onChange(next);
    this.valueChange.emit(next);
    this.change.emit({
      value: next,
      current,
      option: this.options()?.find((option) => normalizeOption(option).value === current),
      type,
      event,
    });
    this.syncChildren(this.state.current(), this.children());
  }

  protected handleFocusOut(event: FocusEvent): void {
    if (!event.relatedTarget || !this.host.nativeElement.contains(event.relatedTarget as Node)) this.onTouched();
  }

  private isDisabled(): boolean {
    return this.disabled() || this.disabledByForms();
  }

  private isReadonly(): boolean {
    return this.formReadonly();
  }

  writeValue(value: CheckboxGroupValue | null): void {
    this.state.write(value ?? []);
  }

  registerOnChange(fn: (value: CheckboxGroupValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }
}
