import type { InputNumberDecimalPlaces, InputNumberValue } from './input-number.types';

/** 上游允许作为输入结尾的特殊字符。 */
const SPECIAL_CODES = ['-', '.', 'e', 'E', '+'];

/** 十进制数字字符串拆分为「整数 + 小数位」形式，便于用 BigInt 精确运算。 */
interface ScaledNumber {
  value: bigint;
  scale: number;
}

function toScaledNumber(value: string): ScaledNumber | null {
  const matched = /^([-+]?)(\d*)(?:\.(\d+))?$/.exec(value.trim());
  if (!matched) return null;
  const [, sign, integerPart = '', fractionPart = ''] = matched;
  if (!integerPart && !fractionPart) return null;
  const digits = `${integerPart || '0'}${fractionPart}`;
  const parsed = BigInt(digits);
  return { value: sign === '-' ? -parsed : parsed, scale: fractionPart.length };
}

function scaledToString(scaled: ScaledNumber): string {
  const negative = scaled.value < 0n;
  const digits = (negative ? -scaled.value : scaled.value).toString();
  if (scaled.scale <= 0) return `${negative ? '-' : ''}${digits}`;
  const padded = digits.padStart(scaled.scale + 1, '0');
  const integerPart = padded.slice(0, padded.length - scaled.scale);
  const fractionPart = padded.slice(padded.length - scaled.scale);
  return `${negative ? '-' : ''}${integerPart}.${fractionPart}`;
}

function alignScales(left: ScaledNumber, right: ScaledNumber): [bigint, bigint, number] {
  const scale = Math.max(left.scale, right.scale);
  return [
    left.value * 10n ** BigInt(scale - left.scale),
    right.value * 10n ** BigInt(scale - right.scale),
    scale,
  ];
}

function decimalLength(num: number): number {
  const fraction = String(num).split('.')[1];
  return fraction ? fraction.length : 0;
}

/** 十进制安全的加减：先把两侧放大到同一数量级再运算，避免浮点误差。 */
function scaledArithmetic(num1: number, num2: number, sign: 1 | -1): number {
  const scale = 10 ** Math.max(decimalLength(num1), decimalLength(num2));
  return (Math.round(num1 * scale) + sign * Math.round(num2 * scale)) / scale;
}

/** 是否为合法数字（含科学计数法），与大数模式的判断保持一致。 */
export function isInputNumber(value: InputNumberValue): boolean {
  return /^[-+]?(\d+(\.\d+)?|\.\d+)([eE][-+]?\d+)?$/.test(String(value).trim());
}

/** 比较两个值，返回负数/0/正数；大数模式优先按字符串精确比较。 */
export function compareNumber(value: InputNumberValue, target: InputNumberValue, largeNumber = false): number {
  if (largeNumber) {
    const left = toScaledNumber(String(value));
    const right = toScaledNumber(String(target));
    if (left && right) {
      const [leftValue, rightValue] = alignScales(left, right);
      return leftValue === rightValue ? 0 : leftValue < rightValue ? -1 : 1;
    }
  }
  return Number(value) - Number(target);
}

/** 相加，大数模式走 BigInt 精确运算。 */
export function addNumber(left: InputNumberValue, right: InputNumberValue, largeNumber = false): InputNumberValue {
  if (largeNumber) {
    const leftScaled = toScaledNumber(String(left));
    const rightScaled = toScaledNumber(String(right));
    if (leftScaled && rightScaled) {
      const [leftValue, rightValue, scale] = alignScales(leftScaled, rightScaled);
      return scaledToString({ value: leftValue + rightValue, scale });
    }
  }
  return scaledArithmetic(Number(left), Number(right), 1);
}

/** 相减，大数模式走 BigInt 精确运算。 */
export function subtractNumber(
  left: InputNumberValue,
  right: InputNumberValue,
  largeNumber = false,
): InputNumberValue {
  if (largeNumber) {
    const leftScaled = toScaledNumber(String(left));
    const rightScaled = toScaledNumber(String(right));
    if (leftScaled && rightScaled) {
      const [leftValue, rightValue, scale] = alignScales(leftScaled, rightScaled);
      return scaledToString({ value: leftValue - rightValue, scale });
    }
  }
  return scaledArithmetic(Number(left), Number(right), -1);
}

/** 按小数位配置格式化为定点数字字符串。 */
export function toFixedNumber(value: InputNumberValue, decimalPlaces?: InputNumberDecimalPlaces): string {
  if (decimalPlaces === undefined) return String(value);
  const places = Math.max(0, typeof decimalPlaces === 'number' ? decimalPlaces : decimalPlaces.places);
  const round = typeof decimalPlaces === 'number' ? true : decimalPlaces.enableRound;
  const scaled = toScaledNumber(String(value));
  if (!scaled) return String(value);
  const negative = scaled.value < 0n;
  const absolute = negative ? -scaled.value : scaled.value;
  let next: bigint;
  if (scaled.scale <= places) {
    next = absolute * 10n ** BigInt(places - scaled.scale);
  } else {
    const divisor = 10n ** BigInt(scaled.scale - places);
    next = round ? (absolute + divisor / 2n) / divisor : absolute / divisor;
  }
  return scaledToString({ value: negative ? -next : next, scale: places });
}

