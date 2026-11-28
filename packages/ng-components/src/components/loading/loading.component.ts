import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ApplicationRef,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { LOADING_SIZES, LoadingSize, LoadingContent, LoadingAttachNode } from './loading.types';
import { isTemplateContent } from '../../_utils/content';

const SIZE_CLASS: Record<string, string> = {
  small: 't-size-s',
  medium: 't-size-m',
  large: 't-size-l',
};

/** 每个实例只释放自己的锁；行内 Loading 的销毁不应影响其他全屏加载。 */
const scrollLocks = new WeakMap<Document, { count: number; originallyLocked: boolean }>();
const parentLocks = new WeakMap<HTMLElement, { count: number; original: boolean }>();

/**
 * 加载状态。
 *
 * ```html
 * <t-loading [loading]="true" text="加载中" />
 * <t-loading [loading]="true" [fullscreen]="true" text="正在保存" />
 * ```
 */
@Component({
  selector: 't-loading',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
})
export class TLoading {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly projected = viewChild<ElementRef<HTMLElement>>('projected');
  protected readonly overlayTemplate = viewChild.required<TemplateRef<unknown>>('overlayTemplate');
  private outlet: DomPortalOutlet | null = null;
  private outletHost: HTMLElement | null = null;
  private attachedTarget: HTMLElement | null = null;
  private releaseParent?: () => void;
  private destroyed = false;
  private readonly hasProjected = signal(false);
  protected readonly hasContent = computed(() => this.content() !== undefined || this.hasProjected());
  protected readonly target = signal<HTMLElement | null>(null);
  protected readonly isTemplateContent = isTemplateContent;
  protected readonly customIndicator = computed<LoadingContent>(() => {
    const indicator = this.indicator(); return typeof indicator === 'boolean' ? undefined : indicator;
  });
  protected readonly customSize = computed(() => SIZE_CLASS[this.size()] ? null : this.size());

  /** @zh 包裹的业务内容，字符串或模板，优先于默认投影 @en Wrapped text or template, takes precedence over projection @defaultValue undefined */
  readonly content = input<LoadingContent>(undefined);
  /** @zh 加载图标，true 为默认、false 隐藏，也支持文本或模板 @en Indicator, true for built-in, false to hide, or text/template @defaultValue true */
  readonly indicator = input<boolean | LoadingContent>(true);
  /** @zh 挂载节点、选择器或函数，仅无包裹内容或全屏时生效 @en Attachment element, selector or resolver, used without wrapped content or in fullscreen mode @defaultValue undefined */
  readonly attach = input<LoadingAttachNode>(undefined);

  /** @zh 是否处于加载状态 @en Whether it is loading @defaultValue true */
  readonly loading = input(true, { transform: booleanAttribute });

  /** @zh 加载提示文字 @en Loading text @defaultValue undefined */
  readonly text = input<LoadingContent>();

  /** @zh 图标尺寸，支持预设或 CSS 尺寸 @en Icon size, preset or CSS length @defaultValue 'medium' @values small, medium, large */
  readonly size = input<LoadingSize>('medium');

  /** @zh 是否全屏 @en Whether to show full screen @defaultValue false */
  readonly fullscreen = input(false, { transform: booleanAttribute });

  /** @zh 是否显示全屏、包裹或挂载模式的遮罩 @en Whether to show a mask in fullscreen, wrapped or attached mode @defaultValue true */
  readonly showOverlay = input(true, { transform: booleanAttribute });

  /** @zh 图标是否继承文字颜色 @en Whether the icon inherits the text color @defaultValue false */
  readonly inheritColor = input(false, { transform: booleanAttribute });

  /** @zh 延迟显示的毫秒数 @en Delay in milliseconds before showing @defaultValue 0 */
  readonly delay = input(0);

  /** @zh 是否禁止背景滚动，仅全屏时生效 @en Whether to prevent scrolling the page, only works in full screen @defaultValue true */
  readonly preventScrollThrough = input(true, { transform: booleanAttribute });

  /** @zh 层级 @en The z-index of the loading @defaultValue undefined */
  readonly zIndex = input<number | undefined>();

  private readonly delayed = signal(false);

  protected readonly sizes = LOADING_SIZES;

  protected readonly visible = computed(() => this.loading() && this.delayed());

  protected readonly baseClasses = computed(() =>
    ['t-loading--center', SIZE_CLASS[this.size()], this.inheritColor() ? 't-loading--inherit-color' : '']
      .filter(Boolean)
      .join(' '),
  );

