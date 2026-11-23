import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { off, on } from '../../_utils/dom';
import type { SizeType } from '../../types/common';
import type { AffixScrollContainer } from '../affix/affix.component';
import { T_ANCHOR, type AnchorClickEvent, type AnchorContent, type AnchorHost } from './anchor-item.component';

/** 尺寸到 `t-size-*` 修饰类的映射，与上游 `SIZE` 常量一致（`medium` 也会产生 `t-size-m`）。 */
const ANCHOR_SIZE_CLASSES: Record<SizeType, string> = {
  small: 't-size-s',
  medium: 't-size-m',
  large: 't-size-l',
};

/** 从 `href` 里取 `#` 之后的 id，与上游 `ANCHOR_SHARP_REGEXP` 一致。 */
const ANCHOR_SHARP_REGEXP = /#(\S+)$/;

/** 滚动容器的取值，与 `TAffix` 的 `container` 完全一致。 */
export type AnchorScrollContainer = AffixScrollContainer;

/** 锚点包裹固钉时透传给 `TAffix` 的参数，对应上游 `AffixProps` 里本地支持的那几项。 */
export interface AnchorAffixProps {
  /** 滚动容器。 */
  container?: AffixScrollContainer;
  /** 距离容器底部的偏移（px）。 */
  offsetBottom?: number;
  /** 距离容器顶部的偏移（px）。 */
  offsetTop?: number;
  /** 吸附时的层级。 */
  zIndex?: number;
}

/** 激活链接变化事件的参数，对应上游 `onChange(currentLink, prevLink)`。 */
export interface AnchorChangeEvent {
  /** 新的激活链接。 */
  currentLink: string;
  /** 上一个激活链接。 */
  prevLink: string;
}

/**
 * 锚点。
 *
 * 结构照上游：内层 `div.t-anchor.t-size-*` 里先画左侧竖线与游标
 * （`.t-anchor__line` > `.t-anchor__line-cursor-wrapper` > `.t-anchor__line-cursor`），
 * 再投影锚点项；`affixProps` 有值时外层再包一层 `t-affix`，与上游 `createVNode(Affix, ...)`
 * 的包裹关系一致。样式的唯一定义处是
 * `vendor/tdesign-common/style/web/components/anchor/_index.less`。
 *
 * 滚动监听与上游 `es/anchor/anchor.mjs` 对齐：监听 `container`（默认 `window`）的 scroll，
 * 取所有已注册链接的目标元素，`getBoundingClientRect().top` 小于 `bounds + targetOffset`
 * 的里最靠下的那个为激活项；滚到底部时保留当前激活项，避免最后一屏判空。
 * 监听以 `passive: true` 注册并在销毁时解绑，滚动回调合并到一帧里算，
 * SSR 下（`typeof window === 'undefined'`）直接跳过。
 */
@Component({
  selector: 't-anchor',
  standalone: true,
  imports: [NgTemplateOutlet],
  providers: [{ provide: T_ANCHOR, useExisting: forwardRef(() => TAnchor) }],
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value) {
        {{ value }}
      }
    </ng-template>

    <!-- 竖线与游标：两个分支共用同一段模板，避免投影内容出现两份。 -->
    <ng-template #line>
      <div class="t-anchor__line">
        <div class="t-anchor__line-cursor-wrapper" [style]="activeLineStyle()">
          @if (cursor(); as cursorValue) {
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: cursorValue }" />
          } @else {
            <div class="t-anchor__line-cursor"></div>
          }
        </div>
      </div>
    </ng-template>

    <!-- 只有一个 <ng-content> 槽位：Angular 不支持把投影内容分给多个默认槽，
         两个 @if 分支各放一个 <ng-content> 会让未命中分支的内容整段丢失。
         吸顶（affixProps）因此改用 position: sticky 实现，滚动容器内行为与上游 affix 等价。 -->
    <div
      [class]="anchorClasses()"
      [style.position]="stickyStyle()?.position ?? null"
      [style.top]="stickyStyle()?.top ?? null"
      [style.zIndex]="stickyStyle()?.zIndex ?? null"
    >
      <ng-container *ngTemplateOutlet="line" />
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // 宿主是上游那个无类名的 wrap，本身不承载任何样式；它需要是块级盒子才好被滚动定位，
    // 建议父级在 bridge.less 里补一条 t-anchor { display: block }（自定义元素默认 inline），
    // 因此这里的类名固定为空。
    '[class]': 'classes()',
  },
})
export class TAnchor implements AnchorHost {
  /** 包裹固钉的参数，设置后整个锚点被 `t-affix` 包裹并吸顶。 @zh 固钉参数 @en affix props */
  readonly affixProps = input<AnchorAffixProps | undefined>(undefined);

