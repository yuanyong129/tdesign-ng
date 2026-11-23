/**
 * 栅格的公共类型与 gutter 解析。
 */

import { BREAKPOINTS, Breakpoint } from '../../_utils';

/** 栅格列的基础配置，六个响应式断点的属性都用它。 */
export interface BaseColProps {
  /** 偏移格数。 */
  offset?: number;
  /** 排序。 */
  order?: number;
  /** 向右移动格数。 */
  pull?: number;
  /** 向左移动格数。 */
  push?: number;
  /** 占位格数。 */
  span?: number;
}

/** 列宽配置：数字表示占位格数，对象表示更细的偏移/排序配置。 */
export type ColSize = number | BaseColProps;

/** 按断点配置的 gutter。 */
export interface GutterObject {
  /** 视口 ≥ 320px 时的间距。 */
  xs?: number;
  /** 视口 ≥ 768px 时的间距。 */
  sm?: number;
  /** 视口 ≥ 992px 时的间距。 */
  md?: number;
  /** 视口 ≥ 1200px 时的间距。 */
  lg?: number;
  /** 视口 ≥ 1400px 时的间距。 */
  xl?: number;
  /** 视口 ≥ 1880px 时的间距。 */
  xxl?: number;
}

/**
 * 行间距配置。
 *
 * - 数字：水平间距
 * - 数组：`[水平间距, 垂直间距]`
 * - 对象：按断点配置的水平间距（垂直间距同值）
 */
export type RowGutter = number | Array<number | GutterObject> | GutterObject;

/** 水平与垂直间距（px）。 */
export interface RowGutterPair {
  horizontal: number;
  vertical: number;
}

/** 行水平排列方式。 */
export const ROW_JUSTIFIES = ['start', 'end', 'center', 'space-around', 'space-between'] as const;
export type RowJustify = (typeof ROW_JUSTIFIES)[number];

/** 行垂直对齐方式。 */
export const ROW_ALIGNS = [
  'start',
  'end',
  'center',
  'stretch',
  'baseline',
  'top',
  'middle',
  'bottom',
] as const;
export type RowAlign = (typeof ROW_ALIGNS)[number];

const EMPTY_GUTTER: RowGutterPair = { horizontal: 0, vertical: 0 };

/** 取断点对象在当前断点下最近的已配置值。 */
function pickByBreakpoint(gutter: GutterObject, breakpoint: Breakpoint): number {
  const index = BREAKPOINTS.indexOf(breakpoint);
  for (let i = index; i >= 0; i -= 1) {
    const value = gutter[BREAKPOINTS[i]];
    if (typeof value === 'number') {
      return value;
    }
  }
  return 0;
}

function toNumber(value: number | GutterObject | undefined, breakpoint: Breakpoint): number {
  if (typeof value === 'number') {
    return value;
  }
  if (value && typeof value === 'object') {
    return pickByBreakpoint(value, breakpoint);
  }
  return 0;
}

/**
 * 把 `RowGutter` 解析成水平/垂直像素值。
 *
 * 传进来的断点决定对象形式取哪一档；数组形式第一项是水平间距、第二项是垂直间距。
 */
export function resolveRowGutter(
  gutter: RowGutter | undefined,
  breakpoint: Breakpoint,
): RowGutterPair {
  if (gutter === undefined || gutter === null) {
    return EMPTY_GUTTER;
  }
  if (typeof gutter === 'number') {
    return { horizontal: gutter, vertical: 0 };
  }
  if (Array.isArray(gutter)) {
    return {
      horizontal: toNumber(gutter[0], breakpoint),
      vertical: toNumber(gutter[1], breakpoint),
    };
  }
  const value = pickByBreakpoint(gutter, breakpoint);
  return { horizontal: value, vertical: value };
}

/** 列在某个断点下需要追加的类名。 */
export function colBreakpointClasses(
  breakpoint: Breakpoint,
  size: ColSize | undefined,
): string[] {
  if (size === undefined || size === null) {
    return [];
  }
  if (typeof size === 'number') {
    return [`t-col-${breakpoint}-${size}`];
  }
  const classes: string[] = [];
  const fields: Array<keyof BaseColProps> = ['span', 'offset', 'order', 'pull', 'push'];
  for (const field of fields) {
    const value = size[field];
    if (typeof value === 'number') {
      const suffix = field === 'span' ? '' : `${field}-`;
      classes.push(`t-col-${breakpoint}-${suffix}${value}`);
    }
  }
  return classes;
}

/**
 * 把模板里写死的属性值转成数字。
 *
 * 静态属性（`span="6"`）传进来的是字符串，数字绑定（`[span]="6"`）传进来的是数字，
 * 两种写法都要能用，所以统一在 input transform 里归一化。
 */
export function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

/** 列宽配置的转换：数字字符串转数字，对象（响应式配置）原样保留。 */
export function toColSize(value: unknown): ColSize | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'object') {
    return value as BaseColProps;
  }
  return toOptionalNumber(value);
}

/** 栅格间距的转换：数字字符串转数字，数组与断点对象原样保留。 */
export function toRowGutter(value: unknown): RowGutter {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  if (typeof value === 'object') {
    return value as RowGutter;
  }
  return toOptionalNumber(value) ?? 0;
}
