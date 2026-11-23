import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
// 命名空间式导入：qrcode 是 CJS 包，ng-packagr 编译库时不开启 esModuleInterop，
// 默认导入（import QRCode from 'qrcode'）会被 @types/qrcode 判定为没有 default 导出。
import * as QRCode from 'qrcode';
import { cn } from '../../_utils';
import { TLoading } from '../loading/loading.component';
import { TConfigService } from '../config-provider/config-provider.service';
import {
  QR_LEVELS,
  QR_STATUSES,
  QR_TYPES,
  QRIconSize,
  QRLevel,
  QRStatus,
  QRStatusRenderContext,
  QRStatusRenderInfo,
  QRType,
  toQRIconSize,
} from './qrcode.types';

/** 二维码过期状态文案（对齐上游 `zh_CN` 语言包）。 */
const QR_TEXTS = {
  expired: '二维码已过期',
  refresh: '点击刷新',
  scanned: '二维码已扫描',
};

/**
 * 二维码。
 *
 * 编码使用 `qrcode`（与上游一致的 QR 编码语义：byte 模式 + 四档纠错级别），
 * 结构、类名与遮罩层全部来自 vendor less：
 * `vendor/tdesign-common/style/web/components/qrcode/_index.less`
 * （`.t-qrcode`、`.t-borderless`、`.t-qrcode-svg`、`.t-mask`、`.t-expired__text`、
 * `.t-expired__button`、`.t-scanned`、`.t-scanned__icon`）。
 *
 * 图标区域会把底下的模块挖空（与上游 `excavateModules` 一致），避免遮挡影响识别。
 */
