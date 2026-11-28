import { A11yModule } from '@angular/cdk/a11y';
import { DOCUMENT, NgStyle, NgTemplateOutlet } from '@angular/common';
import { Overlay } from '@angular/cdk/overlay';
import { createControllableState } from '../../_utils/controllable-state';
import { isTemplateContent } from '../../_utils/content';
import { dialogStack, handledDialogKeys, lockDialogScroll, type DialogLayer } from '../../_utils/dialog-stack';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Directive, contentChild } from '@angular/core';
import { TButtonModule } from '../button/button.module';

/** 标记底部操作区的内容，存在时不再渲染默认按钮。 */
@Directive({ selector: '[tDialogFooter]', standalone: true })
export class TDialogFooterSlot {}
import {
  DIALOG_MODES,
  DIALOG_PLACEMENTS,
  DIALOG_THEMES,
  DialogCloseEvent,
  DialogCloseTrigger,
  DialogMode,
  DialogPlacement,
  DialogTheme,
  DialogContent,
} from './dialog.types';

/** 可选布尔：不传时保持 undefined，便于区分「未设置」与 false。 */
const optionalBoolean = (value: unknown): boolean | undefined => value === undefined ? undefined : booleanAttribute(value);
let dialogId = 0;

/**
 * 对话框。
 *
 * ```html
 * <t-dialog [(visible)]="visible" header="标题" body="内容" (confirm)="handleConfirm()" />
 * ```
 */
