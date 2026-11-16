import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { LOADING_SIZES, LoadingSize } from './loading.types';

const SIZE_CLASS: Record<LoadingSize, string> = {
  small: 't-size-s',
  medium: 't-size-m',
  large: 't-size-l',
};

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
})
export class TLoading {
  private readonly document = inject(DOCUMENT);

  private readonly destroyRef = inject(DestroyRef);

  /** @zh 是否处于加载状态 @en Whether it is loading @defaultValue true */
  readonly loading = input(true, { transform: booleanAttribute });

  /** @zh 加载提示文字 @en Loading text @defaultValue undefined */
  readonly text = input<string | undefined>();

  /** @zh 图标尺寸 @en Icon size @defaultValue 'medium' @values small, medium, large */
  readonly size = input<LoadingSize>('medium');

  /** @zh 是否全屏 @en Whether to show full screen @defaultValue false */
  readonly fullscreen = input(false, { transform: booleanAttribute });

  /** @zh 是否显示遮罩，仅全屏时生效 @en Whether to show the overlay, only works in full screen @defaultValue true */
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

  private lockTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly sizes = LOADING_SIZES;

  protected readonly visible = computed(() => this.loading() && this.delayed());

  protected readonly baseClasses = computed(() =>
    ['t-loading--center', SIZE_CLASS[this.size()], this.inheritColor() ? 't-loading--inherit-color' : '']
      .filter(Boolean)
      .join(' '),
  );

  protected readonly normalClasses = computed(() => `${this.baseClasses()} t-loading`);

  protected readonly fullscreenClasses = computed(() =>
    ['t-loading', 't-loading__fullscreen', 't-loading--center', this.showOverlay() ? 't-loading__overlay' : '']
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    // delay：打开时先等待，关闭时立刻复位
    effect((onCleanup) => {
      const loading = this.loading();
      const delay = this.delay();
      if (!loading) {
        this.delayed.set(false);
        return;
      }
      if (delay <= 0) {
        this.delayed.set(true);
        return;
      }
      const timer = setTimeout(() => this.delayed.set(true), delay);
      onCleanup(() => clearTimeout(timer));
    });

    // 全屏时锁住背景滚动（上游用的是 body 上的 t-loading--lock 类）
    effect((onCleanup) => {
      const shouldLock = this.fullscreen() && this.preventScrollThrough() && this.visible();
      if (!shouldLock) return;
      this.document.body.classList.add('t-loading--lock');
      onCleanup(() => this.document.body.classList.remove('t-loading--lock'));
    });

    this.destroyRef.onDestroy(() => {
      this.document.body.classList.remove('t-loading--lock');
      if (this.lockTimer) clearTimeout(this.lockTimer);
    });
  }
}
