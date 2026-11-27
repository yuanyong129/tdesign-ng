import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
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
import { connectPopup, PopupConnector, resolveAnchor } from '../popup/popup-position';
import { PopupPlacement } from '../popup/popup.types';

/** @zh 提示主题 @en The theme of the tooltip @defaultValue 'default' @values default, primary, success, danger, warning, light */
export const TOOLTIP_THEMES = ['default', 'primary', 'success', 'danger', 'warning', 'light'] as const;

export type TooltipTheme = (typeof TOOLTIP_THEMES)[number];

/** 提示出现的位置，`mouse` 表示跟随鼠标。 */
export type TooltipPlacement = 'mouse' | PopupPlacement;

/**
 * 文字提示。
 *
 * 默认投影的内容是触发器，提示内容通过 `content`（纯文本）或 `[tTooltipContent]`（任意模板）提供。
 */
@Component({
  selector: 't-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tooltip.component.html',
  host: {
    '(mouseenter)': 'handleEnter($event)',
    '(mouseleave)': 'handleLeave($event)',
    '(focusin)': 'handleFocus(true)',
    '(focusout)': 'handleFocus(false)',
  },
})
export class TTooltip {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly overlayTemplate = viewChild.required<TemplateRef<unknown>>('overlayTemplate');

  /** @zh 提示内容（纯文本） @en Tooltip content as plain text @defaultValue undefined */
  readonly content = input<string | undefined>();

  /** @zh 提示出现的位置，mouse 表示跟随鼠标 @en The placement of the tooltip, mouse means following the cursor @defaultValue 'top' @values mouse, top, left, right, bottom, top-left, top-right, bottom-left, bottom-right, left-top, left-bottom, right-top, right-bottom */
  readonly placement = input<TooltipPlacement>('top');

  /** 提示主题。 */
  readonly theme = input<TooltipTheme>('default');

  /** @zh 是否显示箭头 @en Whether to show the arrow @defaultValue true */
  readonly showArrow = input(true, { transform: booleanAttribute });

  /** @zh 延迟显示的毫秒数 @en Delay in milliseconds before showing @defaultValue 0 */
  readonly delay = input(0);

  /** @zh 自动消失的毫秒数，0 表示不自动消失 @en Duration in milliseconds before hiding, 0 means never @defaultValue 0 */
  readonly duration = input(0);

  /** @zh 是否禁用 @en Whether the tooltip is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 关闭时是否销毁弹层内容 @en Whether to destroy the tooltip content on close @defaultValue false */
  readonly destroyOnClose = input(false, { transform: booleanAttribute });

  /** @zh 受控的展开状态 @en Controlled visible state @defaultValue undefined */
  readonly visible = input<boolean | undefined>();

  /** @zh 弹层层级 @en The z-index of the tooltip @defaultValue undefined */
  readonly zIndex = input<number | undefined>();

  /** @zh 展开状态变化，用于双向绑定 @en Visible change event, used for two-way binding */
  readonly visibleChange = output<boolean>();

  protected readonly innerVisible = signal(false);
  protected readonly popperPlacement = signal('top');
  protected readonly panelHidden = signal(false);

  private overlayRef: OverlayRef | null = null;
  private connector: PopupConnector | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private durationTimer: ReturnType<typeof setTimeout> | null = null;
  private pointerInPanel = false;

  private readonly panelEnter = () => {
    this.pointerInPanel = true;
    this.clearHideTimer();
  };

  private readonly panelLeave = () => {
    this.pointerInPanel = false;
    this.scheduleHide();
  };

  protected readonly resolvedPlacement = computed<PopupPlacement>(() => {
    const placement = this.placement();
    return placement === 'mouse' ? 'top' : placement;
  });

  protected readonly popupClasses = computed(() =>
    ['t-popup', 't-tooltip', `t-tooltip--${this.theme()}`, this.panelHidden() ? 't-popup--hidden' : '']
      .filter(Boolean)
      .join(' '),
  );

