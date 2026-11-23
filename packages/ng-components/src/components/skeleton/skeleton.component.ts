import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  OnDestroy,
  ViewEncapsulation,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { SKELETON_THEME_ROW_COLS } from './skeleton.types';
import type { SkeletonAnimation, SkeletonRowCol, SkeletonRowColObj, SkeletonTheme } from './skeleton.types';

interface SkeletonColView {
  classes: string;
  style: Record<string, string>;
  content: string;
}

/**
 * 骨架屏。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责行列结构与修饰类：
 * 根元素 `.t-skeleton`、行 `.t-skeleton__row`、列 `.t-skeleton__col` +
 * `.t-skeleton--type-{rect|circle|text}` + `.t-skeleton--animation-{gradient|flashed}`。
 */
@Component({
  selector: 't-skeleton',
  standalone: true,
  template: `
    @if (skeletonVisible()) {
      @for (row of rows(); track $index) {
        <div class="t-skeleton__row">
          @for (col of row; track $index) {
            <div [class]="col.classes" [style]="col.style">{{ col.content }}</div>
          }
        </div>
      }
    } @else {
      <ng-content />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TSkeleton implements OnDestroy {
  /** 动画效果，none 表示关闭动画。 @zh 动画效果 @en animation @defaultValue none @values gradient,flashed,none */
  animation = input<SkeletonAnimation>('none');

  /** 延迟多久后才显示骨架屏，单位毫秒；大于 0 时延迟期间展示投影的真实内容。 @zh 延迟时间 @en delay @defaultValue 0 */
  delay = input<number>(0);

  /** 是否展示骨架屏，为 false 时渲染投影的真实内容。 @zh 是否加载中 @en loading @defaultValue true */
  loading = input(true, { transform: booleanAttribute });

  /** 自定义行列结构，传入后优先于 theme 的预设结构。 @zh 行列配置 @en rowCol */
  rowCol = input<SkeletonRowCol | undefined>(undefined);

  /** 骨架屏主题，决定未传 rowCol 时使用的预设结构。 @zh 主题 @en theme @defaultValue text @values text,avatar,paragraph,avatar-text,tab,article */
  theme = input<SkeletonTheme>('text');

  /** 延迟计时是否已结束；delay 为 0 时不依赖该标记。 */
  protected readonly delayElapsed = signal(false);

  /** 最终是否渲染骨架屏：loading 为 true 且延迟计时结束。 */
  protected readonly skeletonVisible = computed(() => {
    if (!this.loading()) {
      return false;
    }
    return this.delay() <= 0 || this.delayElapsed();
  });

  /** 骨架屏阶段才挂载根类名，展示真实内容时宿主不带 `.t-skeleton`。 */
  protected readonly classes = computed(() => (this.skeletonVisible() ? 't-skeleton' : ''));

  /** 展开后的行列表，每行由若干列视图组成。 */
  protected readonly rows = computed<SkeletonColView[][]>(() => {
    const custom = this.rowCol();
    const preset = SKELETON_THEME_ROW_COLS[this.theme()] ?? SKELETON_THEME_ROW_COLS.text;
    const rowCol = custom && custom.length > 0 ? custom : preset;
    return rowCol.map((row) => this.renderRow(row));
  });

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const loading = this.loading();
      const delay = this.delay();
      this.clearTimer();
      this.delayElapsed.set(false);
      if (!loading || delay <= 0) {
        return;
      }
      this.timer = setTimeout(() => {
        this.timer = null;
        this.delayElapsed.set(true);
      }, delay);
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private renderRow(row: number | SkeletonRowColObj | SkeletonRowColObj[]): SkeletonColView[] {
    const cols: SkeletonRowColObj[] =
      typeof row === 'number'
        ? Array.from({ length: row }, () => ({ type: 'text' }) as SkeletonRowColObj)
        : Array.isArray(row)
          ? row
          : [row];
    return cols.map((col) => this.renderCol(col));
  }

  private renderCol(obj: SkeletonRowColObj): SkeletonColView {
    const classes = ['t-skeleton__col', `t-skeleton--type-${obj.type ?? 'text'}`];
    const animation = this.animation();
    if (animation !== 'none') {
      classes.push(`t-skeleton--animation-${animation}`);
    }
    return {
      classes: classes.join(' '),
      style: this.colStyle(obj),
      content: obj.content ?? '',
    };
  }

  private colStyle(obj: SkeletonRowColObj): Record<string, string> {
    const style: Record<string, string> = {};
    const width = this.cssValue(obj.width);
    const height = this.cssValue(obj.height);
    const size = this.cssValue(obj.size);
    const marginRight = this.cssValue(obj.marginRight);
    const marginLeft = this.cssValue(obj.marginLeft);
    const margin = this.cssValue(obj.margin);

    if (width !== undefined) {
      style['width'] = width;
    }
    if (height !== undefined) {
      style['height'] = height;
    }
    if (marginRight !== undefined) {
      style['margin-right'] = marginRight;
    }
    if (marginLeft !== undefined) {
      style['margin-left'] = marginLeft;
    }
    if (margin !== undefined) {
      style['margin'] = margin;
    }
    // size 同时作为宽高，circle 头像常用。
    if (size !== undefined) {
      style['width'] = size;
      style['height'] = size;
    }
    return style;
  }

  private cssValue(value?: string | number): string | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return typeof value === 'number' ? `${value}px` : value;
  }
}
