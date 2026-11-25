import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import type { Content } from '../../_utils/content';

/** 回到顶部的形状。 */
export const BACK_TOP_SHAPES = ['circle', 'square'] as const;
export type BackTopShape = (typeof BACK_TOP_SHAPES)[number];

/** 回到顶部的尺寸。 */
export const BACK_TOP_SIZES = ['medium', 'small'] as const;
export type BackTopSize = (typeof BACK_TOP_SIZES)[number];

/** 回到顶部的主题。 */
export const BACK_TOP_THEMES = ['light', 'primary', 'dark'] as const;
export type BackTopTheme = (typeof BACK_TOP_THEMES)[number];

/** 回到顶部的内容：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type BackTopContent = Content;

/**
 * 挂载节点，与上游 `AttachNode` 对齐：CSS 选择器、DOM 元素，或返回它们的函数。
 * `'body'` 视作文档本身（滚动 `document.documentElement`）。
 */
export type BackTopAttachNode =
  | string
  | HTMLElement
  | null
  | undefined
  | (() => string | HTMLElement | null | undefined);

/** 平滑滚动的缓动函数：与上游滚动动画一致的三次缓出。 */
function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

/**
 * 回到顶部。
 *
 * 结构与上游一致：宿主只是一个无类名的容器，真正的按钮是内部的原生 `<button type="button">`，
 * 类名与位置样式全部照上游拼装 —— `t-back-top`、`t-back-top--theme-{theme}`、
 * `t-back-top--{shape}`、`t-back-top--show`、`t-size-{s|m}`，
 * 位置用 `inset-inline-end` / `inset-block-end` 内联（对应上游的 `offset[0]` / `offset[1]`）。
 * 样式的唯一定义处是 `vendor/tdesign-common/style/web/components/back-top/_index.less`。
 *
 * 显隐由 `visibleHeight` 阈值决定：滚动距离大于等于阈值时加 `t-back-top--show`；
 * 阈值等于 0 时恒显示（上游同样在挂载阶段直接置为可见）。
 * 点击后按 `duration` 用 `requestAnimationFrame` 做缓出滚动，滚动容器由 `container` 解析，
 * 回滚目标由 `target` 解析（`target` 与 `container` 相同或为 `'body'` 时回到 0）。
 *
 * 不额外提供 `(click)` 输出：内部按钮的原生 click 会冒泡到宿主，
 * 使用方直接写 `(click)` 即可，参数是原生 `MouseEvent`。
 */
@Component({
  selector: 't-back-top',
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

    <button type="button" [class]="buttonClasses()" [style]="positionStyle()" (click)="handleClick()">
      @if (content()) {
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: content() }" />
      } @else {
        <!-- 默认内容：上游的 BacktopIcon(size=24) + .t-back-top__text，尺寸与颜色由 vendor less 决定。 -->
        <ng-content>
          <svg
            class="t-icon t-icon-backtop t-back-top__icon"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M17.5 14.5L12 9L6.5 14.5M5 5H19M12 10.25V20"
              stroke="currentColor"
              stroke-linecap="square"
              stroke-width="2"
            />
          </svg>
          <span class="t-back-top__text">TOP</span>
        </ng-content>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // 宿主只包住那个 position: fixed 的按钮，本身不承载样式；`bridge.less` 用 display: contents
    // 让宿主不在文档流里占位，因此这里的类名固定为空。
    '[class]': 'classes()',
  },
})
export class TBackTop implements OnInit, OnDestroy {
  /**
   * 监听滚动的容器，`'body'` 表示整个文档，也可以传选择器、元素或返回它们的函数。
   * @zh 监听滚动的容器 @en scroll container @defaultValue body
   */
  readonly container = input<BackTopAttachNode>('body');

  /**
   * 内容，未设置时使用默认图标 + `TOP` 文案，投影内容优先于默认内容。
   * @zh 内容 @en content
   */
  readonly content = input<BackTopContent>(undefined);

  /**
   * 回到顶部的滚动时长（毫秒），`0` 表示直接跳转。
   * @zh 滚动时长 @en scroll duration @defaultValue 200
   */
  readonly duration = input(200, { transform: numberAttribute });