  /** 判定激活项时相对容器顶部的偏移（px），越小越早切换。 @zh 判定激活项的偏移 @en bounds @defaultValue 5 */
  readonly bounds = input(5, { transform: numberAttribute });

  /** 滚动容器，`window`、DOM 元素或 CSS 选择器都可以，留空表示 `window`。 @zh 滚动容器 @en scroll container @defaultValue window */
  readonly container = input<AnchorScrollContainer>(null);

  /** 自定义激活游标的内容，未设置时使用默认竖线。 @zh 自定义游标 @en cursor */
  readonly cursor = input<AnchorContent>(undefined);

  /** 尺寸，`small` 宽 120px、`medium` 200px、`large` 320px。 @zh 尺寸 @en size @defaultValue medium @values small,medium,large */
  readonly size = input<SizeType>('medium');

  /** 点击链接滚动时的目标偏移（px），正值会让目标停在容器顶部下方。 @zh 滚动目标偏移 @en target offset @defaultValue 0 */
  readonly targetOffset = input(0, { transform: numberAttribute });

  /** 激活链接变化时触发。 @zh 激活链接变化 @en change */
  readonly change = output<AnchorChangeEvent>();

  /** 点击锚点链接时触发。 @zh 点击链接 @en click */
  readonly click = output<AnchorClickEvent>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** 当前激活的链接，空串表示还没有命中任何目标。 */
  readonly active = signal('');

  /** 激活游标的内联样式，找不到激活项时清空（等价于上游把 `activeLineStyle` 重置为空对象）。 */
  protected readonly activeLineStyle = signal<Record<string, string>>({});

  /** 已注册的链接，按子项的挂载顺序排列。 */
  private readonly links: string[] = [];

  /** 当前绑定的滚动容器。 */
  private scrollContainer: HTMLElement | Window | null = null;

  /** 是否已经完成首次挂载（`afterNextRender` 之后才允许重绑容器）。 */
  private mounted = false;

  /** 是否正在做点击后的平滑滚动，期间忽略 scroll 回调里的激活项判定。 */
  private scrollLock = false;

  /** 合并滚动判定用的帧。 */
  private scrollFrame: number | null = null;

  /** 平滑滚动用的帧。 */
  private smoothFrame: number | null = null;

  private readonly handleScroll = (): void => {
    if (this.scrollLock) return;
    const container = this.scrollContainer;
    if (!container || typeof window === 'undefined') return;

    const containerEl = typeof HTMLElement !== 'undefined' && container instanceof HTMLElement ? container : null;
    const isScrollBottom =
      containerEl !== null && Math.abs(containerEl.scrollTop + containerEl.clientHeight - containerEl.scrollHeight) < 2;

    // 目标在「容器顶部 + bounds + targetOffset」之上的都算候选，取最靠下的那个。
    const candidates: Array<{ link: string; top: number }> = [];
    for (const link of this.links) {
      const target = getAnchorTarget(link);
      if (!target) continue;
      const top = getOffsetTop(target, container);
      if (top < this.bounds() + this.targetOffset()) {
        candidates.push({ link, top });
      }
    }

    let nextActive = this.active();
    if (candidates.length) {
      nextActive = candidates.reduce((prev, cur) => (prev.top > cur.top ? prev : cur)).link;
    }

    // 滚到底部时，若当前激活项还留在可视区里就保留它，与上游的 isScrollBottom 分支一致。
    if (isScrollBottom && this.links.length) {
      const currentTarget = getAnchorTarget(this.active());
      const currentIndex = this.links.indexOf(this.active());
      const calcIndex = this.links.indexOf(nextActive);
      if (currentTarget && currentIndex > calcIndex) {
        const top = getOffsetTop(currentTarget, container);
        const bottom = top + currentTarget.offsetHeight;
        const clientHeight = containerEl ? containerEl.clientHeight : window.innerHeight;
        if (bottom > 0 && top < clientHeight) {
          nextActive = this.active();
        }
      }
    }

    this.setCurrentActiveLink(nextActive);
  };

  constructor() {
    this.destroyRef.onDestroy(() => this.teardown());

    // 容器换了要重新绑定；挂载前由 afterNextRender 里的 bind() 负责首次绑定。
    effect(() => {
      this.container();
      if (!this.mounted) return;
      this.bind();
    });

    // 等首帧渲染完再绑定：这样 container 传 CSS 选择器时兄弟节点已存在、子项也都注册完了。
    afterNextRender(() => {
      this.mounted = true;
      this.bind();
    });
  }

