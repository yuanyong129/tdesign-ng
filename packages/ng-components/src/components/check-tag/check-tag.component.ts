import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import type { CheckTagChangeEvent, CheckTagContent, CheckTagSize, CheckTagValue } from './check-tag.types';

/** 把 `size` 翻译成类名，`medium` 是默认值不产生类名。 */
const SIZE_CLASS: Record<CheckTagSize, string> = {
  small: 't-size-s',
  medium: '',
  large: 't-size-l',
};

/**
 * 可选标签。
 *
 * ```html
 * <t-check-tag [checked]="checked" (checkedChange)="checked = $event">标签</t-check-tag>
 * <t-check-tag value="1" [checked]="true" disabled>已选中</t-check-tag>
 * ```
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`）的 `t-tag--check` 系列：
 * 选中为 `t-tag--primary t-tag--dark t-tag--checked`，未选中为 `t-tag--default t-tag--dark`，
 * 类名直接挂在宿主元素上，这样 `t-check-tag-group` 的相邻间距规则才能命中。
 * 支持 `ngModel`（`ControlValueAccessor`，值为布尔）。
 */
@Component({
  selector: 't-check-tag',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span>
      @if (contentTemplate(); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (contentText() !== null) {
        {{ contentText() }}
      }
      <ng-content />
    </span>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.tabindex]': 'tabindex()',
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKeydown($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TCheckTag),
      multi: true,
    },
  ],
})
export class TCheckTag implements ControlValueAccessor {
  /** 选中状态，传值时受控。 @zh 选中状态 @en Checked state */
  readonly checked = input<boolean | undefined>(undefined);

  /** 非受控模式下的初始选中状态。 @zh 初始选中状态 @en Default checked state @defaultValue false */
  readonly defaultChecked = input(false, { transform: booleanAttribute });

  /** 标签内容，投影内容优先于它。 @zh 标签内容 @en Tag content */
  readonly content = input<CheckTagContent>(undefined);

  /** 是否禁用。 @zh 是否禁用 @en Whether the tag is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 标签尺寸。 @zh 尺寸 @en Size of the tag @defaultValue medium @values small,medium,large */
  readonly size = input<CheckTagSize>('medium');

  /** 标签的值，用于在标签组里定位。 @zh 标签的值 @en Value of the tag */
  readonly value = input<CheckTagValue | undefined>(undefined);

  /** 选中状态变化事件，用于双向绑定。 @zh 选中状态变化 @en Checked state change event */
  readonly checkedChange = output<boolean>();

  /** 选中状态变化事件，携带上下文。 @zh 选中状态变化（带上下文） @en Change event with context */
  readonly change = output<CheckTagChangeEvent>();

  /** 表单通过 `writeValue` 下发的状态。 */
  private readonly checkedByForms = signal<boolean | null>(null);

  /** 非受控模式下用户点击得到的选中状态。 */
  private readonly checkedOverride = signal<boolean | null>(null);

  private onChange: (value: boolean) => void = () => {};

  private onTouched: () => void = () => {};

  /** 受控 `checked` 优先，其次表单状态、用户点击，最后 `defaultChecked`。 */
  protected readonly isChecked = computed(
    () => this.checked() ?? this.checkedByForms() ?? this.checkedOverride() ?? this.defaultChecked(),
  );

  protected readonly classes = computed(() => {
    const checked = this.isChecked();
    const classes = ['t-tag', 't-tag--check', checked ? 't-tag--primary' : 't-tag--default', 't-tag--dark'];
    const sizeClass = SIZE_CLASS[this.size()];
    if (sizeClass) classes.push(sizeClass);
    if (checked) classes.push('t-tag--checked');
    if (this.disabled()) classes.push('t-tag--disabled');
    return classes.join(' ');
  });

  /** 禁用时不可聚焦，与上游一致。 */
  protected readonly tabindex = computed(() => (this.disabled() ? null : '0'));

  protected readonly contentTemplate = computed<TemplateRef<unknown> | null>(() => {
    const content = this.content();
    return content instanceof TemplateRef ? content : null;
  });

  protected readonly contentText = computed(() => {
    const content = this.content();
    return typeof content === 'string' ? content : null;
  });

  writeValue(value: boolean | null | undefined): void {
    this.checkedByForms.set(typeof value === 'boolean' ? value : null);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected handleClick(event: MouseEvent): void {
    if (this.disabled()) return;
    this.toggle(event);
  }

  /** 空格与回车等价于点击，与上游键盘操作一致。 */
  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    this.toggle(event);
  }

  private toggle(event: MouseEvent | KeyboardEvent): void {
    const next = !this.isChecked();
    this.checkedOverride.set(next);
    this.onTouched();
    this.onChange(next);
    this.checkedChange.emit(next);
    this.change.emit({ checked: next, value: this.value(), event });
  }
}