  protected readonly normalClasses = computed(() => `${this.baseClasses()} t-loading`);
  protected readonly overlayClasses = computed(() => this.fullscreen() ? this.fullscreenClasses() : [this.normalClasses(),
    this.hasContent() || this.target() ? 't-loading--full' : '', (this.hasContent() || this.target()) && this.showOverlay() ? 't-loading__overlay' : ''].filter(Boolean).join(' '));

  protected readonly fullscreenClasses = computed(() =>
    [this.normalClasses(), 't-loading__fullscreen', this.showOverlay() ? 't-loading__overlay' : '']
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    afterRenderEffect((cleanup) => {
      const element = this.projected()?.nativeElement;
      if (!element) return;
      const measure = () => this.hasProjected.set(Array.from(element.childNodes).some(node => node.nodeType === 1 || node.nodeType === 3 && !!node.textContent?.trim()));
      untracked(measure);
      const observer = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(measure);
      observer?.observe(element, { childList: true, characterData: true, subtree: true });
      cleanup(() => observer?.disconnect());
    });
    afterRenderEffect(() => {
      this.attach(); this.fullscreen(); this.hasContent(); this.visible(); this.overlayTemplate();
      untracked(() => this.syncAttachment());
    });
    inject(DestroyRef).onDestroy(() => { this.destroyed = true; this.disposeAttachment(); });
    // delay：打开时先等待，关闭时立刻复位
    effect((onCleanup) => {
      const loading = this.loading();
      const delay = this.delay();
      if (!loading) {
        this.delayed.set(false);
        return;
      }
      if (!Number.isFinite(delay) || delay <= 0) {
        this.delayed.set(true);
        return;
      }
      this.delayed.set(false);
      const timer = setTimeout(() => this.delayed.set(true), delay);
      onCleanup(() => clearTimeout(timer));
    });

    // 全屏时锁住背景滚动（上游用的是 body 上的 t-loading--lock 类）
    effect((onCleanup) => {
      const shouldLock = this.fullscreen() && this.preventScrollThrough() && this.visible() && !!this.document.body;
      if (!shouldLock) return;
      const lock = scrollLocks.get(this.document) ?? {
        count: 0,
        originallyLocked: this.document.body.classList.contains('t-loading--lock'),
      };
      lock.count++;
      scrollLocks.set(this.document, lock);
      this.document.body.classList.add('t-loading--lock');
      onCleanup(() => {
        if (--lock.count > 0) return;
        if (!lock.originallyLocked) this.document.body.classList.remove('t-loading--lock');
        scrollLocks.delete(this.document);
      });
    });
  }

  /** 函数或选择器目标改变但输入引用不变时重新解析。 */
  update(): void { if (!this.destroyed) this.syncAttachment(); }

  private syncAttachment(): void {
    let target: HTMLElement | null = null;
    if (this.visible() && (this.fullscreen() || !this.hasContent())) {
      const source = this.attach(), value = typeof source === 'function' ? source() : source;
      if (typeof value === 'string') { try { target = this.document.querySelector<HTMLElement>(value); } catch { /* fall back locally */ } }
      else if (value?.nodeType === 1) target = value;
      if (!target?.isConnected || target.ownerDocument !== this.document || this.host.nativeElement.contains(target) || this.outletHost?.contains(target)) target = null;
    }
    if (target !== this.attachedTarget) {
      this.disposeAttachment(); this.attachedTarget = target;
      if (target) {
        this.outletHost = this.document.createElement('span');
        this.outletHost.style.display = 'contents'; this.outletHost.setAttribute('data-t-loading-attachment', '');
        target.appendChild(this.outletHost);
        this.outlet = new DomPortalOutlet(this.outletHost, null, this.appRef, this.injector);
        this.outlet.attach(new TemplatePortal(this.overlayTemplate(), this.viewContainer));
      }
    }
    this.target.set(target);
    this.releaseParent?.(); this.releaseParent = undefined;
    if (target && !this.fullscreen() && (target.ownerDocument.defaultView?.getComputedStyle(target).position === 'static' || parentLocks.has(target))) {
      const parent = target;
      const lock = parentLocks.get(parent) ?? { count: 0, original: parent.classList.contains('t-loading__parent--relative') };
      lock.count++; parentLocks.set(parent, lock); parent.classList.add('t-loading__parent--relative');
      this.releaseParent = () => { if (--lock.count) return; if (!lock.original) parent.classList.remove('t-loading__parent--relative'); parentLocks.delete(parent); };
    }
  }

  private disposeAttachment(): void {
    this.outlet?.dispose(); this.outlet = null;
    this.outletHost?.remove(); this.outletHost = null;
    this.releaseParent?.(); this.releaseParent = undefined;
    this.attachedTarget = null;
  }
}
