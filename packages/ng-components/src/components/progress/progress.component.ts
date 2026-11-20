import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import {
  PROGRESS_CIRCLE_SIZE_PX,
  PROGRESS_STATUSES,
  PROGRESS_THEMES,
  ProgressStatus,
  ProgressTheme,
} from './progress.types';

type ProgressColor = string | string[] | Record<string, string>;

const CIRCLE_SIZES: Record<string, number> = {
  small: PROGRESS_CIRCLE_SIZE_PX.small,
  medium: PROGRESS_CIRCLE_SIZE_PX.medium,
  large: PROGRESS_CIRCLE_SIZE_PX.large,
};

/**
 * 把 `color` 归一成 CSS 背景值：字符串直接使用，数组与对象转成线性渐变。
 */
function backgroundColorOf(color: ProgressColor | undefined): string | null {
  if (!color) {
    return null;
  }
  if (typeof color === 'string') {
    return color;
  }
  if (Array.isArray(color)) {
    if (color.length === 0) {
      return null;
    }
    if (color.length === 1) {
      return color[0];
    }
    const stops = color.map(
      (item, index) => `${item} ${Math.round((index / (color.length - 1)) * 100)}%`,
    );
    return `linear-gradient(90deg, ${stops.join(', ')})`;
  }
  const stops = Object.entries(color)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([position, item]) => `${item} ${position}`);
  return stops.length ? `linear-gradient(90deg, ${stops.join(', ')})` : null;
}

/**
 * 进度条。
 *
 * ```html
 * <t-progress [percentage]="40" />
 * <t-progress theme="circle" size="large" [percentage]="70" status="warning" />
 * ```
 */
@Component({
  selector: 't-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './progress.component.html',
})
export class TProgress {
  /** @zh 进度百分比，0 - 100 @en Progress percentage, 0 - 100 @defaultValue 0 */
  readonly percentage = input<number>(0);

  /** @zh 进度条主题 @en Progress theme @defaultValue 'line' @values line, plump, circle */
  readonly theme = input<ProgressTheme>('line');

  /** @zh 进度条状态，不传时百分比达到 100 自动显示为 success @en Progress status; falls back to success when percentage reaches 100 @defaultValue undefined @values success, error, warning, active */
  readonly status = input<ProgressStatus | undefined>();

  /** @zh 进度条颜色，支持单色、渐变色数组与按百分比分段的颜色对象 @en Progress color: a color, a gradient array or a record keyed by percentage @defaultValue undefined */
  readonly color = input<ProgressColor | undefined>();

  /** @zh 轨道颜色 @en Track color @defaultValue undefined */
  readonly trackColor = input<string | undefined>();

  /** @zh 线宽，line / plump 下为高度，circle 下为圆环宽度 @en Stroke width @defaultValue undefined */
  readonly strokeWidth = input<string | number | undefined>();

  /** @zh 尺寸，circle 支持 small / medium / large 或自定义像素，line / plump 支持 small @en Size: small / medium / large or custom px for circle, small for line / plump @defaultValue undefined */
  readonly size = input<string | number | undefined>();

  /** @zh 标签内容，传 false 隐藏标签 @en Label content, false hides the label @defaultValue true */
  readonly label = input<string | boolean | undefined>(undefined);

  protected readonly themes = PROGRESS_THEMES;
  protected readonly statuses = PROGRESS_STATUSES;

  protected readonly isCircle = computed(() => this.theme() === 'circle');
  protected readonly isPlump = computed(() => this.theme() === 'plump');
  protected readonly isSmall = computed(() => this.size() === 'small');

