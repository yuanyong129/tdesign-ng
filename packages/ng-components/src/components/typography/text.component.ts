import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import {
  TypographyContent,
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
 * `ellipsis` 只实现静态 CSS 截断（单行或多行），复制、展开收起与 Tooltip 属于
 * 本期不实现的 [D3] 交互，因此没有对应输入属性。
 *
 * 注意：`.t-typography` 的禁用/主题色规则写在类自身上，而标题规则是 `h1&` 这种
 * 元素限定选择器，所以宿主元素只是壳：真正的语义元素（span）带 `t-typography` 类，
 * 宿主需要 `display: contents`（由 bridge.less 统一提供）。
 */
@Component({
  selector: 't-text',
  standalone: true,
  imports: [NgTemplateOutlet],
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

    <span [class]="classes()" [style]="ellipsisStyle()">
      <ng-container *ngTemplateOutlet="decorate; context: { $implicit: decorateTags(), inner: contentTpl, index: 0 }" />
    </span>
  `,
})
export class TText {
  /** 文本内容。 @zh 文本内容 @en content @defaultValue undefined */
  content = input<TypographyContent>(undefined);

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
