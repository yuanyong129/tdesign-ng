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
  numberAttribute,
} from '@angular/core';

/** 水印的排布方式，`rectangular` 平铺、`hexagonal` 交错。 */
export const WATERMARK_LAYOUTS = ['rectangular', 'hexagonal'] as const;
export type WatermarkLayout = (typeof WATERMARK_LAYOUTS)[number];

/** 水印文字的粗细，与上游 `fontWeight` 的可选值一致。 */
export const WATERMARK_FONT_WEIGHTS = ['normal', 'lighter', 'bold', 'bolder'] as const;
export type WatermarkFontWeight = (typeof WATERMARK_FONT_WEIGHTS)[number];

/** 水印里的一段文字，对应上游 `WatermarkText`。 */
export interface WatermarkText {
  /** 文字颜色，未设置时取 `--td-text-color-watermark`。 */
  fontColor?: string;
  /** 字体，未设置时是 `normal`。 */
  fontFamily?: string;
  /** 字号（px），未设置时是 16。 */
  fontSize?: number;
  /** 字重，未设置时是 `normal`。 */
  fontWeight?: WatermarkFontWeight;
  /** 文字内容。 */
  text?: string;
}

/** 水印里的一张图片，对应上游 `WatermarkImage`。 */
export interface WatermarkImage {
  /** 是否灰化后绘制。 */
  isGrayscale?: boolean;
  /** 图片地址。 */
  url?: string;
}

/** 水印内容可以是单条文字/图片，也可以是它们的数组（按 `lineSpace` 竖向排布）。 */
export type WatermarkItem = WatermarkText | WatermarkImage;
export type WatermarkContent = WatermarkItem | WatermarkItem[];

/** 水印内容的富文本形式：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type WatermarkNode = string | TemplateRef<unknown> | undefined;

/** 画布绘制需要的全部参数，等价于上游 `bgImageOptions` 加上叠加层自己的几项。 */
interface WatermarkOptions {
  width: number;
  height: number;
  gapX: number;
  gapY: number;
  offsetLeft: number;
  offsetTop: number;
  rotate: number;
  alpha: number;
  watermarkContent: WatermarkContent | undefined;
  lineSpace: number;
  fontColor: string;
  layout: WatermarkLayout;
  isRepeat: boolean;
  movable: boolean;
  moveInterval: number;
  removable: boolean;
  zIndex: number | undefined;
}

/**
 * 水印。
 *
 * 结构照上游：宿主就是 `.t-watermark`（`position: relative; overflow: hidden; width: 100%`），
 * 投影内容直接放在宿主里，水印叠加层由脚本创建一个 `position: absolute` 的空 div 追加到宿主末尾，
 * 背景图是 canvas 画出来的 base64（上游 `es/watermark/watermark.mjs` 的 `generateBase64Url`，
 * 这里逐行照抄：`(gapX + width) × (gapY + height)` 的画布、按 `devicePixelRatio` 缩放、
 * `hexagonal` 时画布翻倍并交错绘制第二遍）。
 *
 * 防篡改用 `MutationObserver`（`attributes` + `childList` + `characterData` + `subtree`）：
 * 叠加层被删掉或被改属性时重新注入；`removable` 为 `true` 时不监听。
 * `movable` 时随机生成 `@keyframes watermark` 并通过 `<style>` 注入。
 * 所有浏览器 API 的调用都在 `typeof window === 'undefined'` 时早退，销毁时断开 observer、
 * 移除叠加层与注入的样式。
 */
@Component({
  selector: 't-watermark',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value) {
        {{ value }}
      }
    </ng-template>

    @if (content() !== undefined) {
      <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: content() }" />
    } @else {
      <ng-content />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    // 与上游根节点一致的内联样式（`position: relative; overflow: hidden; width: 100%`）。
    '[style.position]': '"relative"',
    '[style.overflow]': '"hidden"',
    '[style.width]': '"100%"',
  },
})
export class TWatermark {
  /** 水印的整体透明度，0 完全透明、1 完全不透明。 @zh 透明度 @en alpha @defaultValue 1 */
  readonly alpha = input<number, unknown>(1, { transform: numberAttribute });

