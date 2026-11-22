import { DatePickerCell, DatePickerValueType, DateValue } from './date-picker.types';

const TOKEN_PATTERN = /\[[^\]]*\]|YYYY|YY|MM|DD|HH|mm|ss|SSS|WW|Q/g;

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/** ISO 8601 周信息：周一为一周第一天，跨年周归属到「周四所在年」。 */
export function isoWeekOf(date: Date): { year: number; week: number } {
  const target = startOfDay(date);
  const day = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - day + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const offset = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - offset + 3);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return { year: target.getFullYear(), week };
}

/** ISO 周的周一日期。 */
export function isoWeekStart(year: number, week: number): Date {
  const firstThursday = new Date(year, 0, 4);
  const offset = (firstThursday.getDay() + 6) % 7;
  const monday = new Date(year, 0, 4 - offset);
  monday.setDate(monday.getDate() + (week - 1) * 7);
  return monday;
}

/** 季度：1~4。 */
export function quarterOf(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/** 按格式串格式化日期，支持 YYYY / YY / MM / DD / HH / mm / ss / SSS / WW / Q，`[...]` 内为字面量。 */
export function formatDate(date: Date, format: string): string {
  return format.replace(TOKEN_PATTERN, (token) => {
    if (token.startsWith('[') && token.endsWith(']')) return token.slice(1, -1);
    switch (token) {
      case 'YYYY':
        return String(date.getFullYear());
      case 'YY':
        return pad(date.getFullYear() % 100);
      case 'MM':
        return pad(date.getMonth() + 1);
      case 'DD':
        return pad(date.getDate());
      case 'HH':
        return pad(date.getHours());
      case 'mm':
        return pad(date.getMinutes());
      case 'ss':
        return pad(date.getSeconds());
      case 'SSS':
        return pad(date.getMilliseconds(), 3);
      case 'WW':
        return pad(isoWeekOf(date).week);
      case 'Q':
        return String(quarterOf(date));
      default:
        return token;
    }
  });
}

/** `valueType` 对应的默认显示格式。 */
export function defaultFormat(valueType: DatePickerValueType): string {
  if (valueType === 'Date' || valueType === 'time-stamp') return 'YYYY-MM-DD';
  return valueType;
}

/** 把 Date 转成对外回传的值。 */
export function formatValue(date: Date, valueType: DatePickerValueType): DateValue {
  if (valueType === 'Date') return new Date(date);
  if (valueType === 'time-stamp') return date.getTime();
  return formatDate(date, valueType);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 按格式串解析日期字符串；解析不出来返回 null。 */
export function parseDateByFormat(value: string, format: string): Date | null {
  const tokens: string[] = [];
  let pattern = '^';
  let lastIndex = 0;

  for (const match of format.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    pattern += escapeRegExp(format.slice(lastIndex, index));
    const token = match[0];
    if (token.startsWith('[') && token.endsWith(']')) {
      pattern += escapeRegExp(token.slice(1, -1));
    } else {
      tokens.push(token);
      pattern +=
        {
          YYYY: '(\\d{4})',
          YY: '(\\d{2})',
          MM: '(\\d{1,2})',
          DD: '(\\d{1,2})',
          HH: '(\\d{1,2})',
          mm: '(\\d{1,2})',
          ss: '(\\d{1,2})',
          SSS: '(\\d{1,3})',
          WW: '(\\d{1,2})',
          Q: '(\\d)',
        }[token] ?? '(\\d+)';
    }
    lastIndex = index + token.length;
  }
  pattern += `${escapeRegExp(format.slice(lastIndex))}$`;

  const matched = value.match(new RegExp(pattern));
  if (!matched) return null;

  const parts: Record<string, number> = {};
  tokens.forEach((token, index) => {
    parts[token] = Number(matched[index + 1]);
  });

  const year = parts['YYYY'] ?? (parts['YY'] !== undefined ? 2000 + parts['YY'] : 1970);
  const hour = parts['HH'] ?? 0;
  const minute = parts['mm'] ?? 0;
  const second = parts['ss'] ?? 0;
  const millisecond = parts['SSS'] ?? 0;

  if (parts['WW'] !== undefined) {
    const monday = isoWeekStart(year, Math.min(Math.max(parts['WW'], 1), 53));
    return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), hour, minute, second, millisecond);
  }

  if (parts['Q'] !== undefined) {
    const quarter = Math.min(Math.max(parts['Q'], 1), 4);
    return new Date(year, (quarter - 1) * 3, 1, hour, minute, second, millisecond);
  }

  const month = (parts['MM'] ?? 1) - 1;
  const day = parts['DD'] ?? 1;
  const date = new Date(year, month, day, hour, minute, second, millisecond);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    // 2024-02-31 这类非法日期会被 Date 进位，这里视为解析失败
    if (parts['DD'] !== undefined) return null;
  }
  return date;
}

/** 解析各种形态的日期值。 */
export function parseDate(value: DateValue | undefined, valueType: DatePickerValueType): Date | null {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value);
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const text = String(value).trim();
  if (!text) return null;

  const byFormat = parseDateByFormat(text, defaultFormat(valueType));
  if (byFormat) return byFormat;

  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

/** 星期表头，按 firstDayOfWeek 旋转。 */
export function weekLabels(firstDayOfWeek: number): string[] {
  const start = ((firstDayOfWeek % 7) + 7) % 7;
  return Array.from({ length: 7 }, (_, index) => WEEK_LABELS[(start + index) % 7]);
}

/** 生成 6×7 的日期格，包含相邻月份补齐的格子。 */
export function buildMonthCells(
  year: number,
  month: number,
  firstDayOfWeek: number,
): DatePickerCell[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() - firstDayOfWeek + 7) % 7;
  const start = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + weekIndex * 7 + dayIndex,
      );
      return {
        date,
        day: date.getDate(),
        additional: date.getMonth() !== month || date.getFullYear() !== year,
      };
    }),
  );
}


/** 面板里的一行周：ISO 周号 + 7 天。 */
export interface DatePickerWeekRow {
  week: number;
  weekYear: number;
  cells: DatePickerCell[];
  /** 该行 7 天是否全部禁用 */
  disabled: boolean;
}

/** 把 6×7 的日期格按行归成 ISO 周（用行内第 4 天确定归属年与周号）。 */
export function buildWeekRows(rows: DatePickerCell[][]): DatePickerWeekRow[] {
  return rows.map((cells) => {
    const middle = cells[3] ?? cells[0];
    const { year, week } = isoWeekOf(middle.date);
    return { week, weekYear: year, cells, disabled: false };
  });
}

/** 面板里的一个季度格。 */
export interface DatePickerQuarterCell {
  quarter: number;
  label: string;
  date: Date;
}

/** 生成一年 4 个季度格。 */
export function buildQuarterCells(year: number): DatePickerQuarterCell[] {
  return Array.from({ length: 4 }, (_, index) => ({
    quarter: index + 1,
    label: `Q${index + 1}`,
    date: new Date(year, index * 3, 1),
  }));
}
