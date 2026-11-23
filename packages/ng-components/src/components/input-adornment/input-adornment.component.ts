import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/** 输入框前后缀内容，支持纯文本与模板。 */
export type InputAdornmentContent = string | TemplateRef<unknown> | undefined;

/**
 * 输入框前后缀。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 * 上游在 `append`/`prepend` 都为空时直接渲染默认插槽本身，这里保留宿主但只挂
 * `t-input-adornment` 类（`.t-input-adornment` 本身是 flex 容器，单个子元素不受影响）。
 */
@Component({
  selector: 't-input-adornment',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (hasPrepend()) {
      <span class="t-input-adornment__prepend">
        @if (prependTemplate(); as template) {
          <ng-container *ngTemplateOutlet="template" />
        } @else {
          <span class="t-input-adornment__text">{{ prependText() }}</span>
        }
      </span>
    }
    <ng-content />
    @if (hasAppend()) {
      <span class="t-input-adornment__append">
        @if (appendTemplate(); as template) {
          <ng-container *ngTemplateOutlet="template" />
        } @else {
          <span class="t-input-adornment__text">{{ appendText() }}</span>
        }
      </span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TInputAdornment {
  /** 后缀内容。 @zh 后缀 @en append */
  append = input<InputAdornmentContent>(undefined);

  /** 前缀内容。 @zh 前缀 @en prepend */
  prepend = input<InputAdornmentContent>(undefined);

  protected readonly appendText = computed(() => this.textOf(this.append()));

  protected readonly prependText = computed(() => this.textOf(this.prepend()));

  protected readonly appendTemplate = computed(() => this.templateOf(this.append()));

  protected readonly prependTemplate = computed(() => this.templateOf(this.prepend()));

  protected readonly hasAppend = computed(() => this.appendText() !== '' || !!this.appendTemplate());

  protected readonly hasPrepend = computed(() => this.prependText() !== '' || !!this.prependTemplate());

  protected readonly classes = computed(() => {
    const classes = ['t-input-adornment'];
    if (this.hasPrepend()) {
      classes.push('t-input-adornment--prepend');
    }
    if (this.hasAppend()) {
      classes.push('t-input-adornment--append');
    }
    return classes.join(' ');
  });

  private textOf(value: InputAdornmentContent): string {
    return typeof value === 'string' ? value : '';
  }

  private templateOf(value: InputAdornmentContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }
}