  /** 宿主内容，未设置时使用投影内容。 @zh 内容 @en content */
  readonly content = input<WatermarkNode>(undefined);

  /** 单个水印的高度（px）。 @zh 高度 @en height */
  readonly height = input<number | undefined>(undefined);

  /** 是否平铺，为 `false` 时只画一个水印。 @zh 是否重复 @en isRepeat @defaultValue true */
  readonly isRepeat = input(true, { transform: booleanAttribute });

  /** 水印排布方式，`hexagonal` 为交错排布。 @zh 排布方式 @en layout @defaultValue rectangular @values rectangular,hexagonal */
  readonly layout = input<WatermarkLayout>('rectangular');

  /** 多行水印之间的间距（px）。 @zh 行间距 @en lineSpace @defaultValue 16 */
  readonly lineSpace = input<number, unknown>(16, { transform: numberAttribute });

  /** 是否让水印缓慢移动。 @zh 是否移动 @en movable @defaultValue false */
  readonly movable = input(false, { transform: booleanAttribute });

  /** 水印移动一轮的时间（ms），只在 `movable` 为 `true` 时生效。 @zh 移动周期 @en moveInterval @defaultValue 3000 */
  readonly moveInterval = input<number, unknown>(3000, { transform: numberAttribute });

  /** 水印在两个方向上的偏移，`[x, y]`。 @zh 偏移 @en offset */
  readonly offset = input<number[] | undefined>(undefined);

  /** 是否允许用户删除水印，为 `false` 时被删除或被改样式会自动重建。 @zh 是否允许删除 @en removable @defaultValue true */
  readonly removable = input(true, { transform: booleanAttribute });

  /** 单个水印的旋转角度（deg）。 @zh 旋转角度 @en rotate @defaultValue -22 */
  readonly rotate = input<number, unknown>(-22, { transform: numberAttribute });

  /** 水印内容，可以是文字、图片或它们的数组。 @zh 水印内容 @en watermarkContent */
  readonly watermarkContent = input<WatermarkContent | undefined>(undefined);

  /** 单个水印的宽度（px）。 @zh 宽度 @en width */
  readonly width = input<number | undefined>(undefined);

  /** 水印在水平方向上的间距（px），`movable` 为 `true` 时按 0 处理。 @zh 水平间距 @en x */
  readonly x = input<number | undefined>(undefined);

  /** 水印在垂直方向上的间距（px），`movable` 为 `true` 时按 0 处理。 @zh 垂直间距 @en y */
  readonly y = input<number | undefined>(undefined);

  /** 叠加层的层级。 @zh 层级 @en zIndex */
  readonly zIndex = input<number | undefined>(undefined);

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** 当前的水印叠加层；每次重建都会换成新的 div，与上游 `watermarkContentRef` 一致。 */
  private overlay: HTMLDivElement | null = null;

  /** `movable` 时注入的 `@keyframes watermark`。 */
  private styleElement: HTMLStyleElement | null = null;

  /** 防篡改用的观察者。 */
  private observer: MutationObserver | null = null;

  /** 自增令牌：异步的 `toDataURL` 回调只认最新一次，避免旧结果覆盖新样式。 */
  private injectToken = 0;

