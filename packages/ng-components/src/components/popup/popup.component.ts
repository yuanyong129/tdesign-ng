import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { isTemplateContent } from '../../_utils/content';
import { PopupAttachment } from './popup-attachment';
import { createControllableState } from '../../_utils/controllable-state';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { connectPopup, PopupConnector, resolveAnchor } from './popup-position';
import {
  POPUP_TRIGGERS,
  PopupPlacement,
  PopupTrigger,
  PopupVisibleChangeContext,
  PopupStyle,
  PopupStyleInput,
  PopupScrollEvent,
  PopupVisibleChangeEvent,
  PopupAttachNode,
  PopupTriggerElement,
  PopupPopperOptions,
} from './popup.types';

function classList(value: string | string[] | Record<string, boolean> | null | undefined): string[] {
  if (!value) return [];
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  if (Array.isArray(value)) return value.filter(Boolean);
  return Object.keys(value).filter((key) => value[key]);
}

/**
 * 弹出层。
 *
 * 默认投影的内容是触发器，弹层内容通过 `content`（纯文本）或 `[tPopupContent]`（任意模板）提供。
 */
@Component({
  selector: 't-popup',
  standalone: true,
  imports: [NgStyle, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './popup.component.html',
  host: {
    '(mouseenter)': 'handleHostEnter($event)',
    '(mouseleave)': 'handleHostLeave($event)',
    '(click)': 'handleHostClick($event)',
    '(focusin)': 'handleHostFocusIn($event)',
    '(focusout)': 'handleHostFocusOut($event)',
    '(mousedown)': 'handleHostMouseDown($event)',
    '(contextmenu)': 'handleHostContextMenu($event)',
  },
})
export class TPopup {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly renderer = inject(Renderer2);
  private readonly attachment = new PopupAttachment(this.hostRef.nativeElement.ownerDocument);
  private readonly customTrigger = viewChild<ElementRef<HTMLElement>>('customTrigger');
  protected readonly triggerTemplate = computed(() => {
    const trigger = this.triggerElement(); return isTemplateContent(trigger) ? trigger : null;
  });
  protected readonly externalTrigger = computed(() => typeof this.triggerElement() === 'string');
  private triggerNode: HTMLElement | null = null;
  private triggerCleanup: Array<() => void> = [];
  private movingAttachment = false;

  private readonly overlayTemplate = viewChild.required<TemplateRef<unknown>>('overlayTemplate');

  /** @zh 弹层内容（纯文本） @en Popup content as plain text @defaultValue undefined */
  readonly content = input<string | undefined>();
  /** @zh 挂载节点、选择器或返回节点的函数，缺省挂到 body 的 CDK 容器 @en Attachment element, selector, or resolver, defaults to the body CDK container @defaultValue undefined */
  readonly attach = input<PopupAttachNode>(undefined);
  /** @zh 外部触发元素选择器或替换默认触发区的模板 @en External trigger selector or a template replacing the default trigger @defaultValue undefined */
  readonly triggerElement = input<PopupTriggerElement | undefined>(undefined);
  /** @zh CDK 支持的位置覆盖、偏移、翻转和视口保护配置白名单 @en Supported placement, offset, flip and viewport overflow options @defaultValue undefined */
  readonly popperOptions = input<PopupPopperOptions | undefined>(undefined);

  /** @zh 弹层位置 @en The placement of the popup @defaultValue 'top' @values top, left, right, bottom, top-left, top-right, bottom-left, bottom-right, left-top, left-bottom, right-top, right-bottom */
  readonly placement = input<PopupPlacement>('top');

  /** @zh 触发方式 @en The trigger mode @defaultValue 'hover' @values hover, click, focus, mousedown, context-menu */
  readonly trigger = input<PopupTrigger>('hover');

  /** @zh 显示/隐藏的延迟毫秒数，数组形式为 [显示延迟, 隐藏延迟] @en Delay in milliseconds, an array means [show, hide] @defaultValue 0 */
  readonly delay = input<number | number[]>(0);

  /** @zh 是否禁用弹出 @en Whether the popup is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否显示箭头 @en Whether to show the arrow @defaultValue true */
  readonly showArrow = input(true, { transform: booleanAttribute });

  /** @zh 关闭时是否销毁弹层内容 @en Whether to destroy the popup content on close @defaultValue false */
  readonly destroyOnClose = input(false, { transform: booleanAttribute });

  /** @zh 内容为空时是否隐藏弹层 @en Whether to hide the popup when the content is empty @defaultValue false */
  readonly hideEmptyPopup = input(false, { transform: booleanAttribute });

  /** @zh 弹层根元素的附加类名 @en Extra class names of the popup root @defaultValue null */
  readonly overlayClassName = input<string | string[] | Record<string, boolean> | null>(null);

  /** @zh 弹层内容元素的附加类名 @en Extra class names of the popup content @defaultValue null */
  readonly overlayInnerClassName = input<string | string[] | Record<string, boolean> | null>(null);

  /**
   * @zh 点击该选择器匹配的元素时不视为「弹层外部」，用于弹层内嵌其它 CDK 弹层（如日期面板里的月份下拉）
   * @en Clicking elements matching this selector is not treated as outside; useful for popups nested in other overlays
   * @defaultValue undefined
   */
  readonly ignoreOutsideSelector = input<string | undefined>(undefined);

  /** @zh 受控的展开状态 @en Controlled visible state @defaultValue undefined */
  readonly visible = input<boolean | undefined>();

  /** @zh 默认展开状态，仅首次初始化读取 @en Default visibility, read only once @defaultValue false */
  readonly defaultVisible = input(false, { transform: booleanAttribute });
  /** @zh 弹层根节点样式或接收触发器及内容节点的样式函数 @en Root popup styles or a function receiving trigger and content elements @defaultValue undefined */
  readonly overlayStyle = input<PopupStyleInput | undefined>(undefined);
  /** @zh 弹层内容节点样式或样式函数 @en Content element styles or a style function @defaultValue undefined */
  readonly overlayInnerStyle = input<PopupStyleInput | undefined>(undefined);

  /** @zh 弹层层级 @en The z-index of the popup @defaultValue undefined */
  readonly zIndex = input<number | undefined>();

  /** @zh 展开状态变化，用于双向绑定 @en Visible change event, used for two-way binding */
  readonly visibleChange = output<boolean>();
  /** @zh 展开提案及其触发上下文 @en Visibility proposal and its trigger context */
  readonly visibleChangeContext = output<PopupVisibleChangeEvent>();
  /** @zh 内容节点滚动 @en Content element scroll */
  readonly scroll = output<PopupScrollEvent>();
  /** @zh 内容滚动到底，100ms 去抖 @en Content reached bottom, debounced by 100ms */
  readonly scrollToBottom = output<PopupScrollEvent>();

  /** @zh 点击弹层内容 @en Emitted when the popup content is clicked */
  readonly overlayClick = output<MouseEvent>();

  protected readonly innerVisible = signal(false);
  protected readonly popperPlacement = signal('top');
  protected readonly panelHidden = signal(false);
  protected readonly rootStyle = signal<PopupStyle>({});
  protected readonly innerStyle = signal<PopupStyle>({});
  private readonly state = createControllableState(this.visible, () => this.defaultVisible());
  private readonly ready = signal(false);
  private destroyed = false;
  private bottomTimer: ReturnType<typeof setTimeout> | null = null;

  private overlayRef: OverlayRef | null = null;
  private connector: PopupConnector | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private pointerInPanel = false;

  private readonly panelEnter = () => {
    this.pointerInPanel = true;
    this.clearHideTimer();
  };

  private readonly panelLeave = (event: MouseEvent) => {
    this.pointerInPanel = false;
    if (this.trigger() === 'hover') this.scheduleHide({ e: event, trigger: 'hover' });
  };
  private readonly panelFocusOut = (event: FocusEvent) => {
    if (this.movingAttachment) return;
    if (this.trigger() === 'focus' && !this.containsTarget(event.relatedTarget)) this.close({ e: event, trigger: 'focus' });
  };

  protected readonly popupClasses = computed(() =>
    [
      't-popup',
      ...classList(this.overlayClassName()),
      this.panelHidden() ? 't-popup--hidden' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly contentClasses = computed(() =>
    [
      't-popup__content',
      this.content() !== undefined ? 't-popup__content--text' : '',
      this.showArrow() ? 't-popup__content--arrow' : '',
      ...classList(this.overlayInnerClassName()),
    ]
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    afterRenderEffect(() => {
      this.triggerElement(); this.customTrigger();
      untracked(() => {
        this.bindTrigger();
        if (this.state.current() && this.ready() && !this.disabled()) this.renderOpen();
      });
    });
    afterNextRender(() => this.ready.set(true));
    effect(() => {
      const visible = this.state.current(), disabled = this.disabled(), ready = this.ready();
      untracked(() => {
        if (!ready) return;
        if (visible && !disabled) this.renderOpen();
        else this.renderClose();
      });
    });

    effect(() => {
      this.trigger(); this.delay();
      untracked(() => this.clearTimers());
    });

    effect(() => {
      this.overlayStyle(); this.overlayInnerStyle(); this.content(); this.hideEmptyPopup();
      untracked(() => { if (this.ready() && this.state.current() && !this.disabled()) this.renderOpen(); });
    });
    effect(() => {
      this.attach();
      untracked(() => {
        if (!this.overlayRef) return;
        this.mountOverlay();
        this.update();
      });
    });

    effect(() => {
      // 位置变化后同步更新定位策略，否则弹层还贴在旧位置
      this.placement();
      this.popperOptions();
      untracked(() => {
        if (!this.overlayRef) return;
        this.applyPosition();
        this.overlayRef.updatePosition();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.clearTimers();
      this.clearBottomTimer();
      this.unbindOutsideListeners();
      this.triggerCleanup.forEach((cleanup) => cleanup());
      this.triggerCleanup = [];
      this.overlayRef?.dispose();
      this.overlayRef = null;
      this.attachment.destroy();
    });
  }

  /** 展开弹层。 */
  show(): void {
    this.open({ trigger: 'api' });
  }

  /** 读取浮层实际展开状态，供受控复合组件在父级拒绝变更后恢复显示。 */
  isVisible(): boolean { return this.innerVisible(); }

  /** 收起弹层。 */
  hide(): void {
    this.close({ trigger: 'api' });
  }

  /** 当前弹层根节点；关闭保留模式仍可读取，未挂载或已销毁返回 null。 */
  getOverlay(): HTMLElement | null { return this.overlayRef?.overlayElement.querySelector('.t-popup') ?? null; }
  getOverlayState(): { hover: boolean } { return { hover: this.pointerInPanel }; }
  /** 更新样式函数和位置，可在异步内容改变后调用。 */
  update(): void {
    if (this.destroyed) return;
    this.bindTrigger();
    if (!this.innerVisible() && this.state.current() && this.ready() && !this.disabled() && this.getTriggerNode()) { this.renderOpen(); return; }
    if (!this.overlayRef?.hasAttached()) return;
    this.mountOverlay();
    const root = this.getOverlay(), content = root?.querySelector<HTMLElement>('.t-popup__content');
    if (!root || !content) return;
    const trigger = this.getTriggerNode();
    if (!trigger) { this.renderClose(); return; }
    const resolve = (style: PopupStyleInput | undefined) => typeof style === 'function' ? style(trigger, content) : style ?? {};
    this.rootStyle.set({ ...resolve(this.overlayStyle()) });
    this.innerStyle.set({ ...resolve(this.overlayInnerStyle()) });
    this.applyPosition(); this.overlayRef.updatePosition();
  }

  protected handleScroll(event: Event): void {
    if (!this.innerVisible() || this.destroyed) return;
    this.scroll.emit({ e: event });
    this.clearBottomTimer();
    const target = event.target as HTMLElement;
    if (target.scrollHeight <= target.clientHeight || Math.abs(target.scrollTop + target.clientHeight - target.scrollHeight) >= 1) return;
    this.bottomTimer = setTimeout(() => {
      this.bottomTimer = null;
      if (this.innerVisible() && !this.destroyed && Math.abs(target.scrollTop + target.clientHeight - target.scrollHeight) < 1) this.scrollToBottom.emit({ e: event });
    }, 100);
  }

  /** 切换展开状态。 */
  toggle(): void {
    if (this.innerVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  protected handleHostEnter(event: MouseEvent): void {
    if (!this.isTriggerEvent(event)) return;
    if (this.trigger() === 'hover') this.scheduleShow({ e: event, trigger: 'hover' });
  }

  protected handleHostLeave(event: MouseEvent): void {
    if (!this.isTriggerEvent(event)) return;
    if (this.trigger() !== 'hover') return;
    if (this.pointerInPanel) return;
    this.scheduleHide({ e: event, trigger: 'hover' });
  }

  protected handleHostClick(event: MouseEvent): void {
    if (!this.isTriggerEvent(event)) return;
    if (this.trigger() !== 'click') return;
    event.stopPropagation();
    if (this.innerVisible()) {
      this.close({ e: event, trigger: 'click' });
    } else {
      this.scheduleShow({ e: event, trigger: 'click' });
    }
  }

  protected handleHostFocusIn(event: FocusEvent): void {
    if (!this.isTriggerEvent(event)) return;
    if (this.trigger() !== 'focus') return;
    this.scheduleShow({ e: event, trigger: 'focus' });
  }

  /** 判断目标是否在本弹层触发区或浮层内，供复合输入统一焦点边界。 */
  containsTarget(target: EventTarget | null): boolean {
    if (typeof Node === 'undefined' || !(target instanceof Node)) return false;
    return (this.externalTrigger() ? !!this.triggerNode?.contains(target) : this.hostRef.nativeElement.contains(target)) || !!this.overlayRef?.overlayElement.contains(target);
  }

  protected handleHostFocusOut(event: FocusEvent): void {
    if (this.movingAttachment) return;
    if (!this.isTriggerEvent(event)) return;
    if (this.trigger() !== 'focus') return;
    const next = event.relatedTarget as Node | null;
    if (this.containsTarget(next)) {
      return;
    }
    this.close({ e: event, trigger: 'focus' });
  }

  protected handleHostMouseDown(event: MouseEvent): void {
    if (!this.isTriggerEvent(event)) return;
    if (this.trigger() !== 'mousedown') return;
    this.scheduleShow({ e: event, trigger: 'mousedown' });
  }

  protected handleHostContextMenu(event: MouseEvent): void {
    if (!this.isTriggerEvent(event)) return;
    if (this.trigger() !== 'context-menu') return;
    event.preventDefault();
    this.scheduleShow({ e: event, trigger: 'context-menu' });
  }

  protected handleOverlayClick(event: MouseEvent): void {
    this.overlayClick.emit(event);
  }

  private readonly handleDocumentPointerDown = (event: Event) => {
    if (!this.innerVisible()) return;
    const target = event.target as Node | null;
    if (!target) return;
    if (this.containsTarget(target)) return;
    const ignoreSelector = this.ignoreOutsideSelector();
    if (ignoreSelector && target instanceof Element && target.closest(ignoreSelector)) return;
    this.close({ e: event as MouseEvent, trigger: 'outside' });
  };

  private readonly handleDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.innerVisible()) {
      this.close({ e: event, trigger: 'escape' });
    }
  };

  private scheduleShow(context: PopupVisibleChangeContext): void {
    if (this.destroyed || this.disabled()) return;
    this.clearHideTimer();
    const delay = this.showDelay();
    if (delay <= 0) {
      this.open(context);
      return;
    }
    this.clearShowTimer();
    this.showTimer = setTimeout(() => this.open(context), delay);
  }

  private scheduleHide(context: PopupVisibleChangeContext): void {
    this.clearShowTimer();
    const delay = this.hideDelay();
    if (delay <= 0) {
      this.close(context);
      return;
    }
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => this.close(context), delay);
  }

  private showDelay(): number {
    const delay = this.delay();
    if (Array.isArray(delay)) return delay[0] ?? 0;
    return delay ?? 0;
  }

  private hideDelay(): number {
    const delay = this.delay();
    return Array.isArray(delay) ? (delay[1] ?? 0) : 0;
  }

  private open(context: PopupVisibleChangeContext): void {
    if (this.destroyed || this.disabled()) return;
    this.clearTimers();
    if (this.state.current() && this.ready()) { this.renderOpen(); return; }
    this.requestVisible(true, context);
  }

  private requestVisible(visible: boolean, context: PopupVisibleChangeContext): void {
    if (this.destroyed || visible === this.state.current()) return;
    this.state.set(visible);
    this.visibleChange.emit(visible);
    this.visibleChangeContext.emit({ visible, ...context });
    if (this.visible() === undefined && this.ready()) {
      if (visible) this.renderOpen(); else this.renderClose();
    }
  }

  private renderOpen(): void {
    if (this.destroyed || this.disabled()) return;
    this.bindTrigger();
    if (!this.getTriggerNode()) { this.renderClose(); return; }
    this.clearTimers();

    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        hasBackdrop: false,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
      this.overlayRef.overlayElement.addEventListener('mouseenter', this.panelEnter);
      this.overlayRef.overlayElement.addEventListener('mouseleave', this.panelLeave);
      this.overlayRef.overlayElement.addEventListener('focusout', this.panelFocusOut);
    }

    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new TemplatePortal(this.overlayTemplate(), this.viewContainerRef));
    }
    this.mountOverlay();

    this.panelHidden.set(false);
    this.applyPosition();
    this.overlayRef.updatePosition();

    if (this.hideEmptyPopup() && !this.hasContent()) {
      this.panelHidden.set(true);
      this.innerVisible.set(false);
      this.unbindOutsideListeners();
      return;
    }

    this.innerVisible.set(true);
    this.bindOutsideListeners();
    this.update();
  }

  private close(context: PopupVisibleChangeContext): void {
    this.clearTimers();
    this.requestVisible(false, context);
  }

  private renderClose(): void {
    this.clearTimers();
    this.clearBottomTimer();
    this.pointerInPanel = false;
    this.innerVisible.set(false);
    this.unbindOutsideListeners();

    if (!this.overlayRef) return;
    if (this.destroyOnClose()) {
      this.overlayRef.detach();
      this.panelHidden.set(false);
    } else {
      this.panelHidden.set(true);
    }
  }

  private hasContent(): boolean {
    if (this.content() !== undefined && this.content() !== '') return true;
    const contentEl = this.overlayRef?.overlayElement.querySelector('.t-popup__content');
    if (!contentEl) return false;
    return Array.from(contentEl.children).some((child) => !child.classList.contains('t-popup__arrow'));
  }

  private applyPosition(): void {
    const anchor = this.getTriggerNode();
    if (!anchor) return;
    this.connector = connectPopup(this.overlay, anchor, this.placement(), this.popperOptions());
    this.overlayRef?.updatePositionStrategy(this.connector.strategy);
    this.popperPlacement.set(this.connector.initialPlacement);
    this.connector.watch((value) => this.popperPlacement.set(value));
  }

  private bindOutsideListeners(): void {
    this.hostRef.nativeElement.ownerDocument.addEventListener('pointerdown', this.handleDocumentPointerDown);
    this.hostRef.nativeElement.ownerDocument.addEventListener('keydown', this.handleDocumentKeydown);
    this.hostRef.nativeElement.ownerDocument.addEventListener('scroll', this.handleViewportChange, true);
    this.hostRef.nativeElement.ownerDocument.defaultView?.addEventListener('resize', this.handleViewportChange);
  }

  private unbindOutsideListeners(): void {
    this.hostRef.nativeElement.ownerDocument.removeEventListener('pointerdown', this.handleDocumentPointerDown);
    this.hostRef.nativeElement.ownerDocument.removeEventListener('keydown', this.handleDocumentKeydown);
    this.hostRef.nativeElement.ownerDocument.removeEventListener('scroll', this.handleViewportChange, true);
    this.hostRef.nativeElement.ownerDocument.defaultView?.removeEventListener('resize', this.handleViewportChange);
  }

  private readonly handleViewportChange = () => {
    if (!this.innerVisible()) return;
    if (!this.getTriggerNode()) { this.renderClose(); return; }
    this.attachment.update();
    this.overlayRef?.updatePosition();
  };

  private mountOverlay(): void {
    if (!this.overlayRef) return;
    this.movingAttachment = true;
    try { this.attachment.mount(this.overlayRef.hostElement, this.attach()); }
    finally { this.movingAttachment = false; }
  }

  private getTriggerNode(): HTMLElement | null {
    const host = this.hostRef.nativeElement;
    if (this.externalTrigger()) return this.triggerNode?.isConnected ? resolveAnchor(this.triggerNode) : null;
    const template = this.customTrigger()?.nativeElement;
    return resolveAnchor((template?.firstElementChild as HTMLElement | null) ?? (host.firstElementChild as HTMLElement | null) ?? host);
  }

  private isTriggerEvent(event: Event): boolean {
    return !this.externalTrigger() || (!!this.triggerNode && !!event.target && this.triggerNode.contains(event.target as Node));
  }

  private bindTrigger(): void {
    const source = this.triggerElement();
    let node: HTMLElement | null = null;
    if (typeof source === 'string') {
      try { node = this.hostRef.nativeElement.ownerDocument.querySelector<HTMLElement>(source); } catch { /* missing trigger stays closed */ }
    }
    if (node === this.triggerNode) return;
    this.clearTimers();
    this.triggerCleanup.forEach((cleanup) => cleanup()); this.triggerCleanup = [];
    this.triggerNode = node;
    if (!node || this.hostRef.nativeElement.contains(node)) return;
    const events: Array<[string, (event: any) => void]> = [
      ['mouseenter', (event: MouseEvent) => this.handleHostEnter(event)], ['mouseleave', (event: MouseEvent) => this.handleHostLeave(event)],
      ['click', (event: MouseEvent) => this.handleHostClick(event)], ['focusin', (event: FocusEvent) => this.handleHostFocusIn(event)],
      ['focusout', (event: FocusEvent) => this.handleHostFocusOut(event)], ['mousedown', (event: MouseEvent) => this.handleHostMouseDown(event)],
      ['contextmenu', (event: MouseEvent) => this.handleHostContextMenu(event)],
    ];
    this.triggerCleanup = events.map(([name, listener]) => this.renderer.listen(node, name, listener));
  }

  private clearBottomTimer(): void {
    if (this.bottomTimer !== null) clearTimeout(this.bottomTimer);
    this.bottomTimer = null;
  }

  private clearShowTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearShowTimer();
    this.clearHideTimer();
  }
}
