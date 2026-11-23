import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  untracked,
  ViewEncapsulation,
} from '@angular/core';

import { cn } from '../../_utils';

import { TSwiperItem } from './swiper-item.component';
import {
  isSwiperTemplateRef,
  SWIPER_HOST,
  SWIPER_NAVIGATION_DEFAULT,
  type SwiperAnimation,
  type SwiperChangeEvent,
  type SwiperChangeSource,
  type SwiperDirection,
  type SwiperHost,
  type SwiperItemVisual,
  type SwiperNavigation,
  type SwiperNavigationContext,
  type SwiperNavigationType,
  type SwiperTrigger,
  type SwiperType,
} from './swiper.types';
import { cardTranslateX, cardZIndex, disposeCardIndex, normalizeSwiperIndex } from './swiper.utils';

const DEFAULT_CARD_SCALE = 210 / 332;

@Component({
  selector: 't-swiper',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './swiper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': "'t-swiper'",
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
  providers: [
    {
      provide: SWIPER_HOST,
      useExisting: forwardRef(() => TSwiper),
    },
  ],
})
export class TSwiper implements SwiperHost, OnDestroy {
  /** 切换动画。 @zh 切换动画 @en animation @defaultValue slide @values slide,fade */
  readonly animation = input<SwiperAnimation>('slide');

  /** 是否自动播放。 @zh 自动播放 @en autoplay @defaultValue true */
  readonly autoplay = input(true, { transform: booleanAttribute });

  /** 卡片模式下非当前项的缩放比例。 @zh 卡片缩放比例 @en cardScale @defaultValue 0.6325301204819277 */
  readonly cardScale = input<number>(DEFAULT_CARD_SCALE);

  /** 当前轮播项的索引，受控属性。 @zh 当前索引 @en current @defaultValue undefined */
  readonly current = input<number | undefined>(undefined);

  /** 初始轮播项的索引。 @zh 默认索引 @en defaultCurrent @defaultValue 0 */
  readonly defaultCurrent = input<number>(0);

  /** 轮播方向。 @zh 轮播方向 @en direction @defaultValue horizontal @values horizontal,vertical */
  readonly direction = input<SwiperDirection>('horizontal');

  /** 切换动画时长，单位毫秒。 @zh 动画时长 @en duration @defaultValue 300 */
  readonly duration = input<number>(300);

  /** 轮播高度，单位像素，不传时使用内容高度。 @zh 轮播高度 @en height @defaultValue undefined */
  readonly height = input<number | undefined>(undefined);

  /** 自动播放的间隔时长，单位毫秒。 @zh 播放间隔 @en interval @defaultValue 5000 */
  readonly interval = input<number>(5000);

  /** 是否循环播放。 @zh 循环播放 @en loop @defaultValue true */
  readonly loop = input(true, { transform: booleanAttribute });

  /** 导航器配置，也可传入自定义导航模板。 @zh 导航器配置 @en navigation @defaultValue undefined */
  readonly navigation = input<SwiperNavigation | TemplateRef<unknown> | undefined>(undefined);

  /** 鼠标悬浮时是否暂停自动播放。 @zh 悬浮暂停 @en stopOnHover @defaultValue true */
  readonly stopOnHover = input(true, { transform: booleanAttribute });

  /** 导航点的触发方式。 @zh 导航触发方式 @en trigger @defaultValue hover @values hover,click */
  readonly trigger = input<SwiperTrigger>('hover');

  /** 轮播类型。 @zh 轮播类型 @en type @defaultValue default @values default,card */
  readonly type = input<SwiperType>('default');

  /** 切换后触发。 @zh 切换事件 @en change */
  readonly change = output<SwiperChangeEvent>();

  /** 当前索引变化时触发，支持双向绑定。 @zh 索引变化 @en currentChange */
  readonly currentChange = output<number>();

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly items = contentChildren(TSwiperItem);

  protected readonly currentIndex = signal(0);

  protected readonly total = computed(() => this.items().length);

  protected readonly paused = signal(false);

  protected readonly showArrow = signal(true);

  protected readonly dragOffset = signal(0);

  protected readonly transitionEnabled = signal(true);

  private readonly width = signal(0);

  private readonly dragging = signal(false);

  private dragStartX = 0;

  private dragStartY = 0;

  private autoplayTimer: ReturnType<typeof setTimeout> | null = null;

  private transitionTimer: ReturnType<typeof setTimeout> | null = null;

  private resizeObserver: ResizeObserver | null = null;

