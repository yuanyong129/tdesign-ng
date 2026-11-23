import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  type Signal,
} from '@angular/core';

/** 面包屑节点的跳转目标，与上游 `target` 的可选值一致。 */
export const BREADCRUMB_TARGETS = ['_blank', '_self', '_parent', '_top'] as const;
export type BreadcrumbTarget = (typeof BREADCRUMB_TARGETS)[number];

/** 面包屑里的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type BreadcrumbContent = string | TemplateRef<unknown> | undefined;

/** 面包屑父容器通过 DI 下发给子项的量，对应上游 `provide('tBreadcrumb', …)`。 */
export interface BreadcrumbHost {
  /** 分隔符，未设置时子项渲染默认的右箭头图标。 */
  separator: Signal<BreadcrumbContent>;
  /** 子项未设置 `maxWidth` 时的兜底最大宽度。 */
  maxItemWidth: Signal<string | undefined>;
}

/** 父容器 `TBreadcrumb` 的注入令牌，子项靠它读分隔符与兜底宽度。 */
export const T_BREADCRUMB = new InjectionToken<BreadcrumbHost>('TBreadcrumb');

/** 上游把宽度直接拼成 `${value}px`；这里让纯数字串补单位，已带单位的值原样使用。 */
function toCssLength(value: string | undefined): string | null {
  if (!value) return null;
  return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

/**
 * 面包屑节点。
 *
 * 宿主元素就是 `.t-breadcrumb__item`，直接作为父容器 `.t-breadcrumb` 的 flex 子项参与布局
 * （`vendor/tdesign-common/style/web/components/breadcrumb/_index.less:20`），
 * 因此父容器不需要额外的包装模板。
 *
 * 结构对齐上游 `breadcrumb-item.mjs`：文字层 `.t-breadcrumb--text-overflow` 里依次放
 * `.t-breadcrumb__inner`（内联 max-width + 图标 + 文本），最后是 `.t-breadcrumb__separator`。
 * 上游只在有 `href` / `to` 且未禁用时把文字层换成 `<a>`，这里统一用 `<a>`：
 * 没有可跳转地址时不写 `href`，元素自然不可聚焦、不导航，但要保证整棵子树只有一个
 * `<ng-content>` 投影槽（两个分支各放一个会让投影内容只落到第一个槽里）。
 */
@Component({
  selector: 't-breadcrumb-item',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value) {
        {{ value }}
      }
    </ng-template>

    <a
      class="t-breadcrumb--text-overflow"
      [class.t-link]="isLink()"
      [class.t-is-disabled]="disabled()"
      [attr.href]="isLink() ? href() : null"
      [attr.target]="target() ?? null"
    >
      <span class="t-breadcrumb__inner" [style]="innerStyle()">
        @if (icon()) {
          <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: icon() }" />
        }
        <span class="t-breadcrumb__inner-text">
          @if (content()) {
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: content() }" />
          } @else {
            <ng-content />
          }
        </span>
      </span>
    </a>

    <!-- 上游用 isTextEllipsis 判断是否截断后才把 text-overflow 切到 ellipsis；截断提示（Tooltip）本期不做，恒为 clip。 -->
    <span class="t-breadcrumb__separator" [style]="separatorStyle()">
      @if (separatorTemplate(); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (separatorText()) {
        {{ separatorText() }}
      } @else if (hasHost()) {
        <svg class="t-icon t-icon-chevron-right" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
          <path fill="none" stroke="currentColor" stroke-linecap="square" stroke-width="2" d="M9.5 17.5L15 12L9.5 6.5" />
        </svg>
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TBreadcrumbItem {
  /** 面包屑内容，未设置时使用投影内容。 @zh 面包屑内容 @en content */
  readonly content = input<BreadcrumbContent>(undefined);

  /** 是否禁用，禁用后不可跳转并显示禁用态颜色。 @zh 是否禁用 @en disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 跳转链接。 @zh 跳转链接 @en href */
  readonly href = input<string | undefined>(undefined);

  /** 前缀图标，字符串按文本渲染，也可以传入模板。 @zh 前缀图标 @en icon */
  readonly icon = input<BreadcrumbContent>(undefined);

  /** 内容最大宽度，纯数字按 px 处理，默认继承父容器的 `maxItemWidth`，都没有时用 120px。 @zh 最大宽度 @en max width */
  readonly maxWidth = input<string | undefined>(undefined);

  /** 链接打开位置，与原生 `target` 一致。 @zh 链接打开位置 @en target @values _blank,_self,_parent,_top */
  readonly target = input<BreadcrumbTarget | undefined>(undefined);

  /** 父容器；独立使用（没有 `t-breadcrumb`）时不渲染默认分隔符，与上游一致。 */
  private readonly host = inject(T_BREADCRUMB, { optional: true });

  /** 宿主修饰类：上游 `theme` 唯一取值 `light` 在 less 里没有选择器，因此这里不带主题类。 */
  protected readonly classes = computed(() => 't-breadcrumb__item');

  /** 是否按链接渲染：有 `href` 且未禁用（上游同一条件才会换成 `<a>` 并加 `t-link`）。 */
  protected readonly isLink = computed(() => !!this.href() && !this.disabled());

  /** `max-width` 的取值：`maxWidth` → 父容器 `maxItemWidth` → 120px（上游缺省值）。 */
  protected readonly innerStyle = computed<Record<string, string>>(() => ({
    'max-width': toCssLength(this.maxWidth() || this.host?.maxItemWidth() || '120') ?? '',
  }));

  /** 上游恒给分隔符写内联 `text-overflow`；截断检测未实现，取未截断分支的 `clip`。 */
  protected readonly separatorStyle = computed<Record<string, string>>(() => ({ 'text-overflow': 'clip' }));

  /** 是否有父容器；没有父容器时上游的默认分隔符是空串。 */
  protected readonly hasHost = computed(() => this.host !== null);

  /** 父容器下发的分隔符。 */
  private readonly separatorValue = computed(() => this.host?.separator());

  /** 分隔符是模板时交给 `*ngTemplateOutlet`。 */
  protected readonly separatorTemplate = computed(() => {
    const separator = this.separatorValue();
    return separator instanceof TemplateRef ? separator : null;
  });

  /** 分隔符是文本时直接输出。 */
  protected readonly separatorText = computed(() => {
    const separator = this.separatorValue();
    return typeof separator === 'string' ? separator : '';
  });

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: BreadcrumbContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }
}
