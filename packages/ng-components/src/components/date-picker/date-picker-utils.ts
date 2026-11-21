import { DatePickerCell, DatePickerValueType, DateValue } from './date-picker.types';

const TOKEN_PATTERN = /YYYY|YY|MM|DD|HH|mm|ss|SSS/g;

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/** 按格式串格式化日期，支持 YYYY / YY / MM / DD / HH / mm / ss / SSS。 */
export function formatDate(date: Date, format: string): string {
  return format.replace(TOKEN_PATTERN, (token) => {
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
      }[token] ?? '(\\d+)';
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
  const month = (parts['MM'] ?? 1) - 1;
  const day = parts['DD'] ?? 1;
  const date = new Date(
    year,
    month,
    day,
    parts['HH'] ?? 0,
    parts['mm'] ?? 0,
    parts['ss'] ?? 0,
    parts['SSS'] ?? 0,
  );
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
