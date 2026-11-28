import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TLoading } from '../loading/loading.component';
import type { LoadingContent, LoadingOptions } from '../loading/loading.types';
import { isTemplateContent, type Content } from '../../_utils/content';

/** 卡片尺寸。 */
export const CARD_SIZES = ['medium', 'small'] as const;
export type CardSize = (typeof CARD_SIZES)[number];

/** 卡片主题，`poster2` 会把操作区放到卡片底部。 */
export const CARD_THEMES = ['normal', 'poster1', 'poster2'] as const;
export type CardTheme = (typeof CARD_THEMES)[number];

/** 卡片富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type CardContent = Content;
export type CardLoading = boolean | TemplateRef<unknown>;
/** Card owns its business content and loading state; only these Loading options are forwarded. */
export interface CardLoadingOptions extends LoadingOptions {
  indicator?: boolean | LoadingContent;
}

/** 卡片区块的内联样式，与上游 `Styles` 对齐，支持字符串或样式对象。 */
export type CardStyles = Record<string, string | number> | string | undefined;

/**
 * 卡片。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类：
 * 头部（头像、标题、副标题、描述、操作区）、封面、主体、底部四段按上游顺序拼装。
 */
@Component({
  selector: 't-card',
  standalone: true,
  imports: [NgTemplateOutlet, TLoading],
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'isLoading() ? "true" : null',
  },
})
export class TCard {
  /** 卡片操作区，显示在头部右侧；`theme` 为 poster2 时显示在底部。 @zh 卡片操作区 @en actions */
  readonly actions = input<CardContent>(undefined);

  /** 卡片头像，显示在标题左侧。 @zh 卡片头像 @en avatar */
  readonly avatar = input<CardContent>(undefined);

  /** 是否显示卡片边框。 @zh 是否显示卡片边框 @en bordered @defaultValue false */
  readonly bordered = input(false, { transform: booleanAttribute });

  /** 卡片主体区域额外的类名。 @zh 卡片主体区域的类名 @en body class name */
  readonly bodyClassName = input<string | undefined>(undefined);

  /** 卡片主体区域的内联样式。 @zh 卡片主体区域的样式 @en body style */
  readonly bodyStyle = input<CardStyles>(undefined);

  /** 卡片封面，字符串会作为图片地址渲染，也可以传入模板或组件。 @zh 卡片封面 @en cover */
  readonly cover = input<CardContent>(undefined);

  /** 卡片描述文本，显示在标题与副标题下方。 @zh 卡片描述 @en description */
  readonly description = input<CardContent>(undefined);

  /** 卡片底部内容。 @zh 卡片底部内容 @en footer */
  readonly footer = input<CardContent>(undefined);

  /** 卡片底部区域额外的类名。 @zh 卡片底部区域的类名 @en footer class name */
  readonly footerClassName = input<string | undefined>(undefined);

  /** 卡片底部区域的内联样式。 @zh 卡片底部区域的样式 @en footer style */
  readonly footerStyle = input<CardStyles>(undefined);

  /** 自定义卡片头部，设置后不再渲染头像、标题、副标题、描述等默认结构。 @zh 自定义卡片头部 @en header */
  readonly header = input<CardContent>(undefined);

  /** 卡片头部区域额外的类名。 @zh 卡片头部区域的类名 @en header class name */
  readonly headerClassName = input<string | undefined>(undefined);

  /** 卡片头部区域的内联样式。 @zh 卡片头部区域的样式 @en header style */
  readonly headerStyle = input<CardStyles>(undefined);

  /** 卡片头部是否显示下边框。 @zh 卡片头部是否显示下边框 @en header bordered @defaultValue false */
  readonly headerBordered = input(false, { transform: booleanAttribute });

  /** 鼠标悬浮时是否显示阴影。 @zh 鼠标悬浮时是否显示阴影 @en hover shadow @defaultValue false */
  readonly hoverShadow = input(false, { transform: booleanAttribute });

  /** @zh 加载状态；布尔值显示主体遮罩，模板替换卡片可见内容 @en Loading state, boolean for body overlay or template replacing visible card content @defaultValue false */
  readonly loading = input<CardLoading, CardLoading | string | null | undefined>(false, {
    transform: value => isTemplateContent(value) ? value : booleanAttribute(value),
  });

