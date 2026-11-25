import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import type { Content } from '../../_utils/content';

/** 固钉内容：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type AffixContent = Content;

/**
 * 滚动容器，与上游 `ScrollContainer` 对齐：
 * `window`、DOM 元素、CSS 选择器（`'body'` 视作 `window`），或返回它们的函数。
 */
export type AffixScrollContainer =
  | string
  | HTMLElement
  | Window
  | null
  | undefined
  | (() => string | HTMLElement | Window | null | undefined);

/** 吸附状态变化的事件参数，与上游 `onFixedChange(affixed, { top })` 对齐。 */
export interface AffixFixedChangeEvent {
  /** 当前是否处于吸附状态。 */
  affixed: boolean;
  /** 吸附时内容顶部的坐标（px）；不吸附时为 `NaN`，与上游 `Number(false)` 一致。 */
  top: number;
}

/**
 * 数字入参的转换：`null` / `undefined` / 空串保持为空值。
 *
 * 上游用 `isUndefined(offsetTop)` 区分「设置了偏移」与「没设置偏移」，
 * Angular 的 `numberAttribute` 会把 `undefined` 变成 `NaN`，因此这里先拦一层空值，
 * 让 `[offsetTop]="null"` 等价于上游的 `:offset-top="undefined"`。
 */
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = numberAttribute(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * 固钉。
 *
 * 结构照上游：宿主元素本身就是那个「无类名的 wrap」，只负责测量、占位与承载滚动监听；
 * 内部的 div 在没有吸附时不带任何类名，吸附后加上 `t-affix`（`position: fixed`），
 * 同时把吸附瞬间的宽高写成内联样式，并在 wrap 里补一个同尺寸的占位 div 防止内容塌陷。
 * 样式的唯一定义处是 `vendor/tdesign-common/style/web/components/affix/_index.less:9`
 * （`.t-affix { position: fixed; z-index: @z-index-affix; }`）。
 *
 * 判定逻辑与上游 `es/affix/affix.mjs` 逐行对齐：先算 `calcTop = wrapTop - containerTop`，
 * 命中 `offsetTop` 就吸附到容器顶部，否则再判断容器底部的 `offsetBottom`，都不命中就取消吸附。
 * 滚动事件用 `requestAnimationFrame` 合并到一帧里测量，监听以 `passive: true` 注册，
 * 容器或 `offsetTop` / `offsetBottom` / `zIndex` 变化时重新测量，`ngOnDestroy` 里解绑。
 */
@Component({
  selector: 't-affix',
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

    <!-- 未吸附时不带类名，吸附后才加 t-affix，与上游的 className 增删一致。 -->
    <div [class]="contentClasses()" [style]="affixStyle()">
      @if (content()) {
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: content() }" />
      } @else {
        <ng-content />
      }
    </div>

    <!-- 吸附时内容脱离文档流，用同尺寸占位撑住原位置（上游是 appendChild 一个空 div）。 -->
    @if (affixed()) {
      <div [style]="placeholderStyle()"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // 宿主是上游那个无类名的 wrap，本身不承载任何样式；它需要是块级盒子才好被测量，
    // 建议父级在 bridge.less 里补一条 t-affix { display: block }（自定义元素默认 inline），
    // 因此这里的类名固定为空。
    '[class]': 'classes()',
  },
})
export class TAffix implements OnInit, OnDestroy {
  /**
   * 滚动容器，`window`、DOM 元素或 CSS 选择器都可以，留空表示 `window`。
   * @zh 滚动容器 @en scroll container @defaultValue window
   */
  readonly container = input<AffixScrollContainer>(null);

  /**
   * 内容，未设置时使用投影内容。
   * @zh 内容 @en content
   */
  readonly content = input<AffixContent>(undefined);

  /**
   * 距离容器底部的偏移（px），`null` 表示不做底部吸附。
   * @zh 距离底部的偏移 @en offset from bottom @defaultValue 0
   */
  readonly offsetBottom = input<number | null, unknown>(0, { transform: toNumberOrNull });

  /**
   * 距离容器顶部的偏移（px），`null` 表示不做顶部吸附。
   * @zh 距离顶部的偏移 @en offset from top @defaultValue 0
   */
  readonly offsetTop = input<number | null, unknown>(0, { transform: toNumberOrNull });

  /**
   * 吸附时的层级，透传到内联 `z-index`。
   * @zh 吸附时的层级 @en z-index when affixed
   */
  readonly zIndex = input<number | undefined, unknown>(undefined, { transform: numberAttribute });

  /**
   * 吸附状态变化时触发，只在状态真正翻转时派发一次（上游每次滚动都会回调同一个值）。
   * @zh 吸附状态变化 @en fixed state change
   */
  readonly fixedChange = output<AffixFixedChangeEvent>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** 是否处于吸附状态。 */
  protected readonly affixed = signal(false);

  /** 吸附时内容的 `top`（px），来自最近一次测量。 */
  private readonly fixedTop = signal(0);

  /** 最近一次测量到的 wrap 宽高（吸附时写进内容与占位的内联样式）。 */
  private readonly wrapWidth = signal(0);
  private readonly wrapHeight = signal(0);

  /** 当前绑定的滚动容器，`container` 变化时用来判断要不要重新绑定。 */
  private scrollContainer: HTMLElement | Window | null = null;

  /** 绑定时的容器入参值，用于区分「容器换了」与「只是偏移量变了」。 */
  private boundContainer: AffixScrollContainer = null;

  private bound = false;

  private frame: number | null = null;

  /** 上一帧的吸附状态，用于只在翻转时派发 `(fixedChange)`。 */
  private lastAffixed = false;

