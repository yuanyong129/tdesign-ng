import { TD_COLOR_USED_COLORS_MAX_SIZE } from './color-picker.types';
import type { ColorObject, ColorPickerFormat, HsvColor, RgbaColor } from './color-picker.types';

const ALPHA_FORMAT_MAP: Partial<Record<ColorPickerFormat, ColorPickerFormat>> = {
  HEX: 'HEX8',
  RGB: 'RGBA',
  HSL: 'HSLA',
  HSV: 'HSVA',
};

/** 把数值限制在 [min, max] 区间。 */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value);
}

function parseAlpha(value: string | undefined): number {
  if (!value) return 1;
  const text = value.trim();
  const parsed = Number.parseFloat(text);
  if (Number.isNaN(parsed)) return 1;
  return clamp(text.endsWith('%') ? parsed / 100 : parsed, 0, 1);
}

function parseChannel(value: string | undefined): number {
  if (!value) return 0;
  const text = value.trim();
  const parsed = Number.parseFloat(text);
  if (Number.isNaN(parsed)) return 0;
  const channel = text.endsWith('%') ? (parsed / 100) * 255 : parsed;
  return clamp(round(channel), 0, 255);
}

function parseHue(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value.trim().replace(/deg$/i, ''));
  if (Number.isNaN(parsed)) return 0;
  return ((parsed % 360) + 360) % 360;
}

function parsePercent(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value.trim());
  if (Number.isNaN(parsed)) return 0;
  return clamp(parsed, 0, 100);
}

/** 解析十六进制颜色（#rgb / #rgba / #rrggbb / #rrggbbaa）。 */
function parseHexColor(text: string): RgbaColor | null {
  const match = /^#([0-9a-f]{3,8})$/i.exec(text);
  if (!match) return null;

  let hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  if (hex.length !== 6 && hex.length !== 8) return null;

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

/**
 * 解析颜色字符串，支持 hex / rgb / rgba / hsl / hsla / hsv / hsva。
 * 解析失败返回 `null`。
 */
export function parseColor(input: string | null | undefined): RgbaColor | null {
  if (!input) return null;
  const text = input.trim();
  if (!text) return null;

  if (text.startsWith('#')) return parseHexColor(text);

  const rgbMatch = /^rgba?\((.*)\)$/i.exec(text);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length < 3) return null;
    return {
      r: parseChannel(parts[0]),
      g: parseChannel(parts[1]),
      b: parseChannel(parts[2]),
      a: parseAlpha(parts[3]),
    };
  }

  const hslMatch = /^hsla?\((.*)\)$/i.exec(text);
  if (hslMatch) {
    const parts = hslMatch[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length < 3) return null;
    return hslToRgb(parseHue(parts[0]), parsePercent(parts[1]), parsePercent(parts[2]), parseAlpha(parts[3]));
  }

  const hsvMatch = /^hsva?\((.*)\)$/i.exec(text);
  if (hsvMatch) {
    const parts = hsvMatch[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length < 3) return null;
    return hsvToRgb(
      { h: parseHue(parts[0]), s: parsePercent(parts[1]), v: parsePercent(parts[2]) },
      parseAlpha(parts[3]),
    );
  }

  return null;
}

/** rgb 转 hsv。 */
export function rgbToHsv(color: RgbaColor): HsvColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  };
}

/** hsv 转 rgb。 */
export function hsvToRgb(hsv: HsvColor, alpha = 1): RgbaColor {
  const s = clamp(hsv.s, 0, 100) / 100;
  const v = clamp(hsv.v, 0, 100) / 100;
  const h = ((hsv.h % 360) + 360) % 360;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: round((r + m) * 255),
    g: round((g + m) * 255),
    b: round((b + m) * 255),
    a: clamp(alpha, 0, 1),
  };
}

/** rgb 转 hsl。 */
export function rgbToHsl(color: RgbaColor): { h: number; s: number; l: number } {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: s * 100, l: l * 100 };
}

/** hsl 转 rgb。 */
export function hslToRgb(h: number, s: number, l: number, alpha = 1): RgbaColor {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: round((r + m) * 255),
    g: round((g + m) * 255),
    b: round((b + m) * 255),
    a: clamp(alpha, 0, 1),
  };
}

function toHexChannel(value: number): string {
  return clamp(round(value), 0, 255).toString(16).padStart(2, '0').toUpperCase();
}

/** rgba 转 #RRGGBB。 */
export function rgbToHex(color: RgbaColor): string {
  return `#${toHexChannel(color.r)}${toHexChannel(color.g)}${toHexChannel(color.b)}`;
}

/** rgba 转 #RRGGBBAA。 */
export function rgbToHex8(color: RgbaColor): string {
  return `${rgbToHex(color)}${toHexChannel(color.a * 255)}`;
}

