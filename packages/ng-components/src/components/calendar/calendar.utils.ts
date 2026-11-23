import { formatDate, isSameDay, parseDateByFormat, startOfDay } from '../date-picker/date-picker-utils';

import type {
  CalendarCell,
  CalendarController,
  CalendarMode,
  CalendarValue,
  CalendarWeekDay,
  CalendarWeekHeader,
} from './calendar.types';

/** 年份下拉的最小年份，与上游一致。 */
export const CALENDAR_MIN_YEAR = 1970;

/** 中文月份名，与上游 `cellMonth` 的默认值一致。 */
export const CALENDAR_MONTH_LABELS = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
] as const;

/** 星期名称，索引为 0-6（周日到周六）。 */
const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const;

const DEFAULT_DAY_FORMAT = 'YYYY-MM-DD';

/** 年月范围。 */
export interface CalendarRangeBounds {
  /** 起始日期。 */
  from: Date;
  /** 结束日期。 */
  to: Date;
}

/** 生成月视图单元格的参数。 */
export interface CreateMonthRowsOptions {
  /** 年份。 */
  year: number;
  /** 月份，1-12。 */
  month: number;
  /** 一周的起始日，1-7。 */
  firstDayOfWeek: number;
  /** 日期格式化模板。 */
  format: string;
  /** 判断某个日期是否被选中。 */
  isCurrent: (date: Date) => boolean;
}

/** 把一周起始日收敛到 1-7。 */
export function clampFirstDayOfWeek(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 1;
  const normalized = Math.trunc(value);
  if (normalized < 1 || normalized > 7) return 1;
  return normalized;
}

/** 把输入值解析为当天零点的日期。 */
export function toDate(value: CalendarValue | null | undefined, format: string): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }
  const text = String(value).trim();
  if (!text) return null;
  const parsed = parseDateByFormat(text, format);
  if (parsed && !Number.isNaN(parsed.getTime())) return startOfDay(parsed);
  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : startOfDay(fallback);
}

/** 星期序号，周日为 7。 */
export function getWeekdayNumber(date: Date): CalendarWeekDay {
  const day = date.getDay();
  return (day === 0 ? 7 : day) as CalendarWeekDay;
}

/** 某一天在表头中的列索引。 */
export function getCellColIndex(firstDayOfWeek: number, date: Date): number {
  const day = getWeekdayNumber(date);
  return day >= firstDayOfWeek ? day - firstDayOfWeek : 7 - firstDayOfWeek + day;
}

/** 表头各列信息，按 `firstDayOfWeek` 轮转。 */
export function createWeekHeaders(firstDayOfWeek: number, week: string[] | undefined): CalendarWeekHeader[] {
  const headers: CalendarWeekHeader[] = [];
  for (let index = 0; index < 7; index += 1) {
    const day = (((firstDayOfWeek - 1 + index) % 7) + 1) as CalendarWeekDay;
    headers.push({ day, display: week?.[index] ?? DAY_LABELS[day % 7] });
  }
  return headers;
}