  /** 是否已经完成首次渲染（`afterNextRender` 之后）。 */
  private mounted = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.teardown());

    // 任一入参变化都重新生成（对应上游对 `[props, fontColor]` 的 deep watch）。
    effect(() => {
      this.buildOptions();
      if (!this.mounted) return;
      this.render();
    });

    // 等宿主与投影内容都进 DOM 再画第一版。
    afterNextRender(() => {
      this.mounted = true;
      this.render();
    });
  }

  /** 宿主类名，上游根节点的 `t-watermark`。 */
  protected readonly classes = computed(() => 't-watermark');

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: WatermarkNode): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 汇总画布与叠加层需要的参数，与上游 `bgImageOptions` 的计算逐行对齐。 */
  private buildOptions(): WatermarkOptions {
    const movable = this.movable();
    const gapX = movable ? 0 : Number(this.x());
    const gapY = movable ? 0 : Number(this.y());
    const offset = this.offset() ?? [];
    return {
      width: Number(this.width()),
      height: Number(this.height()),
      gapX,
      gapY,
      offsetLeft: offset[0] || gapX / 2,
      offsetTop: offset[1] || gapY / 2,
      rotate: movable ? 0 : this.rotate(),
      alpha: this.alpha(),
      watermarkContent: this.watermarkContent(),
      lineSpace: this.lineSpace(),
      fontColor: this.readFontColor(),
      layout: this.layout(),
      isRepeat: this.isRepeat(),
      movable,
      moveInterval: this.moveInterval(),
      removable: this.removable(),
      zIndex: this.zIndex(),
    };
  }

  /** 读 CSS 变量 `--td-text-color-watermark`，缺失时用上游的兜底色。 */
  private readFontColor(): string {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 'rgba(0,0,0,0.1)';
    }
    const value = getComputedStyle(document.documentElement).getPropertyValue('--td-text-color-watermark').trim();
    return value || 'rgba(0,0,0,0.1)';
  }

  /** 重画水印：先断开 observer（避免自己的写入触发重建），再异步出图并写叠加层。 */
  private render(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const options = this.buildOptions();
    const token = ++this.injectToken;
    this.observer?.disconnect();

    generateBase64Url(options, (url, backgroundSize) => {
      // 参数在这一轮里又变了，丢弃这次的结果。
      if (token !== this.injectToken) return;
      this.applyOverlay(url, backgroundSize, options);
      if (!options.removable) this.observe();
    });

    if (options.movable) {
      this.injectMovableStyle();
    } else {
      this.removeMovableStyle();
    }
  }

  /** 生成叠加层并写内联样式，与上游 `injectWaterMark` 里的 setStyle 完全一致。 */
  private applyOverlay(url: string, backgroundSize: { width: number } | undefined, options: WatermarkOptions): void {
    const host = this.hostEl.nativeElement;
    // 上游每次先 remove 再 create，这里保持一致：observer 已断开，不会误判成篡改。
    this.overlay?.remove();
    const overlay = document.createElement('div');
    const size = backgroundSize?.width || options.gapX + options.width;
    const repeat = options.movable ? 'no-repeat' : options.isRepeat ? 'repeat' : 'no-repeat';
    const animation = options.movable ? `watermark infinite ${(options.moveInterval * 4) / 60}s` : 'none';
    const styles = [
      'position: absolute',
      'left: 0',
      'right: 0',
      'top: 0',
      'bottom: 0',
      'width: 100%',
      'height: 100%',
      `background-size: ${size}px`,
      'pointer-events: none',
      `background-repeat: ${repeat}`,
      `background-image: url('${url}')`,
      `animation: ${animation}`,
    ];
    if (typeof options.zIndex === 'number' && !Number.isNaN(options.zIndex)) {
      styles.push(`z-index: ${options.zIndex}`);
    }
    overlay.setAttribute('style', styles.join('; '));
    host.appendChild(overlay);
    this.overlay = overlay;
  }

  /** 注入 `@keyframes watermark`，复用一个 `<style>`，避免上游每次重建都往 head 里追加一个。 */
  private injectMovableStyle(): void {
    if (typeof document === 'undefined') return;
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      document.head.appendChild(this.styleElement);
    }
    this.styleElement.textContent = randomMovingStyle();
  }

  /** 移除注入的 `@keyframes`。 */
  private removeMovableStyle(): void {
    this.styleElement?.remove();
    this.styleElement = null;
  }

  /** 监听宿主的变动：叠加层被删或被改属性时重建（对应上游的 useMutationObserver）。 */
  private observe(): void {
    if (this.observer || typeof MutationObserver === 'undefined') return;
    const host = this.hostEl.nativeElement;
    this.observer = new MutationObserver((records) => {
      if (this.removable()) return;
      for (const record of records) {
        const overlay = this.overlay;
        if (!overlay) return;
        const isRemoved = Array.from(record.removedNodes).includes(overlay);
        const isModified = record.type === 'attributes' && record.target === overlay;
        if (isRemoved || isModified) {
          this.render();
          return;
        }
      }
    });
    this.observer.observe(host, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  /** 销毁时清掉水印、样式与观察者。 */
  private teardown(): void {
    this.injectToken += 1;
    this.observer?.disconnect();
    this.observer = null;
    this.overlay?.remove();
    this.overlay = null;
    this.removeMovableStyle();
    this.mounted = false;
  }
}

/** 判断一条水印内容是不是图片。 */
function hasUrl(item: WatermarkItem): boolean {
  return typeof (item as WatermarkImage).url === 'string' && !!(item as WatermarkImage).url;
}

/**
 * 把水印画到 canvas 上并转成 base64，逐行照抄上游 `generateBase64Url`：
 * 画布尺寸 `(gapX + width) × (gapY + height)`、按 `devicePixelRatio` 放大、
 * `hexagonal` 时画布翻倍并交错绘制第二遍，图片全部 `onload` 后再 `toDataURL`。
 */
function generateBase64Url(
  options: WatermarkOptions,
  onFinish: (url: string, backgroundSize: { width: number } | undefined) => void,
): void {
  const { width, height, gapX, gapY, offsetLeft, offsetTop, rotate, alpha, watermarkContent, lineSpace, layout } = options;
  const fontColor = options.fontColor || 'rgba(0,0,0,0.1)';
  const isHexagonal = layout === 'hexagonal';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('当前环境不支持Canvas, 无法绘制水印');
    onFinish('', undefined);
    return;
  }

  const ratio = window.devicePixelRatio || 1;
  const actualBackgroundSize = { width: gapX + width };
  let canvasWidth = (gapX + width) * ratio;
  let canvasHeight = (gapY + height) * ratio;
  const markWidth = width * ratio;
  const markHeight = height * ratio;
  const dislocationRotateX = canvasWidth;
  const dislocationRotateY = canvasHeight;
  const dislocationDrawX = (gapX + width) * ratio;
  const dislocationDrawY = (gapY + height) * ratio;

  canvas.style.width = `${gapX + width}px`;
  canvas.style.height = `${gapY + height}px`;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  if (isHexagonal) {
    canvasWidth *= 2;
    canvasHeight *= 2;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    actualBackgroundSize.width = gapX + width * 2 + width / 2;
  }

  ctx.translate(offsetLeft * ratio, offsetTop * ratio);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, markWidth, markHeight);

  const drawRotate = (context: CanvasRenderingContext2D, x: number, y: number): void => {
    context.translate(x, y);
    context.rotate((Math.PI / 180) * Number(rotate));
    context.translate(-x, -y);
  };

  const drawText = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    fontWeight: string,
    fontSize: number,
    fontFamily: string,
    fillStyle: string,
  ): void => {
    context.font = `normal normal ${fontWeight} ${fontSize * ratio}px/${markHeight}px ${fontFamily}`;
    context.fillStyle = fillStyle;
    context.textAlign = 'start';
    context.textBaseline = 'top';
    context.fillText(text, x, y);
  };

  const rawContents: WatermarkItem[] = Array.isArray(watermarkContent)
    ? watermarkContent
    : watermarkContent
      ? [watermarkContent]
      : [];
  const contents: Array<WatermarkItem & { top: number }> = rawContents.map((item) => ({ ...item, top: 0 }));
  let top = 0;
  let totalImages = 0;
  let imageLoadCount = 0;

  contents.forEach((item) => {
    item.top = top;
    if (hasUrl(item)) {
      top += height;
      totalImages += isHexagonal ? 2 : 1;
    } else if ((item as WatermarkText).text) {
      top += lineSpace;
    }
  });

  const finish = (): void => onFinish(canvas.toDataURL(), actualBackgroundSize);

  const countImage = (): void => {
    imageLoadCount += 1;
    if (imageLoadCount === totalImages) finish();
  };

  const renderItem = (
    item: WatermarkItem & { top: number },
    offsetX = 0,
    offsetY = 0,
    rotateX = 0,
    rotateY = 0,
  ): void => {
    if (hasUrl(item)) {
      const image = item as WatermarkImage;
      const isGrayscale = image.isGrayscale ?? false;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = image.url as string;
      img.onload = () => {
        ctx.save();
        drawRotate(ctx, rotateX, rotateY);
        if (isGrayscale) {
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = width * ratio;
          tempCanvas.height = height * ratio;
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0, width * ratio, height * ratio);
            const imageData = tempCtx.getImageData(0, 0, width * ratio, height * ratio);
            const pixels = imageData.data;
            for (let i = 0; i < pixels.length; i += 4) {
              const lightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
              pixels[i] = lightness;
              pixels[i + 1] = lightness;
              pixels[i + 2] = lightness;
            }
            tempCtx.putImageData(imageData, 0, 0);
            ctx.drawImage(tempCanvas, offsetX, offsetY + item.top * ratio, width * ratio, height * ratio);
          }
        } else {
          ctx.drawImage(img, offsetX, offsetY + item.top * ratio, width * ratio, height * ratio);
        }
        ctx.restore();
        countImage();
      };
      // 上游没处理加载失败，失败时永远等不到 toDataURL；这里一并计数，避免水印卡死。
      img.onerror = () => countImage();
      return;
    }

    const textItem = item as WatermarkText;
    if (!textItem.text) return;
    const fontSize = textItem.fontSize ?? 16;
    const fontFamily = textItem.fontFamily ?? 'normal';
    const fontWeight = textItem.fontWeight ?? 'normal';
    const fillStyle = textItem.fontColor || fontColor;
    ctx.save();
    drawRotate(ctx, rotateX, rotateY);
    drawText(ctx, offsetX, offsetY + item.top * ratio, textItem.text, fontWeight, fontSize, fontFamily, fillStyle);
    ctx.restore();
  };

  contents.forEach((item) => renderItem(item, 0, 0, 0, 0));
  if (isHexagonal) {
    contents.forEach((item) => renderItem(item, dislocationDrawX, dislocationDrawY, dislocationRotateX, dislocationRotateY));
  }
  if (totalImages === 0) finish();
}

