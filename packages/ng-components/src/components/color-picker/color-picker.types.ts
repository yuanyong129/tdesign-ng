/** 颜色格式。 */
export const COLOR_PICKER_FORMATS = [
  'HEX',
  'HEX8',
  'RGB',
  'RGBA',
  'HSL',
  'HSLA',
  'HSV',
  'HSVA',
  'CMYK',
  'CSS',
] as const;
export type ColorPickerFormat = (typeof COLOR_PICKER_FORMATS)[number];

/** 未开启透明度时可选的颜色格式。 */
export const COLOR_PICKER_BASE_FORMATS = ['HEX', 'RGB', 'HSL', 'HSV', 'CMYK', 'CSS'] as const;

/** 颜色变化来源。 */
export const COLOR_PICKER_CHANGE_TRIGGERS = [
  'palette-saturation-brightness',
  'palette-saturation',
  'palette-brightness',
  'palette-hue-bar',
  'palette-alpha-bar',
  'input',
  'preset',
  'recent',
] as const;
export type ColorPickerChangeTrigger = (typeof COLOR_PICKER_CHANGE_TRIGGERS)[number];

/** 颜色选择器尺寸。 */
export const COLOR_PICKER_SIZES = ['small', 'medium', 'large'] as const;
export type ColorPickerSize = (typeof COLOR_PICKER_SIZES)[number];

/** 颜色模式。 */
export const COLOR_PICKER_MODES = ['monochrome', 'linear-gradient'] as const;
export type ColorPickerMode = (typeof COLOR_PICKER_MODES)[number];

/** 默认颜色。 */
export const DEFAULT_COLOR_PICKER_COLOR = '#001F97';

/** 默认系统预设色（与上游一致）。 */
export const DEFAULT_COLOR_PICKER_SWATCHES: string[] = [
  '#ECF2FE',
  '#D4E3FC',
  '#BBD3FB',
  '#96BBF8',
  '#699EF5',
  '#4787F0',
  '#266FE8',
  '#0052D9',
  '#0034B5',
  '#001F97',
  '#FDECEE',
  '#F9D7D9',
  '#F8B9BE',
  '#F78D94',
  '#F36D78',
  '#E34D59',
  '#C9353F',
  '#B11F26',
  '#951114',
  '#680506',
  '#FEF3E6',
  '#F9E0C7',
  '#F7C797',
  '#F2995F',
  '#ED7B2F',
  '#D35A21',
  '#BA431B',
  '#9E3610',
  '#842B0B',
  '#5A1907',
  '#E8F8F2',
  '#BCEBDC',
  '#85DBBE',
  '#48C79C',
  '#00A870',
  '#078D5C',
  '#067945',
  '#056334',
  '#044F2A',
  '#033017',
];

/** 最近使用颜色的最大数量。 */
export const TD_COLOR_USED_COLORS_MAX_SIZE = 100;

/** 颜色的 rgba 表示，各分量均为 0-255 / 0-1。 */
export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** 颜色的 hsv 表示：h 为 0-360，s/v 为 0-100。 */
export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

/** 颜色对象，字段与上游保持一致。 */
export interface ColorObject {
  alpha: number;
  css: string;
  hex: string;
  hex8: string;
  hsl: string;
  hsla: string;
  hsv: string;
  hsva: string;
  rgb: string;
  rgba: string;
  saturation: number;
  value: number;
  isGradient: boolean;
  linearGradient?: string;
}

/** 颜色变化事件。 */
export interface ColorPickerChangeEvent {
  value: string;
  color: ColorObject;
  trigger: ColorPickerChangeTrigger;
}

/** 预设色 / 最近使用色块点击后的变化事件。 */
export interface ColorPickerSwatchEvent {
  value: string;
  trigger: 'preset' | 'recent';
}
