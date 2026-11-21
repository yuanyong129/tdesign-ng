import { TimeParts, TimePickerColumn, TimePickerColumnType } from './time-picker.types';

/** 默认显示格式。 */
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss';

const TOKEN_PATTERN = /HH|mm|ss/g;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 按格式串把 TimeParts 拼成字符串，缺失的 token 不输出。 */
export function formatTimeParts(parts: TimeParts, format: string): string {
  return format.replace(TOKEN_PATTERN, (token) => {
    if (token === 'HH') return pad(parts.hour);
    if (token === 'mm') return pad(parts.minute);
    return pad(parts.second);
  });
}

/** 把时间字符串解析成各组成部分；解析不出来时返回 00:00:00。 */
export function parseTimeParts(value: string | null | undefined, format: string): TimeParts {
  const parts: TimeParts = { hour: 0, minute: 0, second: 0 };
  if (!value) return parts;

  const tokens: string[] = [];
  let pattern = '^';
  let lastIndex = 0;
  for (const match of format.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    pattern += escapeRegExp(format.slice(lastIndex, index));
    tokens.push(match[0]);
    pattern += '(\\d{1,2})';
    lastIndex = index + match[0].length;
  }
  pattern += `${escapeRegExp(format.slice(lastIndex))}$`;

  const matched = value.match(new RegExp(pattern));
  if (matched) {
    tokens.forEach((token, index) => {
      const number = Number(matched[index + 1]);
      if (token === 'HH') parts.hour = number;
      else if (token === 'mm') parts.minute = number;
      else parts.second = number;
    });
    return clampParts(parts);
  }

  // 容错：`12:30` / `12:30:45` 这类不带分隔符格式的输入
  const segments = value.trim().split(':');
  if (segments.length >= 2) {
    parts.hour = Number(segments[0]) || 0;
    parts.minute = Number(segments[1]) || 0;
    parts.second = Number(segments[2]) || 0;
  }
  return clampParts(parts);
}

/** 00:00:00 在当前格式下的字符串。 */
export function emptyTimeValue(format: string): string {
  return formatTimeParts({ hour: 0, minute: 0, second: 0 }, format);
}

/** 当前时间（含秒）在当前格式下的字符串。 */
export function nowTimeValue(format: string): string {
  const now = new Date();
  return formatTimeParts(
    { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() },
    format,
  );
}

/** 格式里的时间列，按 HH / mm / ss 依次出现。 */
export function timeColumnsOf(format: string): TimePickerColumnType[] {
  return [...format.matchAll(TOKEN_PATTERN)].map((match) =>
    match[0] === 'HH' ? 'hour' : match[0] === 'mm' ? 'minute' : 'second',
  );
}

/** 构建面板的列，`steps` 按 HH / mm / ss 的顺序取步长。 */
export function buildTimeColumns(
  format: string,
  steps: Array<string | number>,
): TimePickerColumn[] {
  const maxMap: Record<TimePickerColumnType, number> = { hour: 24, minute: 60, second: 60 };
  return timeColumnsOf(format).map((type, index) => {
    const raw = Number(steps[index]);
    const step = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
    const max = maxMap[type];
    const items: string[] = [];
    for (let value = 0; value < max; value += step) items.push(pad(value));
    return { type, items };
  });
}

function clampParts(parts: TimeParts): TimeParts {
  return {
    hour: Math.min(Math.max(parts.hour, 0), 23),
    minute: Math.min(Math.max(parts.minute, 0), 59),
    second: Math.min(Math.max(parts.second, 0), 59),
  };
}
