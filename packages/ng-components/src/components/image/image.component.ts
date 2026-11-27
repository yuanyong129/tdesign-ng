import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
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
import { TSpace } from '../space/space.component';
import type { Content } from '../../_utils/content';

/** 图片填充容器的方式。 */
export const IMAGE_FITS = ['contain', 'cover', 'fill', 'none', 'scale-down'] as const;
export type ImageFit = (typeof IMAGE_FITS)[number];

/** 图片外框形状。 */
export const IMAGE_SHAPES = ['circle', 'round', 'square'] as const;
export type ImageShape = (typeof IMAGE_SHAPES)[number];

/** 浮层内容的显示时机，`hover` 表示鼠标移入才显示。 */
export const IMAGE_OVERLAY_TRIGGERS = ['always', 'hover'] as const;
export type ImageOverlayTrigger = (typeof IMAGE_OVERLAY_TRIGGERS)[number];

/** 图片请求的 referrer 策略，取值与 HTML 的 `referrerpolicy` 一致。 */
export const IMAGE_REFERRERPOLICIES = [
  'no-referrer',
  'no-referrer-when-downgrade',
  'origin',
  'origin-when-cross-origin',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'unsafe-url',
] as const;
export type ImageReferrerpolicy = (typeof IMAGE_REFERRERPOLICIES)[number];

/** 响应式图片的候选格式，键为 MIME 类型。 */
export interface ImageSrcset {
  'image/avif': string;
  'image/webp': string;
}

/** 图片里的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type ImageContent = Content;

/** 图片加载状态回调的参数，与上游 `onLoad` / `onError` 的 `{ e }` 对齐。 */
export interface ImageEvent {
  e: Event;
}

/** 懒加载观察器的 rootMargin，与上游 `observe(divRef, null, handler, 0)` 一致。 */
const LAZY_ROOT_MARGIN = '0px';

/**
 * 图片。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类：
 * 宿主本身就是 `.t-image__wrapper`，内部按上游顺序排布占位、相册阴影、图片、
 * 加载态、失败态与浮层内容。图片地址支持字符串与 `File`（`File` 会自动创建预览 URL）。
 */
@Component({
  selector: 't-image',
  standalone: true,
  imports: [NgTemplateOutlet, TSpace],
  templateUrl: './image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '(mouseenter)': 'handleMouseEnter()',
    '(mouseleave)': 'handleMouseLeave()',
  },
})
export class TImage {
  /** 图片描述，等价于 `<img alt>`。 @zh 图片描述 @en alt @defaultValue '' */
  readonly alt = input('');

  /** 加载失败时的提示内容，设置后替换内置图标与文案。 @zh 加载失败提示 @en error */
  readonly errorContent = input<ImageContent>(undefined, { alias: 'error' });

  /** 加载失败时使用的备用图片地址。 @zh 备用图片地址 @en fallback @defaultValue '' */
  readonly fallback = input('');

  /** 图片填充容器的方式。 @zh 图片填充方式 @en fit @defaultValue 'fill' @values contain,cover,fill,none,scale-down */
  readonly fit = input<ImageFit>('fill');

  /** 是否开启相册阴影效果。 @zh 是否开启相册阴影 @en gallery @defaultValue false */
  readonly gallery = input(false, { transform: booleanAttribute });

  /** 是否懒加载，进入视口后才请求图片。 @zh 是否懒加载 @en lazy @defaultValue false */
  readonly lazy = input(false, { transform: booleanAttribute });

  /** 加载中的提示内容，设置后替换内置图标与文案。 @zh 加载中提示 @en loading */
  readonly loading = input<ImageContent>(undefined);

  /** 鼠标悬浮时覆盖在图片上的内容。 @zh 浮层内容 @en overlay content */
  readonly overlayContent = input<ImageContent>(undefined);

  /** 浮层内容的显示时机。 @zh 浮层显示时机 @en overlay trigger @defaultValue 'always' @values always,hover */
  readonly overlayTrigger = input<ImageOverlayTrigger>('always');

  /** 图片未加载完成时显示的占位内容。 @zh 占位内容 @en placeholder */
  readonly placeholder = input<ImageContent>(undefined);

  /** 图片相对容器的对齐位置，等价于 CSS `object-position`。 @zh 图片对齐位置 @en position @defaultValue 'center' */
  readonly position = input<string>('center');

  /** 图片请求的 referrer 策略。 @zh referrer 策略 @en referrerpolicy @defaultValue 'strict-origin-when-cross-origin' @values no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,same-origin,strict-origin,strict-origin-when-cross-origin,unsafe-url */
  readonly referrerpolicy = input<ImageReferrerpolicy>('strict-origin-when-cross-origin');

  /** 图片外框形状。 @zh 图片形状 @en shape @defaultValue 'square' @values circle,round,square */
  readonly shape = input<ImageShape>('square');

  /** 图片地址，支持字符串与 `File`。 @zh 图片地址 @en src */
  readonly src = input<string | File | undefined>(undefined);

  /** 响应式图片的候选地址，按格式（`image/avif`、`image/webp`）提供。 @zh 响应式图片地址 @en srcset */
  readonly srcset = input<ImageSrcset | undefined>(undefined);

  /** 图片加载完成时触发。 @zh 图片加载完成 @en load */
  readonly load = output<ImageEvent>();

  /** 图片加载失败时触发。 @zh 图片加载失败 @en error */
  readonly error = output<ImageEvent>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly imgRef = viewChild<ElementRef<HTMLImageElement>>('image');

