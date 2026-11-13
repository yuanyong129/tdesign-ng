import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  viewChildren,
  effect,
  forwardRef,
  input,
  output,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
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
  host: { class: 't-checkbox-group' },
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
   * @defaultValue []
   */
  readonly value = input<CheckboxGroupValue>([]);

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

  private readonly innerValue = signal<CheckboxGroupValue>([]);
  private readonly disabledByForms = signal(false);

  private onChange: (value: CheckboxGroupValue) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly items = computed(() => (this.options() ?? []).map((option) => normalizeOption(option)));

  protected readonly allValues = computed(() =>
    this.children()
      .filter((child) => !child.checkAll())
      .map((child) => child.value()),
  );

  constructor() {
    effect(() => {
      const value = this.value();
      untracked(() => this.innerValue.set(value ?? []));
    });

    // 组内选中态统一由 group 决定，向下推送
    effect(() => {
      const value = this.innerValue();
      const children = this.children();
      if (!children.length) return;
      untracked(() => this.syncChildren(value, children));
    });

    // 禁用与只读向下推送，并订阅子项变更
    effect((onCleanup) => {
      const children = this.children();
      const disabled = this.disabled() || this.disabledByForms();
      const readonly = this.readonly();
      const subscriptions = children.map((child) => {
        child.setGroupDisabled(disabled);
        child.setGroupReadonly(readonly);
        return child.change.subscribe((event) => this.handleChildChange(child, event));
      });
      onCleanup(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));
    });
  }

  private syncChildren(value: CheckboxGroupValue, children: readonly TCheckbox[]): void {
    const items = children.filter((child) => !child.checkAll());
    let checkedCount = 0;
    for (const child of items) {
      const checked = value.includes(child.value());
      if (checked) checkedCount += 1;
      child.setGroupState(checked);
    }
    const allChecked = items.length > 0 && checkedCount === items.length;
    const indeterminate = checkedCount > 0 && checkedCount < items.length;
    for (const child of children) {
      if (child.checkAll()) child.setGroupState(allChecked, indeterminate);
    }
  }

  private handleChildChange(child: TCheckbox, event: { checked: boolean; event: Event }): void {
    if (this.isDisabled() || this.isReadonly()) {
      this.syncChildren(this.innerValue(), this.children());
      return;
    }

    if (child.checkAll()) {
      this.setAll(event.checked, event.event);
      return;
    }

    const current = this.innerValue();
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
    this.apply(checked ? [...this.allValues()] : [], undefined, checked ? 'check' : 'uncheck', event);
  }

  private apply(
    next: CheckboxGroupValue,
    current: CheckboxValue | undefined,
    type: 'check' | 'uncheck',
    event: Event,
  ): void {
    this.innerValue.set(next);
    this.onTouched();
    this.onChange(next);
    this.valueChange.emit(next);
    this.change.emit({
      value: next,
      current: current as CheckboxValue,
      option: this.options()?.find((option) => normalizeOption(option).value === current),
      type,
      event,
    });
  }

  private isDisabled(): boolean {
    return this.disabled() || this.disabledByForms();
  }

  private isReadonly(): boolean {
    return this.readonly();
  }

  writeValue(value: CheckboxGroupValue | null): void {
    this.innerValue.set(value ?? []);
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