function formatNumber(value: number): string {
  return String(Number(value.toFixed(2)));
}

function alphaSuffix(color: RgbaColor): string {
  return formatNumber(clamp(color.a, 0, 1));
}

function formatCmyk(color: RgbaColor): string {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return 'cmyk(0%, 0%, 0%, 100%)';
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return `cmyk(${round(c * 100)}%, ${round(m * 100)}%, ${round(y * 100)}%, ${round(k * 100)}%)`;
}

/** 按指定格式输出颜色字符串；`enableAlpha` 为 false 时忽略透明度。 */
export function formatColor(
  color: RgbaColor,
  format: ColorPickerFormat = 'RGB',
  enableAlpha = false,
): string {
  const normalized: RgbaColor = {
    r: clamp(round(color.r), 0, 255),
    g: clamp(round(color.g), 0, 255),
    b: clamp(round(color.b), 0, 255),
    a: enableAlpha ? clamp(color.a, 0, 1) : 1,
  };
  const alphaFormat = enableAlpha && normalized.a < 1 ? ALPHA_FORMAT_MAP[format] : undefined;
  const target = alphaFormat ?? format;

  switch (target) {
    case 'HEX':
      return rgbToHex(normalized);
    case 'HEX8':
      return rgbToHex8(normalized);
    case 'RGB':
      return `rgb(${normalized.r}, ${normalized.g}, ${normalized.b})`;
    case 'RGBA':
      return `rgba(${normalized.r}, ${normalized.g}, ${normalized.b}, ${alphaSuffix(normalized)})`;
    case 'HSL': {
      const hsl = rgbToHsl(normalized);
      return `hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`;
    }
    case 'HSLA': {
      const hsl = rgbToHsl(normalized);
      return `hsla(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%, ${alphaSuffix(normalized)})`;
    }
    case 'HSV': {
      const hsv = rgbToHsv(normalized);
      return `hsv(${round(hsv.h)}, ${round(hsv.s)}%, ${round(hsv.v)}%)`;
    }
    case 'HSVA': {
      const hsv = rgbToHsv(normalized);
      return `hsva(${round(hsv.h)}, ${round(hsv.s)}%, ${round(hsv.v)}%, ${alphaSuffix(normalized)})`;
    }
    case 'CMYK':
      return formatCmyk(normalized);
    case 'CSS':
      return normalized.a < 1
        ? `rgba(${normalized.r}, ${normalized.g}, ${normalized.b}, ${alphaSuffix(normalized)})`
        : `rgb(${normalized.r}, ${normalized.g}, ${normalized.b})`;
    default:
      return rgbToHex(normalized);
  }
}

/** 构造与上游结构一致的颜色对象。 */
export function toColorObject(
  color: RgbaColor,
  format: ColorPickerFormat = 'RGB',
  enableAlpha = false,
): ColorObject {
  const hsv = rgbToHsv(color);
  return {
    alpha: clamp(color.a, 0, 1),
    css: formatColor(color, 'CSS', enableAlpha),
    hex: rgbToHex(color),
    hex8: rgbToHex8(color),
    hsl: formatColor(color, 'HSL', enableAlpha),
    hsla: formatColor(color, 'HSLA', enableAlpha),
    hsv: formatColor(color, 'HSV', enableAlpha),
    hsva: formatColor(color, 'HSVA', enableAlpha),
    rgb: formatColor(color, 'RGB', enableAlpha),
    rgba: formatColor(color, 'RGBA', enableAlpha),
    saturation: round(hsv.s),
    value: round(hsv.v),
    isGradient: false,
    linearGradient: undefined,
  };
}

/** 比较两个颜色是否一致（按 8 位通道取整）。 */
export function isSameColor(left: RgbaColor, right: RgbaColor): boolean {
  return (
    round(left.r) === round(right.r) &&
    round(left.g) === round(right.g) &&
    round(left.b) === round(right.b) &&
    Math.abs(left.a - right.a) < 0.005
  );
}

/** 把颜色插入最近使用列表头部，去重并限制最大数量。 */
export function pushRecentColor(list: string[], color: string): string[] {
  const text = color.trim();
  if (!text) return list;
  const lower = text.toLowerCase();
  const next = [text, ...list.filter((item) => item.toLowerCase() !== lower)];
  return next.slice(0, TD_COLOR_USED_COLORS_MAX_SIZE);
}

/** CSS 颜色预览值；渐变等无法解析的值原样返回。 */
export function toCssColor(input: string | null | undefined, fallback = 'transparent'): string {
  if (!input) return fallback;
  if (input.startsWith('linear-gradient')) return input;
  return parseColor(input) ? input : fallback;
}