/** 随机生成 `@keyframes watermark`，与上游 `randomMovingStyle` 的取样与关键帧一致。 */
function randomMovingStyle(): string {
  const align = Math.floor(Math.random() * 4);
  const p1 = Math.floor(Math.random() * 70) + 30;
  const leftTopLimit = 0;
  const bottomLimit = 95;
  const rightLimit = 90;
  return `
  @keyframes watermark {
    0%   {left: ${align === 1 ? rightLimit : align === 3 ? leftTopLimit : p1}%; top: ${align === 0 ? leftTopLimit : align === 2 ? bottomLimit : p1}%;}
    25% {left: ${align === 0 ? rightLimit : align === 2 ? leftTopLimit : 100 - p1}%; top: ${align === 1 ? bottomLimit : align === 3 ? leftTopLimit : p1}%;}
    50% {left: ${align === 1 ? leftTopLimit : align === 3 ? rightLimit : 100 - p1}%; top: ${align === 0 ? bottomLimit : align === 2 ? leftTopLimit : 100 - p1}%; transform: translateX(-100%);}
    75% {left: ${align === 0 ? leftTopLimit : align === 2 ? rightLimit : p1}%; top: ${align === 1 ? leftTopLimit : align === 3 ? bottomLimit : 100 - p1}%;}
    100% {left: ${align === 1 ? rightLimit : align === 3 ? leftTopLimit : p1}%; top: ${align === 0 ? leftTopLimit : align === 2 ? bottomLimit : p1}%;}
  }
  `;
}
