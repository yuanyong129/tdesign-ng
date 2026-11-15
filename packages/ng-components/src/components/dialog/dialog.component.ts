import { A11yModule } from '@angular/cdk/a11y';
import { Overlay, BlockScrollStrategy } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
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
} from './dialog.types';

/** 可选布尔：不传时保持 undefined，便于区分「未设置」与 false。 */
const optionalBoolean = (value: unknown): boolean | undefined =>
  value === undefined || value === null || value === '' ? undefined : booleanAttribute(value);

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
  imports: [A11yModule, TButtonModule, TDialogFooterSlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dialog.component.html',
})
export class TDialog {
  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);

  /** @zh 是否显示对话框，用于双向绑定 @en Whether the dialog is visible, used for two-way binding @defaultValue false */
  readonly visible = input(false, { transform: booleanAttribute });

  /** @zh 标题，传 false 隐藏头部 @en Header text, false hides the header @defaultValue '' */
  readonly header = input<string | boolean>('');

  /** @zh 内容文本 @en Body text @defaultValue undefined */
  readonly body = input<string | undefined>();

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
  readonly confirm = output<MouseEvent>();

  /** @zh 点击取消 @en Cancel event */
  readonly cancel = output<MouseEvent>();

  /** @zh 点击遮罩 @en Overlay click event */
  readonly overlayClick = output<MouseEvent>();

  protected readonly innerVisible = signal(false);
  private readonly opened = signal(false);
  private readonly disabledByForms = signal(false);
  private scrollStrategy: BlockScrollStrategy | null = null;
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
  protected readonly shouldRender = computed(() => !this.lazy() || this.opened() || this.innerVisible());

  protected readonly isFullScreen = computed(() => this.mode() === 'full-screen');

  protected readonly ctxClasses = computed(() =>
    [
      't-dialog__ctx',
      this.isFullScreen() ? '' : 't-dialog__ctx--fixed',
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
      this.isFullScreen() ? 't-dialog__fullscreen' : '',
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

  protected readonly showMask = computed(() => this.showOverlay() && this.mode() !== 'modeless');

  constructor() {
    effect(() => {
      const visible = this.visible();
      untracked(() => this.applyVisible(visible));
    });

    this.destroyRef.onDestroy(() => this.scrollStrategy?.disable());
  }

  /** 打开对话框。 */
  show(): void {
    this.applyVisible(true);
  }

  /** 关闭对话框。 */
  hide(): void {
    this.applyVisible(false);
  }

  /** 根据当前状态切换。 */
  toggle(): void {
    this.applyVisible(!this.innerVisible());
  }

  protected handleMaskClick(event: MouseEvent): void {
    this.overlayClick.emit(event);
    if (!this.closeOnOverlayClick()) return;
    this.requestClose('overlay', event);
  }

  protected handleCloseBtn(event: MouseEvent): void {
    this.requestClose('close-btn', event);
  }

  protected handleCancel(event: MouseEvent): void {
    this.cancel.emit(event);
    this.requestClose('cancel', event);
  }

  protected handleConfirm(event: MouseEvent): void {
    if (this.confirmLoading()) return;
    this.confirm.emit(event);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.closeOnEscKeydown()) return;
    event.preventDefault();
    this.requestClose('esc', event);
  }

  private requestClose(trigger: DialogCloseTrigger, event?: MouseEvent | KeyboardEvent): void {
    this.applyVisible(false);
    this.close.emit({ trigger, event });
  }

  private applyVisible(visible: boolean): void {
    if (this.disabledByForms()) return;
    if (visible === this.innerVisible()) return;

    this.innerVisible.set(visible);
    if (visible) {
      this.opened.set(true);
      this.lockScroll();
      // 焦点陷阱本身不会主动聚焦，打开后先把焦点交给容器，键盘事件与 Tab 循环才有落点
      setTimeout(() => this.ctx()?.nativeElement.focus());
    } else {
      this.unlockScroll();
    }
    this.visibleChange.emit(visible);
  }

  private lockScroll(): void {
    if (!this.preventScrollThrough()) return;
    if (!this.scrollStrategy) {
      this.scrollStrategy = this.overlay.scrollStrategies.block();
      this.scrollStrategy.attach();
    }
    this.scrollStrategy.enable();
  }

  private unlockScroll(): void {
    this.scrollStrategy?.disable();
  }

  private classList(value: string | string[] | Record<string, boolean> | null): string[] {
    if (!value) return [];
    if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
    if (Array.isArray(value)) return value.filter(Boolean);
    return Object.keys(value).filter((key) => value[key]);
  }
}