  /** `File` 类型的图片地址转换出的 object URL。 */
  private readonly fileUrl = signal<string | null>(null);

  /** 加载失败后回退到的 `fallback` 地址。 */
  private readonly fallbackSrc = signal<string | null>(null);

  /** 图片是否已进入视口（`lazy` 为真时使用）。 */
  private readonly lazyReady = signal(false);

  protected readonly hasError = signal(false);

  protected readonly isLoaded = signal(false);

  private readonly hovering = signal(false);

  private observer: IntersectionObserver | null = null;
  private loadedSource: string | undefined;

  protected readonly classes = computed(() =>
    [
      't-image__wrapper',
      `t-image__wrapper--shape-${this.shape()}`,
      this.gallery() ? 't-image__wrapper--gallery' : '',
      this.overlayTrigger() === 'hover' ? 't-image__wrapper--need-hover' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly imageClasses = computed(() =>
    ['t-image', `t-image--fit-${this.fit()}`, `t-image--position-${this.position()}`].join(' '),
  );

  protected readonly overlayClasses = computed(() =>
    ['t-image__overlay-content', this.overlayHidden() ? 't-image__overlay-content--hidden' : '']
      .filter(Boolean)
      .join(' '),
  );

  /** 浮层是否隐藏：只有 `overlayTrigger === 'hover'` 且鼠标不在图片上时才隐藏。 */
  private readonly overlayHidden = computed(() => this.overlayTrigger() === 'hover' && !this.hovering());

  /** 是否渲染真正的 `<img>`；未进入视口或出错时渲染空的 `.t-image` 占位。 */
  protected readonly shouldRenderImage = computed(() => {
    const shouldLoad = !this.lazy() || this.lazyReady();
    return shouldLoad && !this.hasError();
  });

  protected readonly showLoadingBox = computed(() => this.shouldRenderImage() && !this.isLoaded());

  /** 失败态提示是否由外部传入（空字符串也算传入，此时不渲染内置提示）。 */
  protected readonly hasErrorContent = computed(() => {
    const content = this.errorContent();
    return content !== undefined && content !== null;
  });

  protected readonly srcsetEntries = computed(() =>
    Object.entries(this.srcset() ?? {}).map(([type, url]) => ({ type, url })),
  );

  /** 实际交给 `<img>` 的地址：回退地址 > `File` 预览地址 > 字符串地址。 */
  protected readonly displaySrc = computed(() => {
    const fallback = this.fallbackSrc();
    if (fallback) {
      return fallback;
    }
    const fileUrl = this.fileUrl();
    if (fileUrl) {
      return fileUrl;
    }
    const src = this.src();
    return typeof src === 'string' ? src : null;
  });

  constructor() {
    effect(() => {
      const src = this.src();
      untracked(() => this.applySrc(src));
    });

    afterNextRender(() => {
      this.observeLazy();
      this.syncInitialLoad();
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
      this.releaseFileUrl();
    });
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: ImageContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  protected handleMouseEnter(): void {
    this.hovering.set(true);
  }

  protected handleMouseLeave(): void {
    this.hovering.set(false);
  }

  protected handleLoad(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    const source = image?.currentSrc || image?.src;
    // 缓存探测与原生 load 可能命中同一资源；srcset 切换到新资源时仍正常通知。
    if (this.isLoaded() && source === this.loadedSource) return;
    this.loadedSource = source;
    this.isLoaded.set(true);
    this.load.emit({ e: event });
  }

  /** 加载失败：先派发 `(error)`，有 `fallback` 时改用备用地址并回到加载态。 */
  protected handleImageError(event: Event): void {
    this.hasError.set(true);
    this.error.emit({ e: event });

    const fallback = this.fallback();
    if (fallback && this.fallbackSrc() !== fallback) {
      this.fallbackSrc.set(fallback);
      this.hasError.set(false);
      this.isLoaded.set(false);
    }
  }

  /** 切换图片地址时重置加载状态，`File` 需要同步换成新的 object URL。 */
  private applySrc(src: string | File | undefined): void {
    this.hasError.set(false);
    this.isLoaded.set(false);
    this.loadedSource = undefined;
    this.fallbackSrc.set(null);
    this.releaseFileUrl();

    if (typeof File !== 'undefined' && src instanceof File) {
      this.fileUrl.set(URL.createObjectURL(src));
      return;
    }
    this.fileUrl.set(null);
  }

  private releaseFileUrl(): void {
    const url = this.fileUrl();
    if (!url) {
      return;
    }
    URL.revokeObjectURL(url);
    this.fileUrl.set(null);
  }

  /** `lazy` 时进入视口才请求图片，等价于上游的 `IntersectionObserver`。 */
  private observeLazy(): void {
    if (!this.lazy()) {
      this.lazyReady.set(true);
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      this.lazyReady.set(true);
      return;
    }
    if (this.observer) {
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.lazyReady.set(true);
          this.observer?.disconnect();
          this.observer = null;
        }
      },
      { rootMargin: LAZY_ROOT_MARGIN },
    );
    this.observer.observe(this.hostEl.nativeElement);
  }

  /**
   * 图片来自缓存时不会再触发 `load`，此时补一次 `(load)`，
   * 与上游 `onMounted` 里判断 `imgRef.complete` 的行为一致。
   */
  private syncInitialLoad(): void {
    const image = this.imgRef()?.nativeElement;
    if (!image || this.lazy() || !image.complete || image.naturalWidth === 0) {
      return;
    }
    const event = new Event('load');
    Object.defineProperty(event, 'target', { value: image, enumerable: true });
    this.handleLoad(event);
  }
}
