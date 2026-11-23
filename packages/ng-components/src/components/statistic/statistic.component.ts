import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { TSkeleton } from '../skeleton/skeleton.component';

/** 统计数值的趋势。 */
export const STATISTIC_TRENDS = ['increase', 'decrease'] as const;
export type StatisticTrend = (typeof STATISTIC_TRENDS)[number];

/** 趋势图标的位置。 */
export const STATISTIC_TREND_PLACEMENTS = ['left', 'right'] as const;
export type StatisticTrendPlacement = (typeof STATISTIC_TREND_PLACEMENTS)[number];

/** 统计数值的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type StatisticContent = string | TemplateRef<unknown> | undefined;

/**
 * 可缺省的数字输入转换：空值保持 `undefined`，其余交给 Angular 的 `numberAttribute`。
 *
 * 上游 `decimalPlaces` 的默认值是 `undefined`（不固定小数位），直接用 `numberAttribute`
 * 会把空值折叠成 `NaN`，因此这里加一层空值判断。
 */
const optionalNumberAttribute = (value: unknown): number | undefined =>
  value === null || value === undefined || value === '' ? undefined : numberAttribute(value);

/** 预设颜色与主题变量的映射，与上游 `COLOR_MAP` 一致。 */
const COLOR_MAP: Record<string, string> = {
  black: 'var(--td-text-color-primary)',
  blue: 'var(--td-brand-color)',
  red: 'var(--td-error-color)',
  orange: 'var(--td-warning-color)',
  green: 'var(--td-success-color)',
};