  protected readonly navigationConfig = computed<SwiperNavigation>(() => {
    const value = this.navigation();
    if (value !== undefined && !isSwiperTemplateRef(value)) {
      return { ...SWIPER_NAVIGATION_DEFAULT, ...value };
    }
    return SWIPER_NAVIGATION_DEFAULT;
  });

  protected readonly navigationTemplate = computed<TemplateRef<unknown> | undefined>(() => {
    const value = this.navigation();
    return isSwiperTemplateRef(value) ? value : undefined;
  });

  protected readonly navType = computed<SwiperNavigationType>(() => this.navigationConfig().type ?? 'bars');

  protected readonly navItems = computed<number[]>(() =>
    Array.from({ length: this.total() }, (_item, index) => index),
  );

  protected readonly navigationClasses = computed(() =>
    cn('t-swiper__navigation', `t-swiper__navigation-${this.navType()}`),
  );

  protected readonly wrapClasses = computed(() => {
    const navigation = this.navigationConfig();
    return cn(
      't-swiper__wrap',
      `t-swiper--${navigation.placement ?? 'inside'}`,
      this.direction() === 'vertical' ? 't-swiper--vertical' : '',
      navigation.size === 'small' ? 't-swiper--small' : '',
      navigation.size === 'large' ? 't-swiper--large' : '',
    );
  });

  protected readonly contentClasses = computed(() =>
    cn(
      't-swiper__content',
      this.animation() === 'fade' ? 't-swiper-fade' : '',
      this.type() === 'card' ? 't-swiper-card' : '',
    ),
  );

  protected readonly heightStyle = computed(() => {
    const height = this.height();
    return height === undefined ? 'auto' : `${height}px`;
  });

  protected readonly touchAction = computed(() => (this.direction() === 'vertical' ? 'pan-x' : 'pan-y'));

  protected readonly containerTransform = computed<string | null>(() => {
    if (this.animation() !== 'slide' || this.type() === 'card') return null;
    const offset = -this.currentIndex() * 100;
    const drag = this.dragOffset();
    if (this.direction() === 'vertical') {
      return `translate3d(0, calc(${offset}% + ${drag}px), 0)`;
    }
    return `translate3d(calc(${offset}% + ${drag}px), 0, 0)`;
  });

  protected readonly containerTransition = computed<string | null>(() => {
    if (this.animation() !== 'slide' || this.type() === 'card') return null;
    return this.transitionEnabled() ? `transform ${this.duration() / 1000}s ease` : 'none';
  });

  protected readonly arrowVisible = computed(
    () => this.navigationConfig().showSlideBtn !== 'never' && this.total() > 1 && this.showArrow(),
  );

  protected readonly fractionText = computed(() => {
    const total = this.total();
    const current = this.currentIndex() + 1;
    return `${current > total ? 1 : current}/${total}`;
  });

