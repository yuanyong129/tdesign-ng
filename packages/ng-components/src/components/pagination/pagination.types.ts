/** 分页尺寸。 */
export const PAGINATION_SIZES = ['small', 'medium'] as const;

export type PaginationSize = (typeof PAGINATION_SIZES)[number];

/** 分页形态。 */
export const PAGINATION_THEMES = ['default', 'simple'] as const;

export type PaginationTheme = (typeof PAGINATION_THEMES)[number];

/** 省略号出现的模式。 */
export const PAGINATION_ELLIPSIS_MODES = ['mid', 'both-ends'] as const;

export type PaginationEllipsisMode = (typeof PAGINATION_ELLIPSIS_MODES)[number];

/** 分页信息，变化事件都会带上它。 */
export interface PageInfo {
  /** 当前页 */
  current: number;
  /** 变化前的页码 */
  previous: number;
  /** 每页条数 */
  pageSize: number;
}

/** 每页条数选项，可以直接传数字或 { label, value }。 */
export interface PageSizeOption {
  label: string;
  value: number;
}

export type PaginationPageSizeOptions = Array<number | PageSizeOption>;

/** 每页条数选择器的透传配置，取 TDesign `SelectProps` 里分页用得到的部分。 */
export interface PaginationSelectProps {
  /** 选择器占位文案 */
  placeholder?: string;
  /** 选择器尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否可清空 */
  clearable?: boolean;
}
