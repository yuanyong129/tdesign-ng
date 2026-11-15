import { A11yModule } from '@angular/cdk/a11y';
import { BlockScrollStrategy, Overlay } from '@angular/cdk/overlay';
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
@Directive({ selector: '[tDrawerFooter]', standalone: true })
export class TDrawerFooterSlot {}
import {
  DRAWER_MODES,
  DRAWER_PLACEMENTS,
  DrawerCloseEvent,
  DrawerCloseTrigger,
  DrawerMode,
  DrawerPlacement,
} from './drawer.types';

/**
 * 抽屉。
 *
 * ```html
 * <t-drawer [(visible)]="visible" header="标题" placement="right" body="内容" />
 * ```
 */
@Component({
  selector: 't-drawer',
  standalone: true,
  imports: [A11yModule, TButtonModule, TDrawerFooterSlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './drawer.component.html',
})
export class TDrawer {
  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);

  /** @zh 是否显示抽屉，用于双向绑定 @en Whether the drawer is visible, used for two-way binding @defaultValue false */
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

  /** @zh 是否允许按 Esc 关闭 @en Whether the drawer closes on Escape @defaultValue true */
  readonly closeOnEscKeydown = input(true, { transform: booleanAttribute });

  /** @zh 是否允许点击遮罩关闭 @en Whether the drawer closes on overlay click @defaultValue true */
  readonly closeOnOverlayClick = input(true, { transform: booleanAttribute });

  /** @zh 是否显示遮罩 @en Whether to show the overlay mask @defaultValue true */
  readonly showOverlay = input(true, { transform: booleanAttribute });

  /** @zh 出现方向 @en The placement of the drawer @defaultValue 'right' @values left, right, top, bottom */
  readonly placement = input<DrawerPlacement>('right');

  /** @zh 抽屉尺寸，左右方向为宽度、上下方向为高度 @en Drawer size, width for left/right and height for top/bottom @defaultValue '27.5%' */
  readonly size = input<string>('27.5%');

  /** @zh 与页面的关系 @en The relationship with the page @defaultValue 'overlay' @values overlay, push */
  readonly mode = input<DrawerMode>('overlay');

  /** @zh 关闭时是否销毁内容 @en Whether to destroy the content on close @defaultValue false */
  readonly destroyOnClose = input(false, { transform: booleanAttribute });

  /** @zh 是否懒渲染，首次打开前不创建 DOM @en Whether to render lazily until first open @defaultValue false */
  readonly lazy = input(false, { transform: booleanAttribute });

  /** @zh 是否禁止背景滚动 @en Whether to prevent scrolling the page behind @defaultValue true */
  readonly preventScrollThrough = input(true, { transform: booleanAttribute });

  /** @zh 层级 @en The z-index of the drawer @defaultValue undefined */
  readonly zIndex = input<number | undefined>();

  /** @zh 抽屉元素的附加类名 @en Extra class names of the drawer element @defaultValue null */
  readonly drawerClassName = input<string | string[] | Record<string, boolean> | null>(null);

  /** @zh 显示状态变化，用于双向绑定 @en Visible change event, used for two-way binding */
  readonly visibleChange = output<boolean>();

  /** @zh 关闭事件，携带关闭来源 @en Close event with the trigger source */
  readonly close = output<DrawerCloseEvent>();

  /** @zh 点击确认 @en Confirm event */
  readonly confirm = output<MouseEvent>();

  /** @zh 点击取消 @en Cancel event */
  readonly cancel = output<MouseEvent>();

  /** @zh 点击遮罩 @en Overlay click event */
  readonly overlayClick = output<MouseEvent>();

  protected readonly innerVisible = signal(false);
  private readonly opened = signal(false);
  private scrollStrategy: BlockScrollStrategy | null = null;
  private readonly ctx = viewChild<ElementRef<HTMLElement>>('ctx');

  private readonly footerSlot = contentChild(TDrawerFooterSlot);

  protected readonly placements = DRAWER_PLACEMENTS;
  protected readonly modes = DRAWER_MODES;

  protected readonly showHeader = computed(() => this.header() !== false);

  protected readonly headerText = computed(() => (typeof this.header() === 'string' ? this.header() : ''));

  /** 有自定义底部内容时，不再渲染默认的取消/确定按钮。 */
  protected readonly showDefaultButtons = computed(() => !this.footerSlot());

  protected readonly showCancel = computed(() => this.cancelBtn() !== null);

  protected readonly showConfirm = computed(() => this.confirmBtn() !== null);

  protected readonly cancelText = computed(() => this.cancelBtn() ?? '取消');

  protected readonly confirmText = computed(() => this.confirmBtn() ?? '确定');

  protected readonly shouldRender = computed(() => !this.lazy() || this.opened() || this.innerVisible());

  protected readonly showMask = computed(() => this.showOverlay());

  protected readonly drawerClasses = computed(() =>
    [
      't-drawer',
      `t-drawer--${this.placement()}`,
      this.mode() === 'push' ? 't-drawer--push' : '',
      this.innerVisible() ? 't-drawer--open' : '',
      this.showMask() ? '' : 't-drawer--without-mask',
      ...this.classList(this.drawerClassName()),
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly wrapperClasses = computed(
    () => `t-drawer__content-wrapper t-drawer__content-wrapper--${this.placement()}`,
  );

  /** 左右方向设宽度，上下方向设高度，另一方向撑满。 */
  protected readonly wrapperStyle = computed(() => {
    const size = this.size();
    const horizontal = this.placement() === 'left' || this.placement() === 'right';
    return horizontal ? { width: size, height: '100%' } : { height: size, width: '100%' };
  });

  constructor() {
    effect(() => {
      const visible = this.visible();
      untracked(() => this.applyVisible(visible));
    });

    this.destroyRef.onDestroy(() => this.scrollStrategy?.disable());
  }

  /** 打开抽屉。 */
  show(): void {
    this.applyVisible(true);
  }

  /** 关闭抽屉。 */
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
    this.confirm.emit(event);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.closeOnEscKeydown()) return;
    event.preventDefault();
    this.requestClose('esc', event);
  }

  private requestClose(trigger: DrawerCloseTrigger, event?: MouseEvent | KeyboardEvent): void {
    this.applyVisible(false);
    this.close.emit({ trigger, event });
  }

  private applyVisible(visible: boolean): void {
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