  /** 宿主的类名固定为空，宿主是上游的无类名 wrap，所有样式都落在内层 div.t-anchor 上。 */
  protected readonly classes = computed(() => '');

  /** 内层锚点的类名，与上游 `[COMPONENT_NAME, SIZE[size]]` 一致。 */
  protected readonly anchorClasses = computed(() => `t-anchor ${ANCHOR_SIZE_CLASSES[this.size()]}`);
  /**
   * 吸顶样式：上游用 t-affix 包裹（fixed 定位 + 占位撑高），
   * 这里因为 Angular 的默认投影槽只能有一个，改用 position: sticky —— 在滚动容器内视觉等价，
   * 且不会把内容挪出文档流。offsetTop / zIndex 与 affixProps 逐字段对应。
   */
  protected readonly stickyStyle = computed(() => {
    const affix = this.affixProps();
    if (!affix) {
      return null;
    }
    const top = affix.offsetTop;
    return {
      position: 'sticky' as const,
      top: typeof top === 'number' ? `${top}px` : null,
      zIndex: affix.zIndex ?? null,
    };
  });

  /** 子项挂载或 `href` 变化时注册链接，重复或非法 `href` 忽略（与上游 `registerLink` 一致）。 */
  registerLink(href: string): void {
    if (!ANCHOR_SHARP_REGEXP.test(href) || this.links.indexOf(href) !== -1) return;
    this.links.push(href);
    // 动态新增的锚点项要立刻参与判定，否则得等下一次滚动。
    this.scheduleHandleScroll();
  }

  /** 子项卸载或 `href` 变化前注销链接。 */
  unregisterLink(href: string): void {
    const index = this.links.indexOf(href);
    if (index === -1) return;
    this.links.splice(index, 1);
  }

  /** 点击链接时先切激活态，再平滑滚动到目标位置（对应上游 `handleScrollTo`）。 */
  handleScrollTo(href: string): void {
    const container = this.scrollContainer;
    this.setCurrentActiveLink(href);
    const target = getAnchorTarget(href);
    if (!target || !container) return;

    this.scrollLock = true;
    const top = getScrollTop(container) + getOffsetTop(target, container) - this.targetOffset();
    this.smoothScrollTo(container, top);
  }