  constructor() {
    const initial = this.current() ?? this.defaultCurrent();
    this.currentIndex.set(Number.isFinite(initial) ? Math.max(0, Math.trunc(initial)) : 0);
    this.showArrow.set(this.navigationConfig().showSlideBtn === 'always');

    effect(() => {
      const current = this.current();
      if (current === undefined) return;
      untracked(() => {
        if (current !== this.currentIndex()) this.swiperTo(current, 'autoplay');
      });
    });

    effect(() => {
      const enabled = this.autoplay() && !this.paused() && this.total() > 1;
      const interval = this.interval();
      const loop = this.loop();
      const current = this.currentIndex();
      const total = this.total();
      untracked(() => this.scheduleAutoplay(enabled, interval, loop, current, total));
    });

    afterNextRender(() => {
      this.measure();
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.measure());
        this.resizeObserver.observe(this.elementRef.nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimer('autoplayTimer');
    this.clearTimer('transitionTimer');
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  itemVisual(item: unknown): SwiperItemVisual {
    const items = this.items();
    const index = items.indexOf(item as TSwiperItem);
    const base = 't-swiper__container__item';
    if (index < 0) {
      return { classes: base, transform: null, opacity: null, transition: null, zIndex: null };
    }
    const duration = this.duration();
    const current = this.currentIndex();

    if (this.animation() === 'fade') {
      const active = index === current;
      return {
        classes: cn(base, 't-swiper__fade'),
        transform: null,
        opacity: active ? '1' : '0',
        transition: `opacity ${duration / 1000}s`,
        zIndex: active ? '1' : '0',
      };
    }

    if (this.type() === 'card') {
      const disposeIndex = disposeCardIndex(index, current, items.length);
      const active = index === current;
      const cardScale = this.cardScale();
      const translateX = cardTranslateX(disposeIndex, current, this.width(), cardScale);
      return {
        classes: cn(base, 't-swiper__card', active ? 't-is-active' : ''),
        transform: `translateX(${translateX}px) scale(${active ? 1 : cardScale})`,
        opacity: null,
        transition: `transform ${duration / 1000}s ease`,
        zIndex: String(cardZIndex(disposeIndex, current)),
      };
    }

    return { classes: base, transform: null, opacity: null, transition: null, zIndex: null };
  }

  protected next(source: SwiperChangeSource): void {
    this.step(1, source);
  }

  protected prev(source: SwiperChangeSource): void {
    this.step(-1, source);
  }

  protected onNavigationEnter(index: number): void {
    if (this.trigger() !== 'hover') return;
    this.goTo(index, 'hover');
  }

  protected onNavigationClick(index: number): void {
    if (this.trigger() !== 'click') return;
    this.goTo(index, 'click');
  }

  protected navigationContext(): { $implicit: SwiperNavigationContext } {
    return { $implicit: { current: this.currentIndex(), total: this.total() } };
  }

  protected onMouseEnter(): void {
    if (this.stopOnHover()) this.paused.set(true);
    if (this.navigationConfig().showSlideBtn === 'hover') this.showArrow.set(true);
  }

  protected onMouseLeave(): void {
    if (this.stopOnHover()) this.paused.set(false);
    if (this.navigationConfig().showSlideBtn === 'hover') this.showArrow.set(false);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.total() < 2) return;
    this.dragging.set(true);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragOffset.set(0);
    this.transitionEnabled.set(false);
    const target = event.currentTarget;
    if (target instanceof HTMLElement) target.setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) return;
    this.dragOffset.set(
      this.direction() === 'vertical' ? event.clientY - this.dragStartY : event.clientX - this.dragStartX,
    );
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging()) return;
    this.dragging.set(false);
    const delta =
      this.direction() === 'vertical' ? event.clientY - this.dragStartY : event.clientX - this.dragStartX;
    const threshold = Math.max(40, this.width() * 0.15);
    this.transitionEnabled.set(true);
    this.dragOffset.set(0);
    if (Math.abs(delta) >= threshold) {
      if (delta < 0) this.next('click');
      else this.prev('click');
    }
  }

  protected onPointerCancel(): void {
    if (!this.dragging()) return;
    this.dragging.set(false);
    this.transitionEnabled.set(true);
    this.dragOffset.set(0);
  }

  private step(direction: 1 | -1, source: SwiperChangeSource): void {
    const total = this.total();
    if (total < 2) return;
    const target = this.currentIndex() + direction;
    if (!this.loop() && (target < 0 || target > total - 1)) return;
    this.swiperTo(target, source);
  }

  private goTo(index: number, source: SwiperChangeSource): void {
    const total = this.total();
    if (total < 2) return;
    this.swiperTo(index, source);
  }

  private swiperTo(index: number, source: SwiperChangeSource): void {
    const total = this.total();
    if (total === 0) return;
    const previous = this.currentIndex();
    const target = normalizeSwiperIndex(index, total);
    const isSlide = this.animation() === 'slide' && this.type() !== 'card';
    const wrapJump = isSlide && this.loop() && target !== previous && Math.abs(target - previous) > 1;
    if (isSlide) this.transitionEnabled.set(!wrapJump);
    this.currentIndex.set(target);
    if (wrapJump) {
      this.clearTimer('transitionTimer');
      this.transitionTimer = setTimeout(() => {
        this.transitionTimer = null;
        this.transitionEnabled.set(true);
      }, 30);
    }
    this.currentChange.emit(target);
    this.change.emit({ current: target, source });
  }

  private scheduleAutoplay(
    enabled: boolean,
    interval: number,
    loop: boolean,
    current: number,
    total: number,
  ): void {
    this.clearTimer('autoplayTimer');
    if (!enabled) return;
    if (!loop && current >= total - 1) return;
    this.autoplayTimer = setTimeout(() => {
      this.autoplayTimer = null;
      this.step(1, 'autoplay');
    }, Math.max(interval, 0));
  }

  private measure(): void {
    this.width.set(this.elementRef.nativeElement.clientWidth);
  }

  private clearTimer(name: 'autoplayTimer' | 'transitionTimer'): void {
    const timer = this[name];
    if (timer !== null) {
      clearTimeout(timer);
      this[name] = null;
    }
  }
}