/** 能否继续增加，对应上游 `canAddNumber`。 */
export function canAddNumber(num: InputNumberValue | undefined, max: InputNumberValue, largeNumber = false): boolean {
  if (!num && num !== 0) return true;
  if (largeNumber && typeof num === 'string') return compareNumber(num, max, true) < 0;
  return Number(num) < Number(max);
}

/** 能否继续减少，对应上游 `canReduceNumber`。 */
export function canReduceNumber(
  num: InputNumberValue | undefined,
  min: InputNumberValue,
  largeNumber = false,
): boolean {
  if (!num && num !== 0) return true;
  if (largeNumber && typeof num === 'string') return compareNumber(num, min, true) > 0;
  return Number(num) > Number(min);
}

/** 把值收敛到 [min, max] 区间内，空串返回 undefined。 */
export function putInRangeNumber(
  value: InputNumberValue | undefined,
  options: { max: InputNumberValue; min: InputNumberValue; lastValue?: InputNumberValue; largeNumber?: boolean },
): InputNumberValue | undefined {
  const { max, min, lastValue, largeNumber = false } = options;
  if (value === '' || value === undefined) return undefined;
  if (!isInputNumber(value)) return lastValue;
  if (largeNumber) {
    if (compareNumber(value, max, true) > 0) return max;
    if (compareNumber(value, min, true) < 0) return min;
    return value;
  }
  return Math.max(Number(min), Math.min(Number(max), Number(value)));
}

/** 判断是否超出区间，返回错误类型；对应上游 `getMaxOrMinValidateResult`。 */
export function getMaxOrMinValidateResult(options: {
  max: InputNumberValue;
  min: InputNumberValue;
  value: InputNumberValue | undefined;
  largeNumber?: boolean;
}): 'exceed-maximum' | 'below-minimum' | undefined {
  const { value, max, min, largeNumber = false } = options;
  if (value === undefined || value === '') return undefined;
  if (compareNumber(value, max, largeNumber) > 0) return 'exceed-maximum';
  if (compareNumber(value, min, largeNumber) < 0) return 'below-minimum';
  return undefined;
}

/** 按步长计算下一值，对应上游 `getStepValue`；步长非法时原样返回。 */
export function getStepValue(options: {
  op: 'add' | 'reduce';
  step: InputNumberValue;
  lastValue: InputNumberValue | undefined;
  max: InputNumberValue;
  min: InputNumberValue;
  largeNumber?: boolean;
}): InputNumberValue | undefined {
  const { op, step, lastValue, max, min, largeNumber = false } = options;
  if (Number(step) <= 0) return lastValue;
  const next =
    op === 'add'
      ? addNumber(lastValue ?? 0, step, largeNumber)
      : subtractNumber(lastValue ?? 0, step, largeNumber);
  const result = lastValue === undefined ? putInRangeNumber(next, { max, min, largeNumber }) : next;
  if (result === undefined) return undefined;
  return largeNumber ? result : Number(result);
}

/** 输入过程中的合法性校验，对应上游 `canInputNumber`。 */
export function canInputNumber(value: string | null | undefined, largeNumber = false): boolean {
  if (value === '' || value === null || value === undefined) return true;
  if (value.slice(0, 2) === '00') return false;
  if (/\s/.test(value)) return false;
  if ((value.match(/\./g)?.length ?? 0) > 1) return false;
  if ((value.match(/e/g)?.length ?? 0) > 1) return false;
  const rest = value.slice(1);
  const signs = rest.match(/(\+|-)/g);
  if (signs && (!/e(\+|-)/i.test(rest) || signs.length > 1)) return false;
  const numeric = (largeNumber && isInputNumber(value)) || !Number.isNaN(Number(value));
  if (!numeric && !SPECIAL_CODES.includes(value.slice(-1))) return false;
  if (/e/i.test(value) && (!/\de/i.test(value) || /e\./.test(value))) return false;
  return true;
}

/** 新输入值是否值得写回，对应上游 `canSetValue`。 */
export function canSetValue(number: InputNumberValue | undefined, lastNumber: InputNumberValue | undefined): boolean {
  if (Number.isNaN(Number(number))) return false;
  if (lastNumber === '' || lastNumber === null || lastNumber === undefined) return number !== '';
  if (number === '') return true;
  return parseFloat(String(number)) !== Number(lastNumber);
}

/** 去掉千分位，对应上游 `formatThousandths`。 */
export function formatThousandths(value: string): string {
  if (/^[-+]?\d{1,3}(,\d{3})*(\.(\d*))?$/.test(value)) return value.replace(/,/g, '');
  return value;
}

/** 输入过程 / 失焦时的数值整理，对应上游 `formatUnCompleteNumber`。 */
export function formatUnCompleteNumber(
  value: InputNumberValue | null | undefined,
  options: { decimalPlaces?: InputNumberDecimalPlaces; largeNumber?: boolean; isToFixed?: boolean } = {},
): number | string | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const text = String(value);
  if (!/\d+/.test(text)) return undefined;
  const stripped = text.replace(/[.|+|\-|e]$/, '');
  if (stripped === '') return undefined;
  const fixed = options.decimalPlaces === undefined ? stripped : toFixedNumber(stripped, options.decimalPlaces);
  if (options.largeNumber) return fixed;
  return options.isToFixed ? fixed : parseFloat(fixed);
}