/** 生成月视图的行数据，行数随月份在 4-6 之间变化。 */
export function createMonthRows(options: CreateMonthRowsOptions): CalendarCell[][] {
  const { year, month, firstDayOfWeek, format, isCurrent } = options;
  const filterDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const formattedFilterDate = formatDate(filterDate, format);
  const base = {
    mode: 'month' as CalendarMode,
    filterDate,
    formattedFilterDate,
    isShowWeekend: true,
  };
  const rows: CalendarCell[][] = [];
  let row: CalendarCell[] = [];
  const offset = getCellColIndex(firstDayOfWeek, filterDate);

  for (let index = 0; index < offset; index += 1) {
    const date = new Date(year, month - 1, 1 - offset + index, 0, 0, 0, 0);
    row.push({
      ...base,
      belongTo: -1,
      day: getWeekdayNumber(date),
      weekOrder: 1,
      date,
      formattedDate: formatDate(date, format),
      isCurrent: isCurrent(date),
    });
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth += 1) {
    const date = new Date(year, month - 1, dayOfMonth, 0, 0, 0, 0);
    row.push({
      ...base,
      belongTo: 0,
      day: getWeekdayNumber(date),
      weekOrder: rows.length + 1,
      date,
      formattedDate: formatDate(date, format),
      isCurrent: isCurrent(date),
    });
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }

  let nextDay = 1;
  while (row.length > 0 && row.length < 7) {
    const date = new Date(year, month, nextDay, 0, 0, 0, 0);
    nextDay += 1;
    row.push({
      ...base,
      belongTo: 1,
      day: getWeekdayNumber(date),
      weekOrder: rows.length + 1,
      date,
      formattedDate: formatDate(date, format),
      isCurrent: isCurrent(date),
    });
  }
  if (row.length > 0) rows.push(row);

  return rows;
}

/** 生成年视图的行数据，每行 3 个。 */
export function createYearRows(year: number, format: string, isCurrent: (date: Date) => boolean): CalendarCell[][] {
  const rows: CalendarCell[][] = [];
  let row: CalendarCell[] = [];
  for (let month = 1; month <= 12; month += 1) {
    const date = new Date(year, month - 1, 1, 0, 0, 0, 0);
    row.push({
      mode: 'year',
      date,
      formattedDate: formatDate(date, format),
      filterDate: null,
      formattedFilterDate: null,
      isShowWeekend: true,
      isCurrent: isCurrent(date),
    });
    if (row.length === 3) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) rows.push(row);
  return rows;
}

/** 单元格展示文字：月模式为日期数字，年模式为月份名称。 */
export function formatCellDisplay(cell: CalendarCell, fillWithZero: boolean): string {
  if (cell.mode === 'year') {
    return CALENDAR_MONTH_LABELS[cell.date.getMonth()] ?? '';
  }
  const date = cell.date.getDate();
  return fillWithZero && date < 10 ? `0${date}` : String(date);
}

/** 单元格是否为今天。 */
export function isTodayCell(cell: CalendarCell, today: Date): boolean {
  if (cell.mode === 'year') {
    return cell.date.getFullYear() === today.getFullYear() && cell.date.getMonth() === today.getMonth();
  }
  return formatDate(cell.date, DEFAULT_DAY_FORMAT) === formatDate(today, DEFAULT_DAY_FORMAT);
}

/** 解析 `range`，少于两个值时不生效。 */
export function resolveRange(range: CalendarValue[] | undefined, format: string): CalendarRangeBounds | null {
  if (!Array.isArray(range) || range.length < 2) return null;
  const from = toDate(range[0], format) ?? new Date(CALENDAR_MIN_YEAR, 0, 1);
  const to = toDate(range[1], format) ?? startOfDay(new Date());
  return from.getTime() <= to.getTime() ? { from, to } : { from: to, to: from };
}

/** 控制区默认配置。 */
export function createDefaultControllerConfig(visible = true): CalendarController {
  return {
    visible,
    disabled: false,
    current: { visible: true, currentDayButtonProps: {}, currentMonthButtonProps: {} },
    mode: { visible: true, radioGroupProps: {} },
    month: { visible: true, selectProps: {} },
    weekend: { visible: true, showWeekendButtonProps: {}, hideWeekendButtonProps: {} },
    year: { visible: true, selectProps: {} },
  };
}

/** 某个日期是否落在范围内。 */
export function isDateInRange(date: Date, bounds: CalendarRangeBounds | null): boolean {
  if (!bounds) return true;
  const time = startOfDay(date).getTime();
  return time >= bounds.from.getTime() && time <= bounds.to.getTime();
}

/** 判断两个日期是否为同一天。 */
export function isSameCalendarDay(left: Date, right: Date): boolean {
  return isSameDay(left, right);
}