@Component({
  selector: 't-dialog',
  standalone: true,
  imports: [A11yModule, TButtonModule, NgTemplateOutlet, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dialog.component.html',
})
export class TDialog {
  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly stack = dialogStack(this.document);
  private readonly layerKey = {};
  private destroyed = false;
  private previousFocus: HTMLElement | null = null;
  private actualVisible = false;
  private pendingLifecycle: 'open' | 'close' | null = null;
  private readonly lifecycleTick = signal(0);
  protected readonly titleId = `t-dialog-title-${++dialogId}`;

  /** @zh 受控显隐，未传时由实例方法管理，缺省关闭 @en Controlled visibility, omitted for instance-managed visibility, initially closed @defaultValue undefined */
  readonly visible = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  /** @zh 标题，传 false 隐藏头部 @en Header text, false hides the header @defaultValue '' */
  readonly header = input<string | boolean>('');

  /** @zh 正文字符串或模板，显式值优先于投影 @en Body text or template, explicit value takes precedence over projection @defaultValue undefined */
  readonly body = input<DialogContent>();

  /** @zh 是否显示底部操作区 @en Whether to show the footer @defaultValue true */
  readonly footer = input(true, { transform: booleanAttribute });

  /** @zh 是否显示关闭按钮 @en Whether to show the close button @defaultValue true */
  readonly closeBtn = input(true, { transform: booleanAttribute });

  /** @zh 确认按钮文案，null 隐藏 @en Confirm button text, null hides it @defaultValue '确定' */
  readonly confirmBtn = input<string | null>('确定');

  /** @zh 取消按钮文案，null 隐藏 @en Cancel button text, null hides it @defaultValue '取消' */
  readonly cancelBtn = input<string | null>('取消');

  /** @zh 确认按钮是否加载中 @en Whether the confirm button is loading @defaultValue false */
  readonly confirmLoading = input(false, { transform: booleanAttribute });
  /** @zh 是否允许非编辑区域按 Enter 确认 @en Whether Enter confirms outside editable and native activation controls @defaultValue false */
  readonly confirmOnEnter = input(false, { transform: booleanAttribute });

  /** @zh 是否允许按 Esc 关闭 @en Whether the dialog closes on Escape @defaultValue true */
  readonly closeOnEscKeydown = input(true, { transform: booleanAttribute });

  /** @zh 是否允许点击遮罩关闭 @en Whether the dialog closes on overlay click @defaultValue true */
  readonly closeOnOverlayClick = input(true, { transform: booleanAttribute });

  /** @zh 是否显示遮罩 @en Whether to show the overlay mask @defaultValue true */
  readonly showOverlay = input(true, { transform: booleanAttribute });

  /** @zh 主题，非 default 时头部显示对应图标 @en Theme, a non-default value shows an icon in the header @defaultValue 'default' @values default, info, warning, danger, success */
  readonly theme = input<DialogTheme>('default');

  /** @zh 垂直位置 @en Vertical placement @defaultValue 'top' @values top, center */
  readonly placement = input<DialogPlacement>('top');

  /** @zh 距顶部的距离，placement 为 top 时生效 @en Distance from the top, works with top placement @defaultValue '10vh' */
  readonly top = input<string | number>('10vh');

  /** @zh 对话框宽度 @en Dialog width @defaultValue '480px' */
  readonly width = input<string | number>('480px');

  /** @zh 展示形态 @en Dialog mode @defaultValue 'modal' @values modal, modeless, normal, full-screen */
  readonly mode = input<DialogMode>('modal');

  /** @zh 关闭时是否销毁内容 @en Whether to destroy the content on close @defaultValue false */
  readonly destroyOnClose = input(false, { transform: booleanAttribute });

  /** @zh 是否懒渲染，首次打开前不创建 DOM @en Whether to render lazily until first open @defaultValue false */
  readonly lazy = input(false, { transform: booleanAttribute });

  /** @zh 是否禁止背景滚动 @en Whether to prevent scrolling the page behind @defaultValue true */
  readonly preventScrollThrough = input(true, { transform: booleanAttribute });

  /** @zh 层级 @en The z-index of the dialog @defaultValue undefined */
  readonly zIndex = input<number | undefined>();

  /** @zh 对话框元素的附加类名 @en Extra class names of the dialog element @defaultValue null */
  readonly dialogClassName = input<string | string[] | Record<string, boolean> | null>(null);

  /** @zh 对话框元素的行内样式 @en Inline styles of the dialog element @defaultValue null */
  readonly dialogStyle = input<Record<string, string> | null>(null);

  /** @zh 显示状态变化，用于双向绑定 @en Visible change event, used for two-way binding */
  readonly visibleChange = output<boolean>();

  /** @zh 关闭事件，携带关闭来源 @en Close event with the trigger source */
  readonly close = output<DialogCloseEvent>();

  /** @zh 点击确认 @en Confirm event */
  readonly confirm = output<MouseEvent | KeyboardEvent>();

  /** @zh 点击取消 @en Cancel event */
  readonly cancel = output<MouseEvent>();

  /** @zh 点击遮罩 @en Overlay click event */
  readonly overlayClick = output<MouseEvent>();
  /** @zh 点击或键盘激活关闭入口 @en Close control activated */
  readonly closeBtnClick = output<MouseEvent | KeyboardEvent>();
  /** @zh 顶层对话框收到 Esc @en Escape received by the top dialog */
  readonly escKeydown = output<KeyboardEvent>();
  /** @zh 实际打开前通知，不用于拦截 @en Notification before actual opening, not a guard */
  readonly beforeOpen = output<void>();
  /** @zh 实际关闭前通知，不用于拦截 @en Notification before actual closing, not a guard */
  readonly beforeClose = output<void>();
  /** @zh 打开状态渲染完成 @en Open state rendered */
  readonly opened = output<void>();
  /** @zh 关闭状态渲染完成 @en Closed state rendered */
  readonly closed = output<void>();

  private readonly state = createControllableState(this.visible, () => false);
  protected readonly innerVisible = this.state.current;
  private readonly hasOpened = signal(false);
  private readonly ctx = viewChild<ElementRef<HTMLElement>>('ctx');

  private readonly footerSlot = contentChild(TDialogFooterSlot);

  protected readonly themes = DIALOG_THEMES;
  protected readonly placements = DIALOG_PLACEMENTS;
  protected readonly modes = DIALOG_MODES;

  protected readonly showHeader = computed(() => this.header() !== false);

  protected readonly headerText = computed(() => (typeof this.header() === 'string' ? this.header() : ''));

  /** 有自定义底部内容时，不再渲染默认的取消/确定按钮。 */
  protected readonly showDefaultButtons = computed(() => !this.footerSlot());

  protected readonly showCancel = computed(() => this.cancelBtn() !== null);

  protected readonly showConfirm = computed(() => this.confirmBtn() !== null);

  protected readonly cancelText = computed(() => this.cancelBtn() ?? '取消');

  protected readonly confirmText = computed(() => this.confirmBtn() ?? '确定');

  /** 懒渲染：首次打开过之后才创建 DOM。 */
  protected readonly shouldRender = computed(() => (!this.lazy() || this.hasOpened() || this.innerVisible()) && (!this.destroyOnClose() || this.innerVisible()));
  protected readonly isTemplateContent = isTemplateContent;
  protected readonly isModal = computed(() => this.mode() === 'modal' || this.mode() === 'full-screen');
  protected readonly topLayer = computed(() => this.stack().reduce<DialogLayer | null>((top, item) => !top || item.zIndex >= top.zIndex ? item : top, null));
  protected readonly isTop = computed(() => this.mode() === 'normal' ? !this.topLayer() : this.topLayer()?.key === this.layerKey);
  protected readonly trapFocus = computed(() => this.innerVisible() && this.isModal() && this.isTop());

  protected readonly isFullScreen = computed(() => this.mode() === 'full-screen');

  protected readonly ctxClasses = computed(() =>
    [
      't-dialog__ctx',
      this.mode() === 'normal' || this.isFullScreen() ? '' : 't-dialog__ctx--fixed',
      this.mode() === 'modeless' ? 't-dialog__ctx--modeless' : '',
      this.innerVisible() ? 't-is-visible' : 't-is-hidden',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly positionClasses = computed(() =>
    this.isFullScreen()
      ? 't-dialog__position_fullscreen'
      : `t-dialog__position ${this.placement() === 'center' ? 't-dialog--center' : 't-dialog--top'}`,
  );

  protected readonly positionStyle = computed(() => {
    if (this.isFullScreen() || this.placement() === 'center') return {};
    const top = this.top();
    return { paddingTop: typeof top === 'number' ? `${top}px` : top };
  });

  protected readonly dialogClasses = computed(() =>
    [
      't-dialog',
      this.isFullScreen() ? 't-dialog__fullscreen' : 't-dialog--default',
      this.confirmLoading() ? 't-dialog--lock' : '',
      ...this.classList(this.dialogClassName()),
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly resolvedDialogStyle = computed(() => {
    const width = this.width();
    return {
      ...(this.dialogStyle() ?? {}),
      width: typeof width === 'number' ? `${width}px` : width,
    };
  });

  protected readonly showMask = computed(() => this.showOverlay() && this.isModal());

  constructor() {
    effect(() => {
      const visible = this.innerVisible();
      untracked(() => this.transition(visible));
    });
    effect(() => {
      const visible = this.innerVisible(), mode = this.mode(), zIndex = this.zIndex();
      untracked(() => {
        const records = this.stack().filter(item => item.key !== this.layerKey);
        const previous = this.stack().findIndex(item => item.key === this.layerKey);
        if (visible && mode !== 'normal') records.splice(previous < 0 ? records.length : previous, 0, {
          key: this.layerKey, zIndex: Number.isFinite(zIndex) ? zIndex! : 2500,
          element: () => this.ctx()?.nativeElement ?? null,
        });
        this.stack.set(records);
      });
    });
    effect(cleanup => {
      if (!this.innerVisible() || !this.isModal() || !this.preventScrollThrough()) return;
      const release = untracked(() => lockDialogScroll(this.document, () => this.overlay.scrollStrategies.block()));
      cleanup(release);
    });
    effect(cleanup => {
      if (!this.innerVisible()) return;
      const listener = (event: KeyboardEvent) => this.handleKeydown(event);
      this.document.addEventListener('keydown', listener);
      cleanup(() => this.document.removeEventListener('keydown', listener));
    });
    afterRenderEffect(() => {
      this.lifecycleTick();
      const visible = this.innerVisible(), element = this.ctx()?.nativeElement, top = this.isTop(), modal = this.isModal();
      untracked(() => {
        if (this.destroyed || visible !== this.actualVisible) return;
        const pending = this.pendingLifecycle;
        this.pendingLifecycle = null;
        if (pending === 'open' && visible && element && modal && top && !element.contains(this.document.activeElement)) element.focus({ preventScroll: true });
        if (pending === 'open' && visible && element) this.opened.emit();
        if (pending === 'close' && !visible) { this.restoreFocus(); this.closed.emit(); }
      });
    });
    this.destroyRef.onDestroy(() => {
      this.destroyed = true; this.pendingLifecycle = null;
      this.stack.update(items => items.filter(item => item.key !== this.layerKey));
      this.restoreFocus();
    });
  }

  /** Request opening; controlled visibility must be accepted by the caller. */
  show(): void { this.propose(true); }
  hide(): void { this.propose(false); }
  toggle(): void { this.propose(!this.innerVisible()); }

  protected handleMaskClick(event: MouseEvent): void {
    if (!this.canInteract() || !this.showMask()) return;
    this.overlayClick.emit(event);
    if (!this.destroyed && this.closeOnOverlayClick()) this.requestClose('overlay', event);
  }

  protected handleCloseBtn(event: MouseEvent | KeyboardEvent): void {
    if (!this.canInteract()) return;
    if (event instanceof KeyboardEvent && (event.repeat || event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault(); event.stopPropagation();
    this.closeBtnClick.emit(event);
    if (!this.destroyed) this.requestClose('close-btn', event);
  }

  protected handleCancel(event: MouseEvent): void {
    if (!this.canInteract()) return;
    this.cancel.emit(event);
    if (!this.destroyed) this.requestClose('cancel', event);
  }

  protected handleConfirm(event: MouseEvent | KeyboardEvent): void {
    if (!this.canInteract() || this.confirmLoading() || this.confirmBtn() === null) return;
    this.confirm.emit(event);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (!this.canInteract() || event.defaultPrevented || event.isComposing || event.repeat || handledDialogKeys.has(event)) return;
    const element = this.ctx()?.nativeElement;
    if (this.mode() === 'normal' && (event.target as HTMLElement).closest?.('.t-dialog__ctx') !== element) return;
    if (event.key === 'Escape' || event.code === 'Escape') {
      handledDialogKeys.add(event);
      this.escKeydown.emit(event);
      if (!this.destroyed && this.closeOnEscKeydown()) {
        event.preventDefault(); event.stopPropagation(); this.requestClose('esc', event);
      }
      return;
    }
    if (!this.confirmOnEnter() || event.key !== 'Enter' && event.code !== 'NumpadEnter' || !element?.contains(event.target as Node)) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])')) return;
    handledDialogKeys.add(event); event.preventDefault(); this.handleConfirm(event);
  }

  private canInteract(): boolean { return !this.destroyed && this.innerVisible() && this.isTop(); }

  private requestClose(trigger: DialogCloseTrigger, event?: MouseEvent | KeyboardEvent): void {
    if (this.destroyed) return;
    this.close.emit({ trigger, event });
    if (!this.destroyed) this.propose(false);
  }

  private propose(visible: boolean): void {
    if (this.destroyed || visible === this.innerVisible()) return;
    this.state.set(visible); this.visibleChange.emit(visible);
  }

  private transition(visible: boolean): void {
    if (this.destroyed || visible === this.actualVisible) return;
    this.actualVisible = visible;
    this.pendingLifecycle = visible ? 'open' : 'close';
    this.lifecycleTick.update(value => value + 1);
    if (visible) {
      this.previousFocus = this.document.activeElement as HTMLElement | null;
      this.hasOpened.set(true); this.beforeOpen.emit();
    } else this.beforeClose.emit();
  }

  private restoreFocus(): void {
    const element = this.ctx()?.nativeElement, active = this.document.activeElement;
    // A lower layer closing must not steal focus from the active upper layer.
    if (active !== this.document.body && active !== this.document.documentElement && (!element || !element.contains(active))) return;
    const layers = this.stack().filter(item => item.key !== this.layerKey);
    const top = layers.reduce<(typeof layers)[number] | null>((current, item) => !current || item.zIndex >= current.zIndex ? item : current, null);
    const previous = this.previousFocus;
    if (previous?.isConnected && previous.getClientRects().length && !previous.hasAttribute('disabled') && (!top || top.element()?.contains(previous))) previous.focus({ preventScroll: true });
    else top?.element()?.focus({ preventScroll: true });
    this.previousFocus = null;
  }

  private classList(value: string | string[] | Record<string, boolean> | null): string[] {
    if (!value) return [];
    if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
    if (Array.isArray(value)) return value.filter(Boolean);
    return Object.keys(value).filter((key) => value[key]);
  }
}
