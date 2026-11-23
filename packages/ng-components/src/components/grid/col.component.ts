import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { cn } from '../../_utils';
import { BaseColProps, ColSize, colBreakpointClasses, toColSize, toOptionalNumber } from './grid.types';
import { T_ROW } from './row.component';

/** 基础格数/偏移/排序属性，非响应式。 */
const BASE_FIELDS: Array<keyof BaseColProps> = ['offset', 'order', 'pull', 'push'];

/**
 * 栅格列。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类；
 * 横向内边距来自父级 `t-row` 的 gutter。
 */
@Component({
  selector: 't-col',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[style]': 'hostStyle()',
  },
})
export class TCol {
  private readonly row = inject(T_ROW, { optional: true });

  /** 列宽度，直接写入 `flex` 样式，例如 `1 1 auto`。 @zh 列宽度 @en flex */
  flex = input<string | number | undefined>(undefined);

  /** 占位格数，共 12 格。 @zh 占位格数 @en span */
  span = input<number | undefined, unknown>(undefined, { transform: toOptionalNumber });

  /** 偏移格数。 @zh 偏移格数 @en offset */
  offset = input<number | undefined, unknown>(undefined, { transform: toOptionalNumber });

  /** 排序。 @zh 排序 @en order */
  order = input<number | undefined, unknown>(undefined, { transform: toOptionalNumber });

  /** 向右移动格数。 @zh 向右移动格数 @en pull */
  pull = input<number | undefined, unknown>(undefined, { transform: toOptionalNumber });

  /** 向左移动格数。 @zh 向左移动格数 @en push */
  push = input<number | undefined, unknown>(undefined, { transform: toOptionalNumber });

  /** 视口 ≥ 320px 时的占位/偏移配置。 @zh 视口 ≥ 320px @en xs */
  xs = input<ColSize | undefined, unknown>(undefined, { transform: toColSize });

  /** 视口 ≥ 768px 时的占位/偏移配置。 @zh 视口 ≥ 768px @en sm */
  sm = input<ColSize | undefined, unknown>(undefined, { transform: toColSize });

  /** 视口 ≥ 992px 时的占位/偏移配置。 @zh 视口 ≥ 992px @en md */
  md = input<ColSize | undefined, unknown>(undefined, { transform: toColSize });

  /** 视口 ≥ 1200px 时的占位/偏移配置。 @zh 视口 ≥ 1200px @en lg */
  lg = input<ColSize | undefined, unknown>(undefined, { transform: toColSize });

  /** 视口 ≥ 1400px 时的占位/偏移配置。 @zh 视口 ≥ 1400px @en xl */
  xl = input<ColSize | undefined, unknown>(undefined, { transform: toColSize });

  /** 视口 ≥ 1880px 时的占位/偏移配置。 @zh 视口 ≥ 1880px @en xxl */
  xxl = input<ColSize | undefined, unknown>(undefined, { transform: toColSize });

  protected readonly classes = computed(() => {
    const classes: string[] = ['t-col'];

    const span = this.span();
    if (typeof span === 'number') {
      classes.push(`t-col-${span}`);
    }
    const baseValues: Record<string, number | undefined> = {
      offset: this.offset(),
      order: this.order(),
      pull: this.pull(),
      push: this.push(),
    };
    for (const field of BASE_FIELDS) {
      const value = baseValues[field];
      if (typeof value === 'number') {
        classes.push(`t-col-${field}-${value}`);
      }
    }

    classes.push(...colBreakpointClasses('xs', this.xs()));
    classes.push(...colBreakpointClasses('sm', this.sm()));
    classes.push(...colBreakpointClasses('md', this.md()));
    classes.push(...colBreakpointClasses('lg', this.lg()));
    classes.push(...colBreakpointClasses('xl', this.xl()));
    classes.push(...colBreakpointClasses('xxl', this.xxl()));

    return cn(classes);
  });

  protected readonly hostStyle = computed(() => {
    const style: Record<string, string> = {};

    const flex = this.flex();
    if (flex !== undefined && flex !== null && flex !== '') {
      style['flex'] = typeof flex === 'number' ? `${flex}` : flex;
    }

    const gutter = this.row?.horizontalGutter() ?? 0;
    if (gutter) {
      const padding = `${gutter / 2}px`;
      style['paddingLeft'] = padding;
      style['paddingRight'] = padding;
    }

    return Object.keys(style).length ? style : null;
  });
}
