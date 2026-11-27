import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { TTooltip } from '../tooltip/tooltip.component';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  TypographyContent,
  TypographyCopyable,
  TypographyEllipsis,
  TypographyTheme,
  asTemplateRef,
  typographyEllipsisStyle,
} from './typography.types';

/**
 * 文本。
 *
 * 行内文本容器。内容来自 `content` 输入或默认插槽；`strong` / `u` / `del` / `code` /
 * `mark` / `kbd` / `i` 这些装饰属性按上游的包裹顺序渲染成真实的语义元素，
 * 视觉全部来自 `.t-typography` 及其后代选择器，组件本身不写任何样式。
 *
 * `ellipsis` 只实现静态 CSS 截断（单行或多行）；copyable 提供独立的复制按钮。
 *
 * 注意：`.t-typography` 的禁用/主题色规则写在类自身上，而标题规则是 `h1&` 这种
 * 元素限定选择器，所以宿主元素只是壳：真正的语义元素（span）带 `t-typography` 类，
 * 宿主需要 `display: contents`（由 bridge.less 统一提供）。
 */
@Component({
  selector: 't-text',
  standalone: true,
  imports: [NgTemplateOutlet, TTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template #contentTpl>
      @if (asTemplate(content()); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (content()) {
        {{ content() }}
      } @else {
        <ng-content />
      }
    </ng-template>

    <ng-template #decorate let-tags let-inner="inner" let-index="index">
      @if (index < tags.length) {
        @switch (tags[index]) {
          @case ('i') {
            <i><ng-container *ngTemplateOutlet="decorate; context: { $implicit: tags, inner: inner, index: index + 1 }" /></i>
          }
          @case ('kbd') {
            <kbd><ng-container *ngTemplateOutlet="decorate; context: { $implicit: tags, inner: inner, index: index + 1 }" /></kbd>
          }
          @case ('mark') {
            <mark [style]="markStyle()"><ng-container *ngTemplateOutlet="decorate; context: { $implicit: tags, inner: inner, index: index + 1 }" /></mark>
          }
          @case ('code') {
            <code><ng-container *ngTemplateOutlet="decorate; context: { $implicit: tags, inner: inner, index: index + 1 }" /></code>
          }
          @case ('del') {
            <del><ng-container *ngTemplateOutlet="decorate; context: { $implicit: tags, inner: inner, index: index + 1 }" /></del>
          }
          @case ('u') {
            <u><ng-container *ngTemplateOutlet="decorate; context: { $implicit: tags, inner: inner, index: index + 1 }" /></u>
          }
          @case ('strong') {
            <strong><ng-container *ngTemplateOutlet="decorate; context: { $implicit: tags, inner: inner, index: index + 1 }" /></strong>
          }
        }
      } @else {
        <ng-container *ngTemplateOutlet="inner" />
      }
    </ng-template>

    <span #textContent [class]="classes()" [style]="ellipsisStyle()">
      <ng-container *ngTemplateOutlet="decorate; context: { $implicit: decorateTags(), inner: contentTpl, index: 0 }" />
    </span>
    @if (copyable()) {
      <t-tooltip [content]="copyOptions().tooltipProps?.content ?? copyLabel()"
        [placement]="copyOptions().tooltipProps?.placement ?? 'top'"
        [theme]="copyOptions().tooltipProps?.theme ?? 'default'"
        [showArrow]="copyOptions().tooltipProps?.showArrow ?? true"
        [delay]="copyOptions().tooltipProps?.delay ?? 0"
        [duration]="copyOptions().tooltipProps?.duration ?? 0"
        [disabled]="copyOptions().tooltipProps?.disabled ?? false"
        [destroyOnClose]="copyOptions().tooltipProps?.destroyOnClose ?? false"
        [zIndex]="copyOptions().tooltipProps?.zIndex">
        <button type="button" class="t-button t-button--variant-text t-button--theme-default t-size-s"
          [disabled]="disabled() || copying()" [attr.aria-label]="copyLabel()" (click)="copyText()">
          @if (copyOptions().suffix; as suffix) {
            @if (asTemplate(suffix); as template) {
              <ng-container *ngTemplateOutlet="template; context: { copied: copied() }" />
            } @else { {{ suffix }} }
          } @else {
            <svg [class]="copied() ? 't-icon t-icon-checked' : 't-icon t-icon-copy'"
              viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true">
              @if (copied()) { <path d="m4 12 5 5L20 6" stroke-width="2" /> }
              @else { <path d="M8 8h12v12H8zM4 16V4h12" stroke-width="2" /> }
            </svg>
          }
        </button>
      </t-tooltip>
      <span role="status" class="t-typography">{{ copyMessage() }}</span>
    }
  `,
})
export class TText {
  /** 文本内容。 @zh 文本内容 @en content @defaultValue undefined */
  content = input<TypographyContent>(undefined);

  /** @zh 是否显示复制按钮，可配置复制文本、后缀模板、提示及成功回调 @en Enable copying with optional text, suffix template, tooltip and success callback @defaultValue false */
  readonly copyable = input<boolean | TypographyCopyable>(false);

  protected readonly copyOptions = computed(() => {
    const config = this.copyable();
    return typeof config === 'object' ? config : {};
  });
  protected readonly copied = signal(false);
  protected readonly copying = signal(false);
  protected readonly copyMessage = signal('');
  protected readonly copyLabel = computed(() => this.copied() ? '已复制' : '复制');
  private readonly textContent = viewChild<ElementRef<HTMLElement>>('textContent');
  private readonly clipboard = inject(Clipboard);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private resetTimer?: ReturnType<typeof setTimeout>;
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      clearTimeout(this.resetTimer);
    });
  }

  protected async copyText(): Promise<void> {
    if (!this.copyable() || this.disabled() || this.copying() || !isPlatformBrowser(this.platformId)) return;
    const options = this.copyOptions();
    const text = options.text ?? this.textContent()?.nativeElement.textContent ?? '';
    this.copying.set(true);
    clearTimeout(this.resetTimer);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else if (!this.clipboard.copy(text)) throw new Error('Clipboard unavailable');
      if (this.destroyed) return;
      this.copied.set(true);
      this.copyMessage.set('已复制');
      this.resetTimer = setTimeout(() => {
        this.copied.set(false);
        this.copyMessage.set('');
      }, 2000);
    } catch {
      if (this.destroyed) return;
      this.copied.set(false);
      this.copyMessage.set('复制失败，请重试');
      return;
    } finally {
      if (!this.destroyed) this.copying.set(false);
    }
    // 消费方回调错误不应被误报为剪贴板失败。
    options.onCopy?.();
  }

  /** 是否使用代码样式。 @zh 代码样式 @en code @defaultValue false */
  code = input(false, { transform: booleanAttribute });

  /** 是否显示删除线。 @zh 删除线 @en delete @defaultValue false */
  delete = input(false, { transform: booleanAttribute });

  /** 是否禁用。 @zh 禁用 @en disabled @defaultValue false */
  disabled = input(false, { transform: booleanAttribute });

  /** 省略配置，传 true 表示单行截断。 @zh 省略 @en ellipsis @defaultValue false */
  ellipsis = input<boolean | TypographyEllipsis>(false);

  /** 是否斜体。 @zh 斜体 @en italic @defaultValue false */
  italic = input(false, { transform: booleanAttribute });

  /** 是否使用键盘按键样式。 @zh 键盘样式 @en keyboard @defaultValue false */
  keyboard = input(false, { transform: booleanAttribute });

  /** 标记，传字符串时作为背景色。 @zh 标记 @en mark @defaultValue false */
  mark = input<string | boolean>(false);

  /** 是否加粗。 @zh 加粗 @en strong @defaultValue false */
  strong = input(false, { transform: booleanAttribute });

  /** 文本主题。 @zh 文本主题 @en theme @defaultValue undefined @values primary,secondary,success,warning,error */
  theme = input<TypographyTheme | undefined>(undefined);

  /** 是否显示下划线。 @zh 下划线 @en underline @defaultValue false */
  underline = input(false, { transform: booleanAttribute });

  /** 供模板判断 content 是不是模板引用。 */
  protected readonly asTemplate = asTemplateRef;

  protected readonly classes = computed(() => {
    const classes = ['t-typography'];
    if (this.disabled()) {
      classes.push('t-typography--disabled');
    } else if (this.theme()) {
      classes.push(`t-typography--${this.theme()}`);
    }
    return classes.join(' ');
  });

  protected readonly ellipsisStyle = computed(() => typographyEllipsisStyle(this.ellipsis()));

  /** 装饰层由外到内：i > kbd > mark > code > del > u > strong（与上游包裹顺序一致）。 */
  protected readonly decorateTags = computed(() => {
    const tags: string[] = [];
    if (this.italic()) {
      tags.push('i');
    }
    if (this.keyboard()) {
      tags.push('kbd');
    }
    if (this.mark() !== false) {
      tags.push('mark');
    }
    if (this.code()) {
      tags.push('code');
    }
    if (this.delete()) {
      tags.push('del');
    }
    if (this.underline()) {
      tags.push('u');
    }
    if (this.strong()) {
      tags.push('strong');
    }
    return tags;
  });

  /** mark 传字符串时作为背景色，传 true 时完全交给 less 里的默认底色。 */
  protected readonly markStyle = computed(() => {
    const mark = this.mark();
    return typeof mark === 'string' && mark ? { 'background-color': mark } : null;
  });
}
