import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TDialog, TDialogFooterSlot } from '../dialog/dialog.component';
import { DialogCloseEvent, DialogCloseTrigger } from '../dialog/dialog.types';
import { TImage } from '../image/image.component';
import { TTooltip } from '../tooltip/tooltip.component';
import type { Content } from '../../_utils/content';

/** 预览器的展示形态。 */
export const IMAGE_VIEWER_MODES = ['modal', 'modeless'] as const;
export type ImageViewerMode = (typeof IMAGE_VIEWER_MODES)[number];

/** 预览图片的 referrer 策略，取值与 HTML 的 `referrerpolicy` 一致。 */
export const IMAGE_VIEWER_REFERRERPOLICIES = [
  'no-referrer',
  'no-referrer-when-downgrade',
  'origin',
  'origin-when-cross-origin',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'unsafe-url',
] as const;
export type ImageViewerReferrerpolicy = (typeof IMAGE_VIEWER_REFERRERPOLICIES)[number];

/** 缩放的取值范围与步长。 */
export interface ImageScale {
  max: number;
  min: number;
  step: number;
  defaultScale: number;
}

/** 单张图片的信息，除图片地址外还可以指定缩略图与是否允许下载。 */
export interface ImageInfo {
  mainImage: string | File;
  thumbnail?: string | File;
  download?: boolean;
  isSvg?: boolean;
}

/** 预览器接收的图片：地址、`File` 或完整的图片信息。 */
export type ImageViewerImage = string | File | ImageInfo;

/** 预览器里的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type ImageViewerContent = Content;

/** 关闭来源。 */
export type ImageViewerCloseTrigger = 'close-btn' | 'overlay' | 'esc';

/** 关闭事件参数，与上游 `onClose` 的 `{ trigger, e }` 对齐。 */
export interface ImageViewerCloseEvent {
  trigger: ImageViewerCloseTrigger;
  e: MouseEvent | KeyboardEvent;
}

/** 切换图片的来源。 */
export type ImageViewerIndexTrigger = 'prev' | 'next' | 'current';

/** 当前图片变化事件参数，与上游 `onIndexChange` 的 `(index, { trigger })` 对齐。 */
export interface ImageViewerIndexChangeEvent {
  index: number;
  trigger: ImageViewerIndexTrigger;
}

/** 上游 `DEFAULT_IMAGE_SCALE`，`imageScale` 未设置的字段用它补全。 */
const DEFAULT_IMAGE_SCALE: ImageScale = { max: 2, min: 0.5, step: 0.2, defaultScale: 1 };

/** 镜像的初始值，点击一次切到反方向。 */
const MIRROR_DEFAULT = 1;

/** 每次点击旋转的角度。 */
const ROTATE_DEG = -90;

/** 关闭动画时长，与 vendor less 里 `.t-image-viewer-preview-image` 的动画一致。 */
const CLOSE_ANIMATION_MS = 200;

/** 缩放过渡的兜底时长，与 `.t-image-viewer__modal-box--transitioning` 的 transition 一致。 */
const TRANSITION_FALLBACK_MS = 350;

/** 未设置 `zIndex` 时的层级，与上游一致。 */
const DEFAULT_Z_INDEX = 3000;

/** 弹窗形态（`modeless`）里预览器对话框的宽度，与上游一致。 */
const MODELESS_DIALOG_WIDTH = 1000;

/** 工具条与默认文案，取上游 zh-CN 语言包。 */
const MIRROR_TIP = '镜像';
const ROTATE_TIP = '旋转';
const ORIGINAL_SIZE_TIP = '原始大小';
const PREVIEW_TEXT = '预览';
const ERROR_TEXT = '图片加载失败，可尝试重新加载';

/** 可选布尔：不传时保持 undefined，便于区分「未设置」与 false。 */
const optionalBoolean = (value: unknown): boolean | undefined =>
  value === undefined || value === null || value === '' ? undefined : booleanAttribute(value);

/** 可选数字：不传时保持 undefined。 */
const optionalNumber = (value: unknown): number | undefined =>
  value === undefined || value === null || value === '' ? undefined : numberAttribute(value);

