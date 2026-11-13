import {
  ChangeDetectionStrategy,
  Component,
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
import type { SwitchChangeEvent, SwitchSize, SwitchValue } from './switch.types';

/**
 * 开关。
 *
 * 样式全部来自 tdesign-common：根元素就是 `.t-switch`，内部是
 * `.t-switch__handle`（滑块，loading 时里面放旋转环）与 `.t-switch__content`（文字）。
 *
 * ```html
 * <t-switch [(value)]="checked" />
 * <t-switch [(value)]="status" [customValue]="['on', 'off']" />
 * <t-switch [(value)]="checked" label="开" />
 * ```
 *
 * 支持 `ngModel` / `formControlName`。
 */
@Component({
  selector: 't-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './switch.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TSwitch),
      multi: true,
    },
  ],
  host: {
    '[class]': 'classes()',
    'role': 'switch',
    '[attr.aria-checked]': 'isChecked()',
    '[attr.aria-disabled]': 'mergedDisabled() ? "true" : null',
    '[attr.tabindex]': 'mergedDisabled() ? -1 : 0',
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKeydown($event)',
  },
})
export class TSwitch implements ControlValueAccessor {
  /** @zh 开关的值 @en Value of the switch @defaultValue false */
  readonly value = input<SwitchValue>(false);

  /** @zh 开关尺寸 @en Size of the switch @defaultValue 'medium' @values small,medium,large */
  readonly size = input<SwitchSize>('medium');

  /** @zh 是否禁用 @en Whether the switch is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否加载中 @en Whether the switch is loading @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * @zh 开关文字，传数组时第一项是选中态、第二项是未选中态
   * @en Label of the switch, an array means [on, off]
   * @defaultValue undefined
   */
  readonly label = input<string | [string, string] | undefined>(undefined);

  /**
   * @zh 自定义开关值，`[选中值, 未选中值]`
   * @en Custom values as `[on, off]`
   * @defaultValue [true, false]
   */
  readonly customValue = input<[SwitchValue, SwitchValue] | undefined>(undefined);

  /**
   * @zh 切换前拦截，返回 false 或 resolve 为 false 时不切换
   * @en Callback before switching, return false to prevent it
   * @defaultValue undefined
   */
  readonly beforeChange = input<(() => boolean | Promise<boolean>) | undefined>(undefined);

  /** @zh 值变化事件，用于双向绑定 @en Value change event, used for two-way binding */
  readonly valueChange = output<SwitchValue>();

  /** @zh 值变化事件，携带原始事件 @en Change event with the raw event */
  readonly change = output<SwitchChangeEvent>();

  private readonly innerValue = signal<SwitchValue>(false);

  private readonly disabledByForms = signal(false);

  private onChange: (value: SwitchValue) => void = () => {};

  private onTouched: () => void = () => {};

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  protected readonly activeValue = computed<SwitchValue>(() => this.customValue()?.[0] ?? true);

  protected readonly inactiveValue = computed<SwitchValue>(() => this.customValue()?.[1] ?? false);

  protected readonly isChecked = computed(() => this.innerValue() === this.activeValue());

  protected readonly labelText = computed(() => {
    const label = this.label();
    if (label === undefined) return undefined;
    if (Array.isArray(label)) return this.isChecked() ? label[0] : label[1];
    return label;
  });

  protected readonly classes = computed(() => {
    const classes = ['t-switch', `t-size-${this.size()[0]}`];
    if (this.isChecked()) {
      classes.push('t-is-checked');
    }
    if (this.mergedDisabled()) {
      classes.push('t-is-disabled');
    }
    if (this.loading()) {
      classes.push('t-is-loading');
    }
    return classes.join(' ');
  });

  /** 外部 `value` 变化时同步到内部状态；用户点击时内部状态先变，再通过输出回写。 */
  constructor() {
    effect(() => {
      const next = this.value();
      untracked(() => {
        if (next !== this.innerValue()) {
          this.innerValue.set(next);
        }
      });
    });
  }

  writeValue(value: SwitchValue | null | undefined): void {
    this.innerValue.set(value ?? false);
  }

  registerOnChange(fn: (value: SwitchValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }

  protected handleClick(event: MouseEvent): void {
    if (this.mergedDisabled() || this.loading()) return;
    this.toggle(event);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (this.mergedDisabled() || this.loading()) return;
    event.preventDefault();
    this.toggle(event);
  }

  private toggle(event: MouseEvent | KeyboardEvent): void {
    const guard = this.beforeChange()?.();
    if (guard === false) return;
    if (guard instanceof Promise) {
      void guard.then((allowed) => {
        if (allowed) this.apply(event);
      });
      return;
    }
    this.apply(event);
  }

  private apply(event: MouseEvent | KeyboardEvent): void {
    const next = this.isChecked() ? this.inactiveValue() : this.activeValue();
    this.innerValue.set(next);
    this.onTouched();
    this.onChange(next);
    this.valueChange.emit(next);
    this.change.emit({ value: next, event });
  }
}
