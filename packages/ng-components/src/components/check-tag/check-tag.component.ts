import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  AfterContentChecked,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { CheckTagChangeEvent, CheckTagContent, CheckTagSize, CheckTagValue, CheckTagTagProps } from './check-tag.types';
import { isTemplateContent } from '../../_utils/content';
import { colorLuminance, parseColor } from '../tag/tag.types';

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
    @if (appearance().icon; as icon) {
      @if (isTemplateContent(icon)) {
        <ng-container *ngTemplateOutlet="icon" />
      } @else { {{ icon }} }
    }
    <span #text [class.t-tag--text]="appearance().maxWidth !== undefined"
      [style.max-width]="maxWidth()" [attr.title]="titleAttr()">
      @if (contentTemplate(); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (contentText() !== null) {
        {{ contentText() }}
      }
      <ng-content />
    </span>
    @if (appearance().closable && !mergedDisabled()) {
      <svg class="t-icon t-tag__icon-close" viewBox="0 0 24 24" width="1em" height="1em"
        role="button" aria-label="关闭标签" tabindex="0"
        (click)="handleClose($event)" (keydown)="handleCloseKeydown($event)">
        <path fill="none" stroke="currentColor" stroke-width="2" d="m7 7 10 10M17 7 7 17" />
      </svg>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[style]': 'customStyle()',
    'role': 'checkbox',
    '[attr.aria-checked]': 'isChecked()',
    '[attr.aria-disabled]': 'mergedDisabled()',
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
export class TCheckTag implements ControlValueAccessor, AfterContentChecked {
  /** 选中状态，传值时受控。 @zh 选中状态 @en Checked state */
  readonly checked = input<boolean | undefined>(undefined);

  /** 非受控模式下的初始选中状态。 @zh 初始选中状态 @en Default checked state @defaultValue false */
  readonly defaultChecked = input(false, { transform: booleanAttribute });

  /** 标签内容，投影内容优先于它。 @zh 标签内容 @en Tag content */
  readonly content = input<CheckTagContent>(undefined);

  /** 是否禁用。 @zh 是否禁用 @en Whether the tag is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 标签尺寸。 @zh 尺寸 @en Size of the tag @defaultValue medium @values small,medium,large */
  readonly size = input<CheckTagSize | undefined>(undefined);

  /** @zh 选中状态的 Tag 配置，不覆盖显式 size 和 disabled @en Tag options for the checked state; explicit size and disabled take precedence @defaultValue undefined */
  readonly checkedProps = input<CheckTagTagProps | undefined>(undefined);

  /** @zh 未选中状态的 Tag 配置，不覆盖显式 size 和 disabled @en Tag options for the unchecked state; explicit size and disabled take precedence @defaultValue undefined */
  readonly uncheckedProps = input<CheckTagTagProps | undefined>(undefined);

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

  private readonly textRef = viewChild<ElementRef<HTMLElement>>('text');
  private readonly projectedText = signal('');
  private readonly disabledByForms = signal(false);
  protected readonly isTemplateContent = isTemplateContent;
  protected readonly appearance = computed(() => (this.isChecked() ? this.checkedProps() : this.uncheckedProps()) ?? {});
  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms() || !!this.appearance().disabled);
  protected readonly maxWidth = computed(() => {
    const value = this.appearance().maxWidth;
    return typeof value === 'number' ? `${value}px` : value ?? null;
  });
  protected readonly titleAttr = computed(() => {
    const title = this.appearance().title;
    if (title === false) return null;
    if (typeof title === 'string') return title;
    return this.projectedText() || null;
  });
  protected readonly customStyle = computed(() => {
    const { color, variant = 'dark' } = this.appearance();
    if (!color) return null;
    const parsed = parseColor(color);
    const background = parsed ? `rgba(${parsed.join(', ')}, 0.1)` : color;
    return {
      'background-color': variant === 'outline' ? null : variant === 'dark' ? color : background,
      'border-color': variant === 'outline' || variant === 'light-outline' ? color : null,
      color: variant === 'dark' ? colorLuminance(color) > 0.5 ? 'black' : 'white' : color,
    };
  });

  /** 受控 `checked` 优先，其次表单状态、用户点击，最后 `defaultChecked`。 */
  protected readonly isChecked = computed(
    () => this.checked() ?? this.checkedByForms() ?? this.checkedOverride() ?? this.defaultChecked(),
  );

  protected readonly classes = computed(() => {
    const checked = this.isChecked();
    const props = this.appearance();
    const classes = ['t-tag', 't-tag--check', `t-tag--${props.theme ?? (checked ? 'primary' : 'default')}`, `t-tag--${props.variant ?? 'dark'}`];
    const sizeClass = SIZE_CLASS[this.size() ?? props.size ?? 'medium'];
    if (sizeClass) classes.push(sizeClass);
    if (checked) classes.push('t-tag--checked');
    if (this.mergedDisabled()) classes.push('t-tag--disabled');
    if (props.shape && props.shape !== 'square') classes.push(`t-tag--${props.shape}`);
    if (props.maxWidth !== undefined) classes.push('t-tag--ellipsis');
    if (props.closable) classes.push('t-tag--close');
    return classes.join(' ');
  });

  /** 禁用时不可聚焦，与上游一致。 */
  protected readonly tabindex = computed(() => (this.mergedDisabled() ? null : '0'));

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

  setDisabledState(disabled: boolean): void {
    this.disabledByForms.set(disabled);
  }

  ngAfterContentChecked(): void {
    const text = this.textRef()?.nativeElement.textContent?.trim() ?? '';
    if (text !== this.projectedText()) this.projectedText.set(text);
  }

  protected handleClose(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.mergedDisabled()) this.appearance().onClose?.({ e: event });
  }

  protected handleCloseKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.currentTarget as SVGElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  }

  protected handleClick(event: MouseEvent): void {
    if (this.mergedDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.toggle(event);
  }

  /** 空格与回车等价于点击，与上游键盘操作一致。 */
  protected handleKeydown(event: KeyboardEvent): void {
    if (this.mergedDisabled()) return;
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
