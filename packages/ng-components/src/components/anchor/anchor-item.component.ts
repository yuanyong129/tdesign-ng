import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  type Signal,
} from '@angular/core';

/** 锚点链接的跳转方式，与上游 `target` 的可选值一致。 */
export const ANCHOR_TARGETS = ['_self', '_blank', '_parent', '_top'] as const;
export type AnchorTarget = (typeof ANCHOR_TARGETS)[number];

/** 锚点里的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type AnchorContent = string | TemplateRef<unknown> | undefined;

/** 锚点点击事件的参数，对应上游 `onClick({ href, title, e })`。 */
export interface AnchorClickEvent {
  /** 被点击链接的 `href`。 */
  href: string;
  /** 链接标题，只有 `title` 是字符串时才有值。 */
  title: string | undefined;
  /** 原生点击事件。 */
  e: MouseEvent;
}

/** 锚点父容器通过 DI 下发给子项的接口，对应上游 `provide(AnchorInjectionKey, ...)`。 */
export interface AnchorHost {
  /** 当前激活的链接，由父容器在滚动与点击时更新。 */
  active: Signal<string>;
  /** 子项挂载或 `href` 变化时注册链接。 */
  registerLink(href: string): void;
  /** 子项卸载或 `href` 变化前注销链接。 */
  unregisterLink(href: string): void;
  /** 子项被点击时请父容器滚动到对应元素。 */
  handleScrollTo(href: string): void;
  /** 子项被点击时把参数回传给父容器的 `(click)` 输出。 */
  handleLinkClick(link: AnchorClickEvent): void;
}

/** 父容器 `TAnchor` 的注入令牌，子项靠它注册链接并同步激活态。 */
export const T_ANCHOR = new InjectionToken<AnchorHost>('TAnchor');

/**
 * 锚点项。
 *
 * 宿主元素就是 `.t-anchor__item`，`<a>` 用 `.t-anchor__item-link`；默认插槽（投影内容）
 * 渲染在 `<a>` 之后，与上游一致——上游把 `children` 作为 `<a>` 的兄弟节点渲染，
 * 这样嵌套的子项会排在当前链接下方并靠 `--level` 缩进。
 */
@Component({
  selector: 't-anchor-item',
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
      class="t-anchor__item-link"
      [attr.href]="href()"
      [attr.title]="titleText()"
      [attr.target]="target()"
      (click)="handleClick($event)"
    >
      <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: title() }" />
    </a>
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TAnchorItem {
  /** 锚点链接，形如 `#basic`；父容器只取 `#` 之后的 id 去查找页面元素。 @zh 链接 @en href */
  readonly href = input.required<string>();

  /** 链接的跳转方式，`_self` 在当前页跳转。 @zh 跳转方式 @en target @defaultValue _self @values _self,_blank,_parent,_top */
  readonly target = input<AnchorTarget>('_self');

  /** 链接文本，可以是字符串或模板；字符串同时会写进 `<a title>`。 @zh 链接文本 @en title @defaultValue '' */
  readonly title = input<AnchorContent>('');

  /** 是否使用自定义滚动逻辑，为 `true` 时点击不再由父容器滚动到目标（例如自行接管路由滚动）。 @zh 是否自定义滚动 @en custom-scroll @defaultValue false */
  readonly customScroll = input(false, { transform: booleanAttribute });

  /** 父容器；独立使用（没有 `t-anchor`）时只渲染链接，不参与激活态。 */
  private readonly host = inject(T_ANCHOR, { optional: true });

  /** 是否处于激活态，由父容器的 `active` 与自身 `href` 比较得出。 */
  protected readonly isActive = computed(() => this.host?.active() === this.href());

  /** 宿主类名，激活时追加 `t-is-active`，与上游 `STATUS.active` 一致。 */
  protected readonly classes = computed(() => (this.isActive() ? 't-anchor__item t-is-active' : 't-anchor__item'));

  /** `<a title>` 只在 `title` 是字符串时设置，与上游 `isString(title)` 判断一致。 */
  protected readonly titleText = computed(() => {
    const title = this.title();
    return typeof title === 'string' ? title : null;
  });

  constructor() {
    // 注册链接：`href` 变化时先注销旧值再注册新值（对应上游对 `href` 的 watch），卸载时注销。
    effect((onCleanup) => {
      const host = this.host;
      if (host === null) return;
      const href = this.href();
      if (!href) return;
      host.registerLink(href);
      onCleanup(() => host.unregisterLink(href));
    });
  }

  /** 点击时先把激活态切到自身，再交给父容器滚动与派发 `(click)`。 */
  protected handleClick(event: MouseEvent): void {
    const href = this.href();
    if (!this.customScroll()) {
      // 上游不做 preventDefault，原生 `#hash` 跳转会与平滑滚动抢位置；这里只在真正接管滚动时拦截。
      event.preventDefault();
      this.host?.handleScrollTo(href);
    }
    const title = this.title();
    this.host?.handleLinkClick({ href, title: typeof title === 'string' ? title : undefined, e: event });
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: AnchorContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }
}