  /**
   * 距离右侧与底部的偏移，依次为 `[水平, 垂直]`，数字按 px 处理。
   * @zh 偏移 @en offset @defaultValue ['24px','80px']
   */
  readonly offset = input<Array<string | number>>(['24px', '80px']);

  /**
   * 形状。
   * @zh 形状 @en shape @defaultValue square @values circle,square
   */
  readonly shape = input<BackTopShape>('square');

  /**
   * 尺寸。
   * @zh 尺寸 @en size @defaultValue medium @values medium,small
   */
  readonly size = input<BackTopSize>('medium');

  /**
   * 回滚的目标元素，默认滚到文档顶部；传元素时滚到该元素的位置。
   * @zh 回滚目标 @en scroll target @defaultValue body
   */
  readonly target = input<BackTopAttachNode>('body');

  /**
   * 主题。
   * @zh 主题 @en theme @defaultValue light @values light,primary,dark
   */
  readonly theme = input<BackTopTheme>('light');

  /**
   * 显示回到顶部的滚动距离阈值，带 `px` 的字符串或数字，`0` 表示始终显示。
   * @zh 显示阈值 @en visible height @defaultValue 200px
   */
  readonly visibleHeight = input<string | number>('200px');

  private readonly destroyRef = inject(DestroyRef);

  /** 是否显示（滚过阈值后加 `t-back-top--show`）。 */
  private readonly visible = signal(false);

  /** 绑定 scroll 的目标：文档时用 window，元素时用元素本身。 */
  private scrollHost: HTMLElement | Window | null = null;

  /** 绑定时的容器入参值，用于区分「容器换了」与「阈值变了」。 */
  private boundContainer: BackTopAttachNode = null;

  private bound = false;

  /** 平滑滚动的动画帧。 */
  private frame: number | null = null;

  private readonly onScroll = () => this.updateVisible();

  constructor() {
    this.destroyRef.onDestroy(() => this.teardown());

    // 容器换了要重新绑定，阈值变了要立刻重算显隐，不必等下一次滚动。
    effect(() => {
      const container = this.container();
      this.visibleHeight();
      if (!this.bound) {
        return;
      }
      if (container !== this.boundContainer) {
        this.bind();
      } else {
        this.updateVisible();
      }
    });
  }

  /** 宿主的类名固定为空，宿主只做包裹，样式全在内部按钮上。 */
  protected readonly classes = computed(() => '');

  /** 按钮类名，顺序与上游一致：基础类、主题、形状、显示态、尺寸。 */
  protected readonly buttonClasses = computed(() => {
    const classes = ['t-back-top', `t-back-top--theme-${this.theme()}`, `t-back-top--${this.shape()}`];
    if (this.visible()) {
      classes.push('t-back-top--show');
    }
    classes.push(this.size() === 'small' ? 't-size-s' : 't-size-m');
    return classes.join(' ');
  });

  /** 位置样式，对应上游的 `insetInlineEnd: offset[0]` / `insetBlockEnd: offset[1]`。 */
  protected readonly positionStyle = computed<Record<string, string>>(() => {
    const offset = this.offset() ?? [];
    return {
      'inset-inline-end': this.offsetValue(offset[0], '24px'),
      'inset-block-end': this.offsetValue(offset[1], '80px'),
    };
  });

  /** 阈值（px）：字符串去掉 `px` 后转数字，与上游的解析方式一致。 */
  private readonly threshold = computed(() => {
    const value = this.visibleHeight();
    const parsed = typeof value === 'number' ? value : Number(String(value).replace('px', '').trim());
    return Number.isNaN(parsed) ? 0 : parsed;
  });