@Component({
  selector: 't-qrcode',
  standalone: true,
  imports: [NgTemplateOutlet, TLoading],
  template: `
    @if (status() !== 'active') {
      <div class="t-mask" [class.t-expired]="status() === 'expired'" [class.t-scanned]="status() === 'scanned'">
        @if (statusRender(); as render) {
          <ng-container *ngTemplateOutlet="render; context: { $implicit: statusRenderInfo() }" />
        } @else {
          @switch (status()) {
            @case ('expired') {
              <p class="t-expired__text">{{ texts().expired }}</p>
              <p class="t-expired__button" (click)="handleRefresh()">
                <svg
                  class="t-icon t-icon-refresh"
                  viewBox="0 0 24 24"
                  width="1em"
                  height="1em"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                  />
                </svg>
                {{ texts().refresh }}
              </p>
            }
            @case ('scanned') {
              <p class="t-scanned">
                <svg
                  class="t-icon t-icon-check-circle-filled t-scanned__icon"
                  viewBox="0 0 24 24"
                  width="1em"
                  height="1em"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM7.49985 10.5858L10.4999 13.5858L16.4999 7.58578L17.9141 8.99999L10.4999 16.4142L6.08564 12L7.49985 10.5858Z"
                  />
                </svg>
                {{ texts().scanned }}
              </p>
            }
            @default {
              <t-loading />
            }
          }
        }
      </div>
    }

    @if (type() === 'svg') {
      <svg
        [attr.viewBox]="'0 0 ' + cellsCount() + ' ' + cellsCount()"
        style="width: 100%; height: 100%; display: block"
        role="img"
        aria-hidden="true"
      >
        @if (bgColor()) {
          <path
            [attr.fill]="bgColor()"
            [attr.d]="'M0,0 h' + cellsCount() + 'v' + cellsCount() + 'H0z'"
            shape-rendering="crispEdges"
          />
        }
        <path [attr.fill]="foreground()" [attr.d]="svgPath()" shape-rendering="crispEdges" />
        @if (iconSource()) {
          <image
            [attr.href]="iconSource()"
            [attr.x]="iconBox()?.x"
            [attr.y]="iconBox()?.y"
            [attr.width]="iconBox()?.width"
            [attr.height]="iconBox()?.height"
          />
        }
      </svg>
    } @else {
      <canvas #canvas></canvas>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[style]': 'hostStyle()',
  },
})
export class TQRCode {
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly iconImage = signal<HTMLImageElement | null>(null);

  private readonly drawVersion = signal(0);

  private readonly config = inject(TConfigService);

  /**
   * 状态遮罩文案：优先取 `t-config-provider` 注入的 `globalConfig.qrcode`，
   * 未配置时回退到内置中文文案（上游 `zh_CN` 语言包）。
   */
  protected readonly texts = computed(() => {
    const qrConfig = this.config.config().qrcode;
    return {
      expired: qrConfig?.expiredText ?? QR_TEXTS.expired,
      refresh: qrConfig?.refreshText ?? QR_TEXTS.refresh,
      scanned: qrConfig?.scannedText ?? QR_TEXTS.scanned,
    };
  });

  /** 背景色。 @zh 背景色 @en Background color @defaultValue '' */
  readonly bgColor = input<string>('');

  /** 是否无边框。 @zh 无边框 @en Borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** 前景色。 @zh 前景色 @en Foreground color @defaultValue '' */
  readonly color = input<string>('');

  /** 二维码中间的图标地址。 @zh 图标地址 @en Icon URL @defaultValue '' */
  readonly icon = input<string>('');

  /** 图标尺寸。 @zh 图标尺寸 @en Icon size @defaultValue 40 */
  readonly iconSize = input<number | QRIconSize, unknown>(40, { transform: toQRIconSize });

  /** 纠错级别。 @zh 纠错级别 @en Error correction level @defaultValue 'M' @values L, M, Q, H */
  readonly level = input<QRLevel>('M');

  /** 二维码大小（包含内边距）。 @zh 尺寸 @en Size @defaultValue 160 */
  readonly size = input(160);

  /** 二维码状态。 @zh 状态 @en Status @defaultValue 'active' @values active, expired, loading, scanned */
  readonly status = input<QRStatus>('active');

  /** 自定义状态区域内容。 @zh 自定义状态内容 @en Custom status content @defaultValue undefined */
  readonly statusRender = input<TemplateRef<QRStatusRenderContext> | undefined>();

  /** 渲染方式。 @zh 渲染方式 @en Render type @defaultValue 'canvas' @values canvas, svg */
  readonly type = input<QRType>('canvas');

  /** 二维码内容。 @zh 二维码内容 @en QR code value @defaultValue '' */
  readonly value = input<string>('');

  /** 状态为过期时点击刷新的回调。 @zh 刷新 @en Refresh */
  readonly refresh = output<void>();

  protected readonly classes = computed(() =>
    cn('t-qrcode', {
      't-borderless': this.borderless(),
      't-qrcode-svg': this.type() === 'svg',
    }),
  );

  protected readonly hostStyle = computed(() => {
    const style: Record<string, string> = {
      width: `${this.size()}px`,
      height: `${this.size()}px`,
    };
    if (this.bgColor()) {
      style['background-color'] = this.bgColor();
    }
    return style;
  });

  /** 未挖空的模块矩阵；内容为空或编码失败时为 `null`。 */
  private readonly modules = computed<boolean[][] | null>(() => {
    const value = this.value();
    if (!value) {
      return null;
    }
    try {
      const qr = QRCode.create(value, { errorCorrectionLevel: this.level() });
      const numCells = qr.modules.size;
      const data = qr.modules.data;
      const rows: boolean[][] = [];
      for (let row = 0; row < numCells; row += 1) {
        const cells: boolean[] = [];
        for (let col = 0; col < numCells; col += 1) {
          cells.push(Boolean(data[row * numCells + col]));
        }
        rows.push(cells);
      }
      return rows;
    } catch {
      return null;
    }
  });

  protected readonly cellsCount = computed(() => this.modules()?.length ?? 0);

  /** 图标在模块坐标系里的位置。 */
  protected readonly iconBox = computed(() => {
    const modules = this.modules();
    if (!modules || !this.icon()) {
      return null;
    }
    const numCells = modules.length;
    const boxSize = this.iconSize();
    const width = typeof boxSize === 'number' ? boxSize : (boxSize.width ?? 40);
    const height = typeof boxSize === 'number' ? boxSize : (boxSize.height ?? 40);
    const scale = numCells / this.size();
    const moduleWidth = width * scale;
    const moduleHeight = height * scale;
    return {
      x: (numCells - moduleWidth) / 2,
      y: (numCells - moduleHeight) / 2,
      width: moduleWidth,
      height: moduleHeight,
    };
  });

  /** 实际绘制的模块矩阵：有图标时把图标区域挖空。 */
  protected readonly drawMatrix = computed<boolean[][] | null>(() => {
    const modules = this.modules();
    if (!modules) {
      return null;
    }
    const box = this.iconBox();
    if (!box) {
      return modules;
    }
    return modules.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (!cell) {
          return false;
        }
        const insideX = colIndex + 0.5 >= box.x && colIndex + 0.5 <= box.x + box.width;
        const insideY = rowIndex + 0.5 >= box.y && rowIndex + 0.5 <= box.y + box.height;
        return !(insideX && insideY);
      }),
    );
  });

  protected readonly svgPath = computed(() => {
    const modules = this.drawMatrix();
    if (!modules) {
      return '';
    }
    let path = '';
    for (let row = 0; row < modules.length; row += 1) {
      const cells = modules[row];
      for (let col = 0; col < cells.length; col += 1) {
        if (cells[col]) {
          path += `M${col} ${row}h1v1h-1z`;
        }
      }
    }
    return path;
  });

  protected readonly iconSource = computed(() => (this.type() === 'svg' ? this.icon() || undefined : undefined));

  protected readonly foreground = computed(
    () => this.color() || this.readCssVariable('--td-text-color-primary') || '#000000',
  );

  protected readonly statusRenderInfo = computed<QRStatusRenderInfo>(() => ({
    status: this.status(),
    onRefresh: () => this.handleRefresh(),
  }));

  constructor() {
    effect(() => {
      const matrix = this.drawMatrix();
      const canvas = this.canvasRef()?.nativeElement;
      // 这些信号参与绘制，显式读取以建立依赖关系。
      this.size();
      this.bgColor();
      this.color();
      this.drawVersion();
      this.iconImage();
      if (!canvas || !matrix) {
        return;
      }
      this.paint(canvas, matrix);
    });

    effect(() => {
      const src = this.icon();
      if (!src || typeof window === 'undefined') {
        this.iconImage.set(null);
        return;
      }
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        this.iconImage.set(image);
        this.drawVersion.update((version) => version + 1);
      };
      image.onerror = () => this.iconImage.set(null);
      image.src = src;
    });
  }

  protected handleRefresh(): void {
    this.refresh.emit();
  }

  private paint(canvas: HTMLCanvasElement, matrix: boolean[][]): void {
    const size = this.size();
    const pixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    const bufferSize = Math.max(1, Math.round(size * pixelRatio));
    canvas.width = bufferSize;
    canvas.height = bufferSize;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, bufferSize, bufferSize);

    const background = this.bgColor() || this.readCssVariable('--td-bg-color-specialcomponent');
    if (background && background !== 'transparent') {
      context.fillStyle = background;
      context.fillRect(0, 0, bufferSize, bufferSize);
    }

    const numCells = matrix.length;
    const scale = bufferSize / numCells;
    context.fillStyle = this.foreground();
    for (let row = 0; row < numCells; row += 1) {
      const cells = matrix[row];
      for (let col = 0; col < numCells; col += 1) {
        if (cells[col]) {
          context.fillRect(
            Math.floor(col * scale),
            Math.floor(row * scale),
            Math.ceil(scale),
            Math.ceil(scale),
          );
        }
      }
    }

    const box = this.iconBox();
    const image = this.iconImage();
    if (box && image) {
      const inset = Math.max(2, bufferSize * 0.02);
      const width = box.width * scale - inset * 2;
      const height = box.height * scale - inset * 2;
      if (width > 0 && height > 0) {
        context.fillStyle = background && background !== 'transparent' ? background : '#ffffff';
        context.fillRect(box.x * scale + inset, box.y * scale + inset, width, height);
        context.drawImage(image, box.x * scale + inset, box.y * scale + inset, width, height);
      }
    }
  }

  private readCssVariable(name: string): string {
    if (typeof window === 'undefined') {
      return '';
    }
    const element = this.host.nativeElement;
    const computed = window.getComputedStyle(element).getPropertyValue(name);
    return computed.trim();
  }
}

export { QR_LEVELS, QR_STATUSES, QR_TYPES };