  protected readonly lineClasses = computed(() =>
    [
      't-progress--thin',
      `t-progress--status--${this.statusName()}`,
      this.isSmall() ? 't-size-s' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly plumpClasses = computed(() =>
    [
      't-progress__bar',
      't-progress--plump',
      this.plumpInfoInside() ? 't-progress--over-ten' : 't-progress--under-ten',
      `t-progress--status--${this.statusName()}`,
      this.isSmall() ? 't-size-s' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly circleClasses = computed(() =>
    ['t-progress--circle', `t-progress--status--${this.statusName()}`].join(' '),
  );

  /** 状态类名：未传 status 时百分比到 100 自动变成功态。 */
  protected readonly statusName = computed(
    () => this.status() ?? (this.percentage() >= 100 ? 'success' : 'default'),
  );

  /** 标签是否显示。 */
  protected readonly showLabel = computed(() => this.label() !== false);

  /** 标签文本。 */
  protected readonly labelText = computed(() => {
    const label = this.label();
    return typeof label === 'string' && label ? label : `${this.percentage()}%`;
  });

  /** 状态图标是否替换标签文本（plump 主题始终显示文本）。 */
  protected readonly statusIcon = computed(() => {
    if (this.label() === false || this.isPlump()) {
      return null;
    }
    const status = this.status();
    return status === 'success' || status === 'warning' || status === 'error' ? status : null;
  });

  /** plump 主题下标签是否内嵌在进度条里。 */
  protected readonly plumpInfoInside = computed(() => this.percentage() >= 10);

  protected readonly barStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = { width: `${this.percentage()}%` };
    const background = backgroundColorOf(this.color());
    if (background) {
      style['background'] = background;
    }
    return style;
  });

  protected readonly trackStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {};
    const strokeWidth = this.strokeWidth();
    if (strokeWidth !== undefined && strokeWidth !== '') {
      const height = typeof strokeWidth === 'number' ? `${strokeWidth}px` : strokeWidth;
      style['height'] = height;
      style['borderRadius'] = height;
    }
    const trackColor = this.trackColor();
    if (trackColor) {
      style['backgroundColor'] = trackColor;
    }
    return style;
  });

  /** 环形直径。 */
  protected readonly diameter = computed(() => {
    const size = this.size();
    if (size === undefined || size === '') {
      return PROGRESS_CIRCLE_SIZE_PX.medium;
    }
    if (typeof size === 'number') {
      return size > 0 ? size : PROGRESS_CIRCLE_SIZE_PX.medium;
    }
    const named = CIRCLE_SIZES[size];
    if (named) {
      return named;
    }
    const custom = Number(size);
    return !Number.isNaN(custom) && custom > 0 ? custom : PROGRESS_CIRCLE_SIZE_PX.medium;
  });

  protected readonly circleStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {};
    if (!this.isCircle()) {
      return style;
    }
    const diameter = this.diameter();
    const ratio =
      diameter <= PROGRESS_CIRCLE_SIZE_PX.small
        ? 14 / PROGRESS_CIRCLE_SIZE_PX.small
        : diameter >= PROGRESS_CIRCLE_SIZE_PX.large
          ? 36 / PROGRESS_CIRCLE_SIZE_PX.large
          : 20 / PROGRESS_CIRCLE_SIZE_PX.medium;
    style['width'] = `${diameter}px`;
    style['height'] = `${diameter}px`;
    style['fontSize'] = `${diameter * ratio}px`;
    return style;
  });

  /** 圆形进度条内状态图标的基准字号，避免继承 less 里 2.4em 的圆环图标字号 */
  protected readonly circleIconSize = computed(() => Math.max(12, Math.round(this.diameter() * 0.18)));

  protected readonly circleStrokeWidth = computed(() => {
    const custom = this.strokeWidth();
    if (custom !== undefined && custom !== '') {
      return Number(custom) || 0;
    }
    return this.size() === 'small' ? 4 : 6;
  });

  protected readonly circleRadius = computed(
    () => (this.diameter() - this.circleStrokeWidth()) / 2,
  );

  protected readonly circleCenter = computed(() => this.diameter() / 2);

  protected readonly circleDashArray = computed(() => {
    const perimeter = Math.PI * 2 * this.circleRadius();
    const percent = Math.min(Math.max(this.percentage(), 0), 100) / 100;
    return `${perimeter * percent} ${perimeter * (1 - percent)}`;
  });

  protected readonly circleColorStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {};
    const color = this.color();
    if (typeof color === 'string') {
      style['stroke'] = color;
    }
    return style;
  });

  protected readonly circleTrackStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {};
    const trackColor = this.trackColor();
    if (trackColor) {
      style['stroke'] = trackColor;
    }
    return style;
  });
}
