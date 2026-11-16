/** 标签主题。 */
export const TAG_THEMES = ['default', 'primary', 'warning', 'danger', 'success'] as const;

export type TagTheme = (typeof TAG_THEMES)[number];

/** 标签变体。 */
export const TAG_VARIANTS = ['dark', 'light', 'outline', 'light-outline'] as const;

export type TagVariant = (typeof TAG_VARIANTS)[number];

/** 标签形状。 */
export const TAG_SHAPES = ['square', 'round', 'mark'] as const;

export type TagShape = (typeof TAG_SHAPES)[number];

/** 标签尺寸。 */
export const TAG_SIZES = ['small', 'medium', 'large'] as const;

export type TagSize = (typeof TAG_SIZES)[number];

/** 把 #rgb / #rrggbb / rgb() 解析成 [r, g, b]，解析失败返回 null。 */
export function parseColor(color: string): [number, number, number] | null {
  const value = color.trim();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const digits = hex[1];
    if (digits.length === 3) {
      return [
        parseInt(digits[0] + digits[0], 16),
        parseInt(digits[1] + digits[1], 16),
        parseInt(digits[2] + digits[2], 16),
      ];
    }
    return [
      parseInt(digits.slice(0, 2), 16),
      parseInt(digits.slice(2, 4), 16),
      parseInt(digits.slice(4, 6), 16),
    ];
  }

  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(value);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  return null;
}

/** 相对亮度，判断自定义底色上应该用黑字还是白字。 */
export function colorLuminance(color: string): number {
  const parsed = parseColor(color);
  if (!parsed) return 0;

  const linear = parsed.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