  ngOnInit(): void {
    this.bind();
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: BackTopContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 按钮点击：先按 `target` 算出目标位置，再做 `duration` 时长的缓出滚动（原生 click 继续冒泡）。 */
  protected handleClick(): void {
    this.animateTo(this.getBackTo());
  }

  /** 偏移量归一化：数字补 `px`，字符串原样使用，缺省回落到默认值。 */
  private offsetValue(value: string | number | undefined, fallback: string): string {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    return typeof value === 'number' ? `${value}px` : String(value);
  }

  /** 解析挂载节点：字符串走 `'body'` 特判 + querySelector，函数取返回值，元素直接用。 */
  private resolveAttachNode(node: BackTopAttachNode): HTMLElement | Document | null {
    if (typeof window === 'undefined' || node === null || node === undefined) {
      return null;
    }
    const value: unknown = typeof node === 'function' ? node() : node;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (typeof value === 'string') {
      if (value === 'body' || value === 'html' || value === 'window') {
        return document;
      }
      return document.querySelector<HTMLElement>(value) ?? document;
    }
    if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
      return value;
    }
    if (typeof Document !== 'undefined' && value instanceof Document) {
      return document;
    }
    return null;
  }

  /** 绑定滚动监听并立刻算一次显隐。 */
  private bind(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.unbind();
    const container = this.resolveAttachNode(this.container());
    this.scrollHost = container instanceof HTMLElement ? container : window;
    this.boundContainer = this.container();
    this.scrollHost.addEventListener('scroll', this.onScroll, { passive: true });
    this.bound = true;
    this.updateVisible();
  }

  /** 解绑滚动监听并取消未完成的滚动动画。 */
  private unbind(): void {
    this.cancelAnimation();
    if (!this.bound) {
      return;
    }
    this.scrollHost?.removeEventListener('scroll', this.onScroll);
    this.scrollHost = null;
    this.bound = false;
  }

  /** `ngOnDestroy` 用：解绑并复位显隐。 */
  private teardown(): void {
    this.unbind();
    this.visible.set(false);
  }

  /** 阈值等于 0 时恒显示，否则按滚动距离与阈值比较（上游用同一套判断）。 */
  private updateVisible(): void {
    const threshold = this.threshold();
    if (threshold === 0) {
      this.visible.set(true);
      return;
    }
    this.visible.set(this.getScrollTop() >= threshold);
  }

  /** 当前滚动距离：元素容器读 `scrollTop`，文档读 window / documentElement。 */
  private getScrollTop(): number {
    if (typeof window === 'undefined') {
      return 0;
    }
    const host = this.scrollHost;
    if (host instanceof HTMLElement) {
      return host.scrollTop;
    }
    return window.scrollY ?? document.documentElement.scrollTop ?? 0;
  }

  /** 写入滚动距离：元素容器写 `scrollTop`，文档走 `window.scrollTo`。 */
  private setScrollTop(top: number): void {
    if (typeof window === 'undefined') {
      return;
    }
    const host = this.scrollHost;
    if (host instanceof HTMLElement) {
      host.scrollTop = top;
      return;
    }
    window.scrollTo(0, top);
  }

  /** 回滚目标：`target` 与 `container` 相同、为 `'body'` 或解析不到元素时回到 0，否则对齐到该元素顶部。 */
  private getBackTo(): number {
    const target = this.target();
    if (!target) {
      return 0;
    }
    if (target === this.container() || target === 'body') {
      return 0;
    }
    const node = this.resolveAttachNode(target);
    if (!node || !(node instanceof HTMLElement)) {
      return 0;
    }
    const host = this.scrollHost;
    const top = node.getBoundingClientRect().top;
    if (host instanceof HTMLElement) {
      return host.scrollTop + top - host.getBoundingClientRect().top;
    }
    return this.getScrollTop() + top;
  }

  /** 用 `requestAnimationFrame` 做缓出滚动，`duration` 为 0 时直接跳转。 */
  private animateTo(end: number): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.cancelAnimation();
    const start = this.getScrollTop();
    const distance = end - start;
    const duration = Math.max(0, this.duration() || 0);
    if (duration === 0 || distance === 0) {
      this.setScrollTop(end);
      return;
    }
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      this.setScrollTop(start + distance * easeOutCubic(progress));
      if (progress < 1) {
        this.frame = requestAnimationFrame(step);
      } else {
        this.frame = null;
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  /** 取消未完成的滚动动画。 */
  private cancelAnimation(): void {
    if (this.frame !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }
}