  private readonly onScroll = () => this.scheduleMeasure();
  private readonly onResize = () => this.scheduleMeasure();

  constructor() {
    this.destroyRef.onDestroy(() => this.teardown());

    // 偏移量、层级或容器变化后都要重新算一次，否则要等下一次滚动才会更新。
    effect(() => {
      this.offsetTop();
      this.offsetBottom();
      this.zIndex();
      const container = this.container();
      if (!this.bound) {
        return;
      }
      if (container !== this.boundContainer) {
        this.bind();
      } else {
        this.scheduleMeasure();
      }
    });
  }

  /** 宿主的类名固定为空，宿主是上游的无类名 wrap，所有样式都落在内部的 t-affix 上。 */
  protected readonly classes = computed(() => '');

  /** 吸附后内层 div 的类名，未吸附时移除（上游用 removeAttribute('class') 达到同样效果）。 */
  protected readonly contentClasses = computed(() => (this.affixed() ? 't-affix' : null));

  /** 吸附时的内联样式：位置 + 吸附瞬间的宽高 + 可选层级，与上游的 affixStyle 一致。 */
  protected readonly affixStyle = computed<Record<string, string> | null>(() => {
    if (!this.affixed()) {
      return null;
    }
    const style: Record<string, string> = {
      top: `${this.fixedTop()}px`,
      width: `${this.wrapWidth()}px`,
      height: `${this.wrapHeight()}px`,
    };
    const zIndex = this.zIndex();
    if (zIndex !== undefined && zIndex !== null && !Number.isNaN(zIndex)) {
      style['z-index'] = `${zIndex}`;
    }
    return style;
  });

  /** 占位 div 的尺寸，与吸附瞬间的 wrap 完全一致，保证宿主高度不塌陷。 */
  protected readonly placeholderStyle = computed<Record<string, string>>(() => ({
    width: `${this.wrapWidth()}px`,
    height: `${this.wrapHeight()}px`,
  }));

  ngOnInit(): void {
    this.bind();
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: AffixContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 解析 `container`：空值或 `'window'` / `'body'` 视作 window，字符串走 querySelector。 */
  private resolveContainer(): HTMLElement | Window | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const value = this.container();
    let node: unknown = typeof value === 'function' ? value() : value;
    if (node === null || node === undefined || node === '') {
      return window;
    }
    if (typeof node === 'string') {
      if (node === 'window' || node === 'body' || node === 'html') {
        return window;
      }
      return typeof document === 'undefined' ? null : document.querySelector<HTMLElement>(node);
    }
    if (node === window) {
      return window;
    }
    if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) {
      return node;
    }
    if (typeof Document !== 'undefined' && node instanceof Document) {
      return window;
    }
    return null;
  }

  /** 绑定滚动与 resize 监听，并立刻测一次，避免首帧停在错误状态。 */
  private bind(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.unbind();
    const container = this.resolveContainer();
    this.scrollContainer = container;
    this.boundContainer = this.container();
    (container ?? window).addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    this.bound = true;
    this.measure();
  }

  /** 移除监听并取消挂起的测量帧。 */
  private unbind(): void {
    if (this.frame !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    if (!this.bound) {
      return;
    }
    (this.scrollContainer ?? window).removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.bound = false;
    this.scrollContainer = null;
  }

  /** `ngOnDestroy` 用：解绑并把吸附状态复位，避免复用的 DOM 留下内联样式。 */
  private teardown(): void {
    this.unbind();
    this.affixed.set(false);
    this.lastAffixed = false;
  }

  /** 把滚动事件合并到下一帧测量（上游的 ticking + requestAnimationFrame）。 */
  private scheduleMeasure(): void {
    if (typeof requestAnimationFrame === 'undefined' || this.frame !== null) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.measure();
    });
  }

  /** 与上游 handleScroll 的计算逐行对齐：先顶部、再底部，都不命中就取消吸附。 */
  private measure(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const wrap = this.hostEl.nativeElement;
    const rect = wrap.getBoundingClientRect();
    const container = this.scrollContainer;
    const containerEl = typeof HTMLElement !== 'undefined' && container instanceof HTMLElement ? container : null;
    const containerTop = containerEl ? containerEl.getBoundingClientRect().top : 0;
    const containerHeight = (containerEl ? containerEl.clientHeight : window.innerHeight) - rect.height;

    const offsetTop = this.offsetTop();
    const offsetBottom = this.offsetBottom();
    const calcTop = rect.top - containerTop;
    const calcBottom = containerTop + containerHeight - (offsetBottom ?? 0);

    let next: number | null;
    if (offsetTop !== null && calcTop <= offsetTop) {
      next = containerTop + offsetTop;
    } else if (offsetBottom !== null && rect.top >= calcBottom) {
      next = calcBottom;
    } else {
      next = null;
    }

    if (next === null) {
      this.fixedTop.set(0);
      this.affixed.set(false);
      // 未吸附时上游的 top 是 Number(false)，也就是 0。
      this.emitFixedChange(false, 0);
      return;
    }

    this.wrapWidth.set(rect.width);
    this.wrapHeight.set(rect.height);
    this.fixedTop.set(next);
    this.affixed.set(true);
    this.emitFixedChange(true, next);
  }

  /** 只在吸附状态翻转时派发，避免滚动过程中反复通知同一个值。 */
  private emitFixedChange(affixed: boolean, top: number): void {
    if (affixed === this.lastAffixed) {
      return;
    }
    this.lastAffixed = affixed;
    this.fixedChange.emit({ affixed, top });
  }
}