  /** @zh 默认加载的配置，支持文字、尺寸、延迟、遮罩、全屏和图标；显式 loading 决定状态，不接收 attach/content/loading @en Default loading options including indicator; the explicit loading input owns state, attach/content/loading are excluded @defaultValue undefined */
  readonly loadingProps = input<CardLoadingOptions | undefined>(undefined);

  /** 是否显示卡片阴影。 @zh 是否显示卡片阴影 @en shadow @defaultValue false */
  readonly shadow = input(false, { transform: booleanAttribute });

  /** 卡片尺寸。 @zh 卡片尺寸 @en size @defaultValue 'medium' @values medium,small */
  readonly size = input<CardSize>('medium');

  /** 卡片状态，显示在头部右侧（与操作区同一位置）。 @zh 卡片状态 @en status */
  readonly status = input<string | undefined>(undefined);

  /** 卡片副标题，显示在标题下方。 @zh 卡片副标题 @en subtitle */
  readonly subtitle = input<CardContent>(undefined);

  /** 卡片主题。 @zh 卡片主题 @en theme @defaultValue 'normal' @values normal,poster1,poster2 */
  readonly theme = input<CardTheme>('normal');

  /** 卡片标题。 @zh 卡片标题 @en title */
  readonly title = input<CardContent>(undefined);

  /** Permanent business content probe; overlay visibility never recreates these nodes. */
  private readonly bodyInner = viewChild<ElementRef<HTMLElement>>('bodyInner');
  protected readonly isLoading = computed(() => !!this.loading());
  protected readonly customLoading = computed(() => {
    const loading = this.loading(); return isTemplateContent(loading) ? loading : null;
  });

  /** 卡片主体里是否真的有投影内容，决定要不要渲染 `.t-card__body`（对齐上游按 children 判断的行为）。 */
  protected readonly hasContent = signal(false);

  protected readonly isPoster2 = computed(() => this.theme() === 'poster2');

  /** 上游：header / title / subtitle / description / avatar / 状态（poster2）/ 操作区（非 poster2）任一存在即渲染头部。 */
  protected readonly hasHeader = computed(
    () =>
      !!this.header() ||
      !!this.title() ||
      !!this.subtitle() ||
      !!this.description() ||
      !!this.avatar() ||
      (!!this.status() && this.isPoster2()) ||
      (!!this.actions() && !this.isPoster2()),
  );

  /** 上游：footer 存在，或 poster2 主题下存在操作区时渲染底部。 */
  protected readonly hasFooter = computed(() => !!this.footer() || (!!this.actions() && this.isPoster2()));

  protected readonly classes = computed(() => this.customLoading() ? '' :
    this.mergeClasses(
      't-card',
      this.size() === 'small' ? 't-size-s' : '',
      this.bordered() ? 't-card--bordered' : '',
      this.shadow() ? 't-card--shadow' : '',
      this.hoverShadow() ? 't-card--shadow-hover' : '',
    ),
  );

  protected readonly headerClasses = computed(() =>
    this.mergeClasses('t-card__header', this.headerBordered() ? 't-card__title--bordered' : '', this.headerClassName()),
  );

  protected readonly bodyClasses = computed(() => this.mergeClasses('t-card__body', this.bodyClassName()));

  protected readonly footerClasses = computed(() => this.mergeClasses('t-card__footer', this.footerClassName()));

  /** 封面是字符串时按图片渲染，与上游一致。 */
  protected readonly coverSrc = computed(() => {
    const cover = this.cover();
    return typeof cover === 'string' ? cover : null;
  });

  /** 加载态的视觉由 t-loading 提供（上游同样用 Loading 组件），组件本身不写任何加载态样式。 */
  constructor() {
    afterRenderEffect(cleanup => {
      const element = this.bodyInner()?.nativeElement;
      if (!element) return;
      const measure = () => this.hasContent.set(Array.from(element.childNodes)
        .some(node => node.nodeType === 1 || node.nodeType === 3 && !!node.textContent?.trim()));
      untracked(measure);
      const Observer = element.ownerDocument.defaultView?.MutationObserver;
      const observer = Observer ? new Observer(measure) : undefined;
      observer?.observe(element, { childList: true, characterData: true, subtree: true });
      cleanup(() => observer?.disconnect());
    });
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: CardContent): TemplateRef<unknown> | null {
    return isTemplateContent(value) ? value : null;
  }

  private mergeClasses(...classes: Array<string | undefined | false>): string {
    return classes.filter((item): item is string => !!item).join(' ');
  }

}