/**
 * 统计数值。
 *
 * 结构对齐上游 `statistic.mjs`：标题、内容（前缀 / 数值 / 单位 / 后缀）、额外说明。
 * 数值格式化按上游 `getFormatValue` 实现：`toLocaleString` 分组后把逗号换成 `separator`，
 * `decimalPlaces` 同时限定最少与最多小数位；传入 `format` 时完全由它接管。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-statistic',
  standalone: true,
  imports: [NgTemplateOutlet, TSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value) {
        {{ value }}
      }
    </ng-template>

    <ng-template #trendIcon>
      @if (trendIconName() === 'up') {
        <svg class="t-icon t-icon-arrow-triangle-up-filled" viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
          <path fill="currentColor" d="M15 12H19.5L12 2L4.5 12H9V22H15V12Z" />
        </svg>
      } @else if (trendIconName() === 'down') {
        <svg class="t-icon t-icon-arrow-triangle-down-filled" viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
          <path fill="currentColor" d="M15 12H19.5L12 22L4.5 12H9V2H15V12Z" />
        </svg>
      }
    </ng-template>

    <ng-template #contentBlock>
      <div class="t-statistic-content" [style.color]="contentColor()">
        @if (prefix() || trendInPrefix()) {
          <span class="t-statistic-content-prefix">
            @if (prefix()) {
              <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: prefix() }" />
            } @else {
              <ng-container *ngTemplateOutlet="trendIcon" />
            }
          </span>
        }
        <span class="t-statistic-content-value">{{ formatValue() }}</span>
        @if (unit()) {
          <span class="t-statistic-content-unit">
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: unit() }" />
          </span>
        }
        @if (suffix() || trendInSuffix()) {
          <span class="t-statistic-content-suffix">
            @if (suffix()) {
              <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: suffix() }" />
            } @else {
              <ng-container *ngTemplateOutlet="trendIcon" />
            }
          </span>
        }
      </div>
    </ng-template>

    @if (title()) {
      <div class="t-statistic-title">
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: title() }" />
      </div>
    }

    <!-- 上游用 Skeleton 包住内容区：加载时出骨架屏，否则直接渲染内容（不留包裹元素）。 -->
    @if (loading()) {
      <t-skeleton animation="gradient" theme="text" [loading]="true">
        <ng-container *ngTemplateOutlet="contentBlock" />
      </t-skeleton>
    } @else {
      <ng-container *ngTemplateOutlet="contentBlock" />
    }

    @if (extra()) {
      <div class="t-statistic-extra">
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: extra() }" />
      </div>
    }
  `,
  host: {
    '[class]': 'classes()',
  },
})
export class TStatistic {
  /** @zh 颜色，可传预设值（black/blue/red/orange/green）或任意颜色值 @en Color, a preset value (black/blue/red/orange/green) or any color value @defaultValue '' @values black,blue,red,orange,green */
  readonly color = input<string>('');

  /** @zh 数值的小数位数，不传时至少 0 位、最多保留 20 位 @en Decimal places of the value, defaults to at least 0 and at most 20 @defaultValue undefined */
  readonly decimalPlaces = input<number | undefined, unknown>(undefined, {
    transform: optionalNumberAttribute,
  });

  /** @zh 额外说明，显示在数值下方 @en Extra description shown below the value @defaultValue undefined */
  readonly extra = input<StatisticContent>();

  /** @zh 自定义格式化函数，传入后覆盖 decimalPlaces 与 separator 的处理 @en Custom formatter, overrides decimalPlaces and separator @defaultValue undefined */
  readonly format = input<((value: number) => number) | undefined>();

  /** @zh 是否加载中，加载时显示骨架屏 @en Whether the value is loading, a skeleton is shown while loading @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @zh 数值前缀 @en Value prefix @defaultValue undefined */
  readonly prefix = input<StatisticContent>();

  /** @zh 千分位分隔符，传空字符串可关闭分组 @en Thousands separator, pass an empty string to disable grouping @defaultValue , */
  readonly separator = input<string>(',');

  /** @zh 数值后缀 @en Value suffix @defaultValue undefined */
  readonly suffix = input<StatisticContent>();

  /** @zh 标题 @en Title @defaultValue undefined */
  readonly title = input<StatisticContent>();

  /** @zh 趋势，会渲染上 / 下箭头 @en Trend, renders an up / down arrow @defaultValue undefined @values increase,decrease */
  readonly trend = input<StatisticTrend>();

  /** @zh 趋势图标的位置，prefix / suffix 有内容时以它们为准 @en Position of the trend arrow, prefix / suffix take precedence when provided @defaultValue left @values left,right */
  readonly trendPlacement = input<StatisticTrendPlacement>('left');

  /** @zh 数值单位 @en Value unit @defaultValue undefined */
  readonly unit = input<StatisticContent>();

  /** @zh 数值 @en Value @defaultValue undefined */
  readonly value = input<number>();

  protected readonly classes = computed(() => 't-statistic');

  /** 预设颜色映射成主题变量，其余颜色原样用作 CSS `color`；空字符串时不写样式。 */
  protected readonly contentColor = computed<string | null>(() => {
    const color = this.color();
    if (!color) {
      return null;
    }
    return COLOR_MAP[color] || color;
  });

  /** 格式化后的数值文案：`format` 优先，其次按 `decimalPlaces` + `separator` 格式化。 */
  protected readonly formatValue = computed<string | number>(() => {
    const value = this.value();
    const numberValue = typeof value === 'number' ? value : 0;
    const format = this.format();
    if (format) {
      return format(numberValue);
    }
    return this.getFormatValue(numberValue);
  });

  /** 趋势箭头方向，没有 `trend` 时不显示。 */
  protected readonly trendIconName = computed<'up' | 'down' | null>(() => {
    const trend = this.trend();
    if (trend === 'increase') {
      return 'up';
    }
    if (trend === 'decrease') {
      return 'down';
    }
    return null;
  });

  /** 趋势箭头是否落在前缀位（没有 prefix 内容且位置不是 right 时）。 */
  protected readonly trendInPrefix = computed(
    () => this.trendIconName() !== null && this.trendPlacement() !== 'right',
  );

  /** 趋势箭头是否落在后缀位（没有 suffix 内容且位置是 right 时）。 */
  protected readonly trendInSuffix = computed(
    () => this.trendIconName() !== null && this.trendPlacement() === 'right',
  );

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: StatisticContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 上游 `getFormatValue` 的等价实现。 */
  private getFormatValue(value: number): string {
    const decimalPlaces = this.decimalPlaces();
    const places = typeof decimalPlaces === 'number' && Number.isFinite(decimalPlaces) ? decimalPlaces : undefined;
    const separator = this.separator();

    return value
      .toLocaleString(undefined, {
        minimumFractionDigits: places ?? 0,
        maximumFractionDigits: places ?? 20,
        useGrouping: !!separator,
      })
      .replace(/,|，/g, separator);
  }
}