/** 判断一个取值是不是 `File`，同时兼容没有 `File` 全局变量的环境。 */
function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

/** 把上游的 `images` 归一化成 `ImageInfo`，纯地址与 `File` 默认允许下载。 */
function formatImages(images: ImageViewerImage[]): ImageInfo[] {
  return images.map((item) => {
    if (typeof item === 'string') {
      return { mainImage: item, thumbnail: item, download: true };
    }
    if (isFile(item)) {
      return { mainImage: item, thumbnail: item, download: true };
    }
    return { download: true, thumbnail: item.mainImage, ...item };
  });
}

function clampScale(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getEventCoords(event: MouseEvent | TouchEvent): { pageX: number; pageY: number } | null {
  if ('touches' in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return touch ? { pageX: touch.pageX, pageY: touch.pageY } : null;
  }
  return { pageX: event.pageX, pageY: event.pageY };
}

function isSameOrigin(url: string): boolean {
  try {
    return new URL(url, location.href).origin === location.origin;
  } catch {
    return false;
  }
}

/** 从地址里取文件名，去掉查询串与哈希。 */
function fileNameOf(url: string): string {
  const clean = url.split('#')[0]?.split('?')[0] ?? '';
  const name = clean.slice(clean.lastIndexOf('/') + 1);
  return name || 'image.png';
}

/**
 * 图片预览。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`）：`modal`（默认）渲染全屏
 * `.t-image-viewer-preview-image` 遮罩层，`modeless` 复用 `t-dialog` 的弹窗形态。
 * 支持缩放、旋转、镜像、拖拽、滚轮缩放、键盘操作与下载。
 */
@Component({
  selector: 't-image-viewer',
  standalone: true,
  imports: [NgTemplateOutlet, TDialog, TDialogFooterSlot, TImage, TTooltip],
  templateUrl: './image-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TImageViewer {
  /** 关闭按钮：`false` 隐藏，字符串或模板替换默认图标。 @zh 关闭按钮 @en close button @defaultValue true */
  readonly closeBtn = input<boolean | ImageViewerContent>(true);

  /** 是否允许按 Esc 关闭。 @zh 是否允许按 Esc 关闭 @en close on esc @defaultValue true */
  readonly closeOnEscKeydown = input(true, { transform: booleanAttribute });

  /** 是否允许点击遮罩关闭。 @zh 是否允许点击遮罩关闭 @en close on overlay @defaultValue false */
  readonly closeOnOverlay = input(false, { transform: booleanAttribute });

  /** 是否允许拖拽图片，`false` 时禁止拖动。 @zh 是否允许拖拽 @en draggable */
  readonly draggable = input<boolean | undefined>(undefined);

  /** 预览图片的 referrer 策略。 @zh referrer 策略 @en image referrerpolicy @values no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,same-origin,strict-origin,strict-origin-when-cross-origin,unsafe-url */
  readonly imageReferrerpolicy = input<ImageViewerReferrerpolicy | undefined>(undefined);

  /** 缩放配置，未设置的字段用 `{ max: 2, min: 0.5, step: 0.2, defaultScale: 1 }` 补全。 @zh 缩放配置 @en image scale */
  readonly imageScale = input<Partial<ImageScale> | undefined>(undefined);

  /** 图片列表，支持地址、`File` 与图片信息对象。 @zh 图片列表 @en images @defaultValue [] */
  readonly images = input<ImageViewerImage[]>([]);

  /** 当前图片的序号，受控用法。 @zh 当前图片序号 @en index */
  readonly index = input<number | undefined>(undefined);

  /** 当前图片序号的初始值。 @zh 当前图片序号初始值 @en default index @defaultValue 0 */
  readonly defaultIndex = input(0, { transform: numberAttribute });

  /** 展示形态，`modeless` 用对话框承载预览。 @zh 展示形态 @en mode @defaultValue 'modal' @values modal,modeless */
  readonly mode = input<ImageViewerMode>('modal');

  /** 左右切换箭头：`false` 隐藏，字符串或模板替换默认图标。 @zh 切换箭头 @en navigation arrow @defaultValue true */
  readonly navigationArrow = input<boolean | ImageViewerContent>(true);

  /** 是否显示遮罩，未设置时 `modal` 形态显示、`modeless` 形态不显示。 @zh 是否显示遮罩 @en show overlay */
  readonly showOverlay = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  /** 标题，默认显示「当前序号/总数」。 @zh 标题 @en title */
  readonly title = input<ImageViewerContent>(undefined);

  /** 自定义触发器，模板可用 `let-open="open"` 拿到打开方法。 @zh 自定义触发器 @en trigger */
  readonly trigger = input<ImageViewerContent>(undefined);

  /** 是否显示预览器，受控用法。 @zh 是否显示预览器 @en visible */
  readonly visible = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  /** 是否默认显示预览器。 @zh 是否默认显示 @en default visible @defaultValue false */
  readonly defaultVisible = input(false, { transform: booleanAttribute });

  /** 预览器的层级。 @zh 层级 @en z index */
  readonly zIndex = input<number | undefined, unknown>(undefined, { transform: optionalNumber });

  /** 显示状态变化，用于双向绑定。 @zh 显示状态变化 @en visible change */
  readonly visibleChange = output<boolean>();

  /** 关闭时触发，携带关闭来源。 @zh 关闭 @en close */
  readonly close = output<ImageViewerCloseEvent>();

  /** 当前图片变化时触发，携带切换来源。 @zh 当前图片变化 @en index change */
  readonly indexChange = output<ImageViewerIndexChangeEvent>();

  /** 点击下载按钮时触发，参数为图片地址或 `File`。 @zh 下载 @en download */
  readonly download = output<string | File>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly overlayRoot = viewChild<ElementRef<HTMLElement>>('overlayRoot');
  private readonly modalBox = viewChild<ElementRef<HTMLElement>>('modalBox');

  protected readonly innerVisible = signal(false);

  private readonly innerIndex = signal(0);

  private readonly isExpand = signal(true);

  private readonly animationEnd = signal(true);

  private readonly scale = signal(DEFAULT_IMAGE_SCALE.defaultScale);

  private readonly rotate = signal(0);

  private readonly mirror = signal(MIRROR_DEFAULT);

  protected readonly translate = signal({ x: 0, y: 0 });

  protected readonly loaded = signal(false);

  protected readonly imageFailed = signal(false);

  /** `File` 图片的 object URL 缓存，销毁时统一释放。 */
  private readonly fileUrls = new Map<File, string>();

  private readonly urlsVersion = signal(0);

  private animationTimer: ReturnType<typeof setTimeout> | null = null;

  private transitionTimer: ReturnType<typeof setTimeout> | null = null;

  private dragCleanup: (() => void) | null = null;

  private closeHandled = false;

  private pinchDistance = 0;

  private readonly keydownHandler = (event: KeyboardEvent): void => this.handleKeydown(event);

  private readonly touchStartHandler = (event: TouchEvent): void => this.handleTouchStart(event);

  private readonly touchMoveHandler = (event: TouchEvent): void => this.handleTouchMove(event);

  private readonly touchEndHandler = (): void => {
    this.pinchDistance = 0;
  };

  protected readonly formattedImages = computed(() => formatImages(this.images()));

  protected readonly currentImage = computed<ImageInfo>(
    () => this.formattedImages()[this.innerIndex()] ?? { mainImage: '' },
  );

  /** 当前图片地址，`File` 会换成 object URL。 */
  protected readonly currentSrc = computed(() => {
    this.urlsVersion();
    return this.previewUrlOf(this.currentImage().mainImage);
  });

  /** 缩略图地址，有缩略图时先显示它再换成主图。 */
  protected readonly placementSrc = computed(() => {
    this.urlsVersion();
    const image = this.currentImage();
    if (!image.thumbnail) {
      return '';
    }
    const thumbnail = this.previewUrlOf(image.thumbnail);
    return thumbnail === this.currentSrc() ? '' : thumbnail;
  });

  protected readonly triggerSrc = computed(() => {
    this.urlsVersion();
    const first = this.formattedImages()[0];
    return first ? this.previewUrlOf(first.thumbnail ?? first.mainImage) : '';
  });

  protected readonly effectiveShowOverlay = computed(() => this.showOverlay() ?? this.mode() === 'modal');

  protected readonly isModeless = computed(() => this.mode() === 'modeless');

  protected readonly shouldRenderOverlay = computed(() => this.innerVisible() || !this.animationEnd());

  protected readonly overlayClasses = computed(() =>
    ['t-image-viewer', 't-image-viewer-preview-image', this.innerVisible() ? '' : 't-is-hide']
      .filter(Boolean)
      .join(' '),
  );

  protected readonly headerClasses = computed(() =>
    ['t-image-viewer__modal-header', this.isExpand() ? 't-is-show' : ''].filter(Boolean).join(' '),
  );

  protected readonly headerTransform = computed(
    () => `translateX(calc(-${this.innerIndex()} * (40px / 9 * 16 + 4px)))`,
  );

  protected readonly boxTransform = computed(
    () => `translate(${this.translate().x}px, ${this.translate().y}px) scale(${this.mirror()}, 1)`,
  );

  protected readonly imageTransform = computed(() => `rotateZ(${this.rotate()}deg) scale(${this.scale()})`);

  /** 缩放比例文案，去掉浮点误差后再拼 `%`。 */
  protected readonly scalePercent = computed(() => `${Number((this.scale() * 100).toFixed(2))}`);

  protected readonly indexLabel = computed(() => `${this.innerIndex() + 1}/${this.formattedImages().length}`);

  protected readonly titleText = computed(() => {
    const title = this.title();
    return typeof title === 'string' ? title : '';
  });

  protected readonly showCloseBtn = computed(() => this.closeBtn() !== false);

  protected readonly closeBtnContent = computed(() => {
    const value = this.closeBtn();
    return typeof value === 'boolean' ? undefined : value;
  });

  protected readonly showArrows = computed(
    () => this.navigationArrow() !== false && this.formattedImages().length > 1,
  );

  protected readonly arrowContent = computed(() => {
    const value = this.navigationArrow();
    return typeof value === 'boolean' ? undefined : value;
  });

  protected readonly previewText = PREVIEW_TEXT;

  protected readonly mirrorTip = MIRROR_TIP;

  protected readonly rotateTip = ROTATE_TIP;

  protected readonly originalSizeTip = ORIGINAL_SIZE_TIP;

  protected readonly errorText = ERROR_TEXT;

  protected readonly modelessWidth = MODELESS_DIALOG_WIDTH;

  protected readonly defaultZIndex = DEFAULT_Z_INDEX;

  /** 触发器模板里拿得到的打开方法，箭头函数保证引用稳定。 */
  protected readonly openViewer = (index?: number): void => this.open(index);

  private readonly scaleConfig = computed<ImageScale>(() => {
    const config = { ...DEFAULT_IMAGE_SCALE, ...(this.imageScale() ?? {}) };
    return {
      max: config.max,
      min: config.min,
      step: config.step,
      defaultScale: clampScale(config.defaultScale, config.min, config.max),
    };
  });

  constructor() {
    // 首次同步一次输入值，之后只在受控属性变化时跟随
    let syncedVisible = false;
    effect(() => {
      const visible = this.visible();
      const defaultVisible = this.defaultVisible();
      untracked(() => {
        if (!syncedVisible) {
          syncedVisible = true;
          this.innerVisible.set(visible ?? defaultVisible);
          return;
        }
        if (visible !== undefined && visible !== this.innerVisible()) {
          this.setVisible(visible, true);
        }
      });
    });

    let syncedIndex = false;
    effect(() => {
      const index = this.index();
      const defaultIndex = this.defaultIndex();
      untracked(() => {
        if (!syncedIndex) {
          syncedIndex = true;
          this.innerIndex.set(index ?? defaultIndex);
          return;
        }
        if (index !== undefined && index !== this.innerIndex()) {
          this.innerIndex.set(index);
        }
      });
    });

    // 图片列表变化时重建 `File` 的 object URL
    effect(() => {
      const images = this.formattedImages();
      untracked(() => this.syncFileUrls(images));
    });

    // 缩放配置变化后重置到新的默认比例
    effect(() => {
      this.imageScale();
      untracked(() => this.scale.set(this.scaleConfig().defaultScale));
    });

    // 打开时绑定键盘与触控监听，关闭立即解绑
    effect(() => {
      const visible = this.innerVisible();
      untracked(() => {
        if (visible) {
          this.bindDocumentEvents();
        } else {
          this.unbindDocumentEvents();
        }
      });
    });

    // 切换图片时重置加载态与失败态
    effect(() => {
      this.innerIndex();
      untracked(() => {
        this.loaded.set(false);
        this.imageFailed.set(false);
      });
    });

    this.destroyRef.onDestroy(() => {
      this.clearTimers();
      this.unbindDocumentEvents();
      this.dragCleanup?.();
      this.dragCleanup = null;
      for (const url of this.fileUrls.values()) {
        URL.revokeObjectURL(url);
      }
      this.fileUrls.clear();
    });
  }

  /** 打开预览器，可同时指定要显示的图片序号。 */
  open(index?: number): void {
    if (typeof index === 'number') {
      this.setIndex(index, 'current');
    }
    this.setVisible(true, true);
  }

  /** 关闭预览器。 */
  hide(): void {
    this.setVisible(false, true);
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: ImageViewerContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  protected headerBoxClasses(index: number): string {
    return ['t-image-viewer__header-box', index === this.innerIndex() ? 't-is-active' : '']
      .filter(Boolean)
      .join(' ');
  }

  protected handleThumbnailClick(index: number): void {
    this.setIndex(index, 'current');
  }

  protected handleOverlayClick(event: MouseEvent): void {
    if (!this.closeOnOverlay()) {
      return;
    }
    this.closeWith('overlay', event);
  }

  protected handleCloseBtn(event: MouseEvent): void {
    this.closeWith('close-btn', event);
  }

  protected handleDialogVisibleChange(visible: boolean): void {
    if (visible === this.innerVisible()) {
      return;
    }
    this.setVisible(visible, true);
  }

  protected handleDialogClose(event: DialogCloseEvent): void {
    this.closeWith(this.resolveDialogTrigger(event.trigger), event.event ?? new MouseEvent('click'));
  }

  protected prevImage(): void {
    this.setIndex(Math.max(0, this.innerIndex() - 1), 'prev');
  }

  protected nextImage(): void {
    this.setIndex(Math.min(this.formattedImages().length - 1, this.innerIndex() + 1), 'next');
  }

  protected toggleExpand(): void {
    this.isExpand.update((value) => !value);
  }

  protected toggleMirror(): void {
    this.mirror.update((value) => (value > 0 ? -1 : 1));
  }

  protected rotateImage(): void {
    this.rotate.update((value) => value + ROTATE_DEG);
  }

  protected zoomIn(): void {
    this.scale.set(this.nextScale(1));
  }

  protected zoomOut(): void {
    this.scale.set(this.nextScale(-1));
  }

  /** 复位缩放、旋转、镜像与位移。 */
  protected resetAll(): void {
    this.mirror.set(MIRROR_DEFAULT);
    this.scale.set(this.scaleConfig().defaultScale);
    this.rotate.set(0);
    this.translate.set({ x: 0, y: 0 });
  }

  protected handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const isZoomOut = event.deltaY > 0;
    if (!isZoomOut) {
      this.zoomIn();
      return;
    }

    const container = this.overlayRoot()?.nativeElement;
    const box = this.modalBox()?.nativeElement;
    const oldScale = this.scale();
    const nextScale = this.nextScale(-1);
    if (container && box && nextScale !== oldScale && this.isImageExceedsViewport(container, box)) {
      const ratio = nextScale / oldScale;
      const current = this.translate();
      this.enableTransition();
      this.translate.set({ x: ratio * current.x, y: ratio * current.y });
      this.scale.set(nextScale);
      return;
    }
    this.scale.set(nextScale);
  }

  protected handleImageLoad(): void {
    this.loaded.set(true);
  }

  protected handleDownload(): void {
    const source = this.currentImage().mainImage;
    this.download.emit(source);
    void this.downloadImage(source);
  }

  /** 按下鼠标或手指时开始拖拽，监听挂到 document 上，松开即解绑。 */
  protected startDrag(event: MouseEvent | TouchEvent): void {
    if (this.draggable() === false) {
      return;
    }
    if ('button' in event && event.button !== 0) {
      return;
    }
    event.stopPropagation();
    const start = getEventCoords(event);
    if (!start) {
      return;
    }
    const base = this.translate();

    const move = (moveEvent: MouseEvent | TouchEvent): void => {
      const coords = getEventCoords(moveEvent);
      if (!coords) {
        return;
      }
      this.translate.set({
        x: base.x + coords.pageX - start.pageX,
        y: base.y + coords.pageY - start.pageY,
      });
    };

    const cleanup = (): void => {
      document.removeEventListener('mousemove', move as EventListener);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('mouseleave', cleanup);
      document.removeEventListener('touchmove', move as EventListener);
      document.removeEventListener('touchend', cleanup);
      document.removeEventListener('touchcancel', cleanup);
      this.dragCleanup = null;
    };

    this.dragCleanup?.();
    this.dragCleanup = cleanup;
    document.addEventListener('mousemove', move as EventListener);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('mouseleave', cleanup);
    document.addEventListener('touchmove', move as EventListener, { passive: false });
    document.addEventListener('touchend', cleanup);
    document.addEventListener('touchcancel', cleanup);
  }

  /** 关闭来源到关闭事件的映射，供弹窗形态复用。 */
  protected resolveDialogTrigger(trigger: DialogCloseTrigger): ImageViewerCloseTrigger {
    if (trigger === 'overlay') {
      return 'overlay';
    }
    if (trigger === 'esc') {
      return 'esc';
    }
    return 'close-btn';
  }

  private setVisible(visible: boolean, emit: boolean): void {
    if (visible === this.innerVisible()) {
      return;
    }
    this.innerVisible.set(visible);
    this.clearAnimationTimer();

    if (visible) {
      this.closeHandled = false;
      this.animationEnd.set(false);
      this.resetAll();
      this.loaded.set(false);
      this.imageFailed.set(false);
      setTimeout(() => this.overlayRoot()?.nativeElement.focus());
    } else {
      this.animationTimer = setTimeout(() => this.animationEnd.set(true), CLOSE_ANIMATION_MS);
    }

    if (emit) {
      this.visibleChange.emit(visible);
    }
  }

  private closeWith(trigger: ImageViewerCloseTrigger, event: MouseEvent | KeyboardEvent): void {
    if (this.closeHandled) {
      return;
    }
    this.closeHandled = true;
    this.setVisible(false, true);
    this.close.emit({ trigger, e: event });
  }

  private setIndex(index: number, trigger: ImageViewerIndexTrigger): void {
    this.resetAll();
    this.innerIndex.set(index);
    this.loaded.set(false);
    this.imageFailed.set(false);
    this.indexChange.emit({ index, trigger });
  }

  private nextScale(direction: 1 | -1): number {
    const { min, max, step } = this.scaleConfig();
    return clampScale(this.scale() + direction * step, min, max);
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.innerVisible()) {
      return;
    }
    switch (event.code) {
      case 'ArrowLeft':
        this.prevImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'ArrowUp':
        this.zoomIn();
        break;
      case 'ArrowDown':
        this.zoomOut();
        break;
      case 'Escape':
        if (this.closeOnEscKeydown()) {
          this.closeWith('esc', event);
        }
        break;
      default:
        break;
    }
  }

  private bindDocumentEvents(): void {
    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('touchstart', this.touchStartHandler, { passive: false });
    document.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    document.addEventListener('touchend', this.touchEndHandler);
  }

  private unbindDocumentEvents(): void {
    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('touchstart', this.touchStartHandler);
    document.removeEventListener('touchmove', this.touchMoveHandler);
    document.removeEventListener('touchend', this.touchEndHandler);
    this.pinchDistance = 0;
  }

  /** 双指捏合缩放，与上游一致：距离变大放大、变小缩小。 */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 2) {
      return;
    }
    event.preventDefault();
    const [first, second] = Array.from(event.touches);
    this.pinchDistance = Math.hypot(second.pageX - first.pageX, second.pageY - first.pageY);
  }

  private handleTouchMove(event: TouchEvent): void {
    if (event.touches.length !== 2) {
      return;
    }
    event.preventDefault();
    const [first, second] = Array.from(event.touches);
    const distance = Math.hypot(second.pageX - first.pageX, second.pageY - first.pageY);
    if (distance > this.pinchDistance) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
    this.pinchDistance = distance;
  }

  /** 缩放过渡类，用时长兜底 + `transitionend` 两条路径移除。 */
  private enableTransition(): void {
    const box = this.modalBox()?.nativeElement;
    if (!box) {
      return;
    }
    this.clearTransitionTimer();
    // 读一次布局，确保过渡类加在稳定的初始位置上
    box.getBoundingClientRect();
    box.classList.add('t-image-viewer__modal-box--transitioning');
    const remove = (): void => {
      box.classList.remove('t-image-viewer__modal-box--transitioning');
      box.removeEventListener('transitionend', onEnd);
      this.clearTransitionTimer();
    };
    const onEnd = (event: TransitionEvent): void => {
      if (event.propertyName !== 'transform') {
        return;
      }
      remove();
    };
    box.addEventListener('transitionend', onEnd);
    this.transitionTimer = setTimeout(remove, TRANSITION_FALLBACK_MS);
  }

  private isImageExceedsViewport(container: HTMLElement, box: HTMLElement): boolean {
    const containerRect = container.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    return (
      boxRect.left < containerRect.left ||
      boxRect.right > containerRect.right ||
      boxRect.top < containerRect.top ||
      boxRect.bottom > containerRect.bottom
    );
  }

  private previewUrlOf(value: string | File | undefined): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    return this.fileUrls.get(value) ?? '';
  }

  /** 重建 `File` 图片的 object URL，已移除的图片及时释放。 */
  private syncFileUrls(images: ImageInfo[]): void {
    const needed = new Set<File>();
    for (const image of images) {
      if (isFile(image.mainImage)) {
        needed.add(image.mainImage);
      }
      if (isFile(image.thumbnail)) {
        needed.add(image.thumbnail);
      }
    }

    for (const [file, url] of [...this.fileUrls]) {
      if (!needed.has(file)) {
        URL.revokeObjectURL(url);
        this.fileUrls.delete(file);
      }
    }
    for (const file of needed) {
      if (!this.fileUrls.has(file)) {
        this.fileUrls.set(file, URL.createObjectURL(file));
      }
    }
    this.urlsVersion.update((version) => version + 1);
  }

  private async downloadImage(source: string | File): Promise<void> {
    if (isFile(source)) {
      this.directDownload(URL.createObjectURL(source), source.name || 'image.png');
      return;
    }
    if (!source) {
      return;
    }
    const name = fileNameOf(source);
    if (isSameOrigin(source)) {
      this.directDownload(source, name);
      return;
    }
    await this.canvasDownload(source, name);
  }

  private directDownload(url: string, name: string): void {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  /** 跨域地址直接 `download` 会被忽略，上游的做法是画到 canvas 里再导出。 */
  private canvasDownload(url: string, name: string): Promise<void> {
    return new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d')?.drawImage(image, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            this.directDownload(URL.createObjectURL(blob), name);
          }
          resolve();
        });
      };
      image.onerror = () => resolve();
      image.src = url;
    });
  }

  private clearAnimationTimer(): void {
    if (this.animationTimer !== null) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
  }

  private clearTransitionTimer(): void {
    if (this.transitionTimer !== null) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearAnimationTimer();
    this.clearTransitionTimer();
  }
}