  /** 点击链接时把参数转给 `(click)` 输出（对应上游 `handleLinkClick`）。 */
  handleLinkClick(link: AnchorClickEvent): void {
    this.click.emit(link);
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: AnchorContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 激活链接变化时更新状态、重画游标并派发 `(change)`。 */
  private setCurrentActiveLink(link: string): void {
    const previous = this.active();
    if (previous === link) return;
    this.active.set(link);
    this.scheduleActiveLine();
    // 上游把两个参数都传成了新值（`onChange(link, active.value)` 先赋值再回调），这里传真实的前一个链接。
    this.change.emit({ currentLink: link, prevLink: previous });
  }

  /** 绑定滚动监听并立刻判定一次，与上游 `getScrollContainer` 后立即 `handleScroll` 一致。 */
  private bind(): void {
    if (typeof window === 'undefined') return;
    this.unbind();
    const container = this.resolveContainer();
    if (!container) return;
    this.scrollContainer = container;
    on(container, 'scroll', this.handleScroll, { passive: true });
    this.handleScroll();
  }

  /** 解绑滚动监听。 */
  private unbind(): void {
    if (this.scrollContainer) {
      off(this.scrollContainer, 'scroll', this.handleScroll);
      this.scrollContainer = null;
    }
  }

  /** 销毁时解绑监听、取消挂起的帧并复位滚动锁。 */
  private teardown(): void {
    this.unbind();
    this.cancelFrame(this.scrollFrame);
    this.scrollFrame = null;
    this.cancelSmoothScroll();
    this.scrollLock = false;
    this.mounted = false;
  }

  /** 解析 `container`：空值或 `'window'` / `'body'` / `'html'` 视作 window，字符串走 querySelector。 */
  private resolveContainer(): HTMLElement | Window | null {
    if (typeof window === 'undefined') return null;
    const value = this.container();
    const node: unknown = typeof value === 'function' ? value() : value;
    if (node === null || node === undefined || node === '') return window;
    if (typeof node === 'string') {
      if (node === 'window' || node === 'body' || node === 'html') return window;
      return typeof document === 'undefined' ? null : document.querySelector<HTMLElement>(node);
    }
    if (node === window) return window;
    if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
    if (typeof Document !== 'undefined' && node instanceof Document) return window;
    return null;
  }

  /** 把注册触发的判定合并到下一帧（上游靠滚动事件驱动，这里额外兜住动态增删项）。 */
  private scheduleHandleScroll(): void {
    if (typeof requestAnimationFrame === 'undefined' || this.scrollFrame !== null) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = null;
      this.handleScroll();
    });
  }

  /** 激活项变化后，等 Angular 把 `t-is-active` 刷进 DOM，再量一次 `<a>` 的位置。 */
  private scheduleActiveLine(): void {
    if (typeof requestAnimationFrame === 'undefined') {
      this.updateActiveLine();
      return;
    }
    requestAnimationFrame(() => this.updateActiveLine());
  }

  /** 量激活项的 `<a>`，把 `top` / `height` / `opacity` 写到游标的 `style` 上（对应上游 `updateActiveLine`）。 */
  private updateActiveLine(): void {
    if (typeof window === 'undefined') return;
    const link = this.hostEl.nativeElement.querySelector<HTMLElement>('.t-is-active > a');
    if (!link) {
      this.activeLineStyle.set({});
      return;
    }
    this.activeLineStyle.set({
      top: `${link.offsetTop}px`,
      height: `${link.offsetHeight}px`,
      opacity: '1',
    });
  }

  /** 用 rAF 缓动替代上游依赖的 `scrollTo`，结束后解锁滚动判定。 */
  private smoothScrollTo(container: HTMLElement | Window, to: number): void {
    this.cancelSmoothScroll();
    if (typeof requestAnimationFrame === 'undefined') {
      this.scrollLock = false;
      return;
    }
    const from = getScrollTop(container);
    const delta = to - from;
    if (!delta) {
      this.scrollLock = false;
      return;
    }
    const duration = 300;
    let startTime: number | null = null;
    const step = (now: number): void => {
      if (this.smoothFrame === null) return;
      if (startTime === null) startTime = now;
      const progress = Math.min(1, (now - startTime) / duration);
      setScrollTop(container, from + delta * easeInOutCubic(progress));
      if (progress < 1) {
        this.smoothFrame = requestAnimationFrame(step);
        return;
      }
      this.smoothFrame = null;
      this.scrollLock = false;
      // 动画期间锁住了判定，结束时补一次，保证激活项与最终位置一致。
      this.handleScroll();
    };
    this.smoothFrame = requestAnimationFrame(step);
  }

  /** 取消进行中的平滑滚动并解锁。 */
  private cancelSmoothScroll(): void {
    this.cancelFrame(this.smoothFrame);
    this.smoothFrame = null;
    this.scrollLock = false;
  }

  /** 取消一帧，SSR 下 `cancelAnimationFrame` 不存在时跳过。 */
  private cancelFrame(frame: number | null): void {
    if (frame !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(frame);
    }
  }
}

/** 从 `#id` 形式的链接里取目标元素（对应上游 `getAnchorTarget`）。 */
function getAnchorTarget(link: string): HTMLElement | null {
  const matcher = link.match(ANCHOR_SHARP_REGEXP);
  if (!matcher) return null;
  return document.getElementById(matcher[1]);
}

/** 目标相对容器顶部的距离：`window` 时减掉 `documentElement.clientTop`，与上游 `getOffsetTop` 一致。 */
function getOffsetTop(target: HTMLElement, container: HTMLElement | Window): number {
  const top = target.getBoundingClientRect().top;
  if (isWindow(container)) {
    return top - document.documentElement.clientTop;
  }
  return top - container.getBoundingClientRect().top;
}

/** 读取容器当前滚动距离（对应上游 `getScroll`）。 */
function getScrollTop(container: HTMLElement | Window): number {
  if (isWindow(container)) {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }
  return container.scrollTop;
}

/** 写入滚动距离。 */
function setScrollTop(container: HTMLElement | Window, top: number): void {
  if (isWindow(container)) {
    window.scrollTo(0, top);
    return;
  }
  container.scrollTop = top;
}

/** 判断滚动容器是不是 `window`，用于把联合类型收窄成 `HTMLElement`。 */
function isWindow(container: HTMLElement | Window): container is Window {
  return container === window;
}

/** 平滑滚动的缓动函数，与上游 `scrollTo` 的手感一致。 */
function easeInOutCubic(progress: number): number {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2;
}