  protected readonly contentClasses = computed(() =>
    [
      't-popup__content',
      this.content() !== undefined ? 't-popup__content--text' : '',
      this.showArrow() ? 't-popup__content--arrow' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (visible === undefined) return;
      untracked(() => {
        if (visible === this.innerVisible()) return;
        if (visible) {
          this.open();
        } else {
          this.close();
        }
      });
    });

    effect(() => {
      this.resolvedPlacement();
      untracked(() => {
        if (!this.overlayRef) return;
        this.applyPosition();
        this.overlayRef.updatePosition();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.clearTimers();
      this.overlayRef?.dispose();
      this.overlayRef = null;
    });
  }

  /** 显示提示。 */
  show(): void {
    this.open();
  }

  /** 隐藏提示。 */
  hide(): void {
    this.close();
  }

  protected handleEnter(event: MouseEvent): void {
    if (this.visible() !== undefined) return;
    if (this.disabled()) return;
    this.clearHideTimer();
    const delay = this.delay();
    if (delay <= 0) {
      this.open();
      return;
    }
    this.clearShowTimer();
    this.showTimer = setTimeout(() => this.open(), delay);
    void event;
  }

  protected handleLeave(): void {
    if (this.visible() !== undefined) return;
    if (this.pointerInPanel) return;
    this.scheduleHide();
  }

  protected handleFocus(active: boolean): void {
    if (this.visible() !== undefined) return;
    if (this.disabled()) return;
    if (active) {
      this.open();
    } else if (!this.pointerInPanel) {
      this.close();
    }
  }

  private scheduleHide(): void {
    if (this.visible() !== undefined) return;
    this.clearShowTimer();
    this.clearHideTimer();
    const delay = this.delay();
    if (delay <= 0) {
      this.close();
      return;
    }
    this.hideTimer = setTimeout(() => this.close(), delay);
  }

  private open(): void {
    if (this.disabled()) return;
    this.clearTimers();

    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        hasBackdrop: false,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
      this.overlayRef.overlayElement.addEventListener('mouseenter', this.panelEnter);
      this.overlayRef.overlayElement.addEventListener('mouseleave', this.panelLeave);
    }

    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new TemplatePortal(this.overlayTemplate(), this.viewContainerRef));
    }

    this.panelHidden.set(false);
    this.applyPosition();
    this.overlayRef.updatePosition();

    if (this.innerVisible()) return;

    this.innerVisible.set(true);
    this.visibleChange.emit(true);
    this.startDurationTimer();
  }

  private close(): void {
    this.clearTimers();
    if (!this.innerVisible()) return;
    this.innerVisible.set(false);
    this.visibleChange.emit(false);

    if (this.destroyOnClose()) {
      this.overlayRef?.detach();
      this.panelHidden.set(false);
      return;
    }
    this.panelHidden.set(true);
  }

  private startDurationTimer(): void {
    const duration = this.duration();
    if (duration <= 0) return;
    this.durationTimer = setTimeout(() => this.close(), duration);
  }

  private applyPosition(): void {
    const host = this.hostRef.nativeElement;
    const anchor = resolveAnchor((host.firstElementChild as HTMLElement | null) ?? host);
    this.connector = connectPopup(this.overlay, anchor, this.resolvedPlacement());
    this.overlayRef?.updatePositionStrategy(this.connector.strategy);
    this.popperPlacement.set(this.popperPlacementOf(this.resolvedPlacement()));
    this.connector.watch((value) => this.popperPlacement.set(value));
  }

  private popperPlacementOf(placement: PopupPlacement): string {
    const [side, align] = placement.split('-');
    if (!align) return side;
    return `${side}-${align === 'left' || align === 'top' ? 'start' : 'end'}`;
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
    if (this.durationTimer) {
      clearTimeout(this.durationTimer);
      this.durationTimer = null;
    }
  }
}
