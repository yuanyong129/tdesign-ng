/** 行数据：任意对象，默认按键取值。 */
export type TableRow = Record<string, any>;

/** 单元格对齐方式。 */
export const TABLE_ALIGNS = ['left', 'center', 'right'] as const;

export type TableAlign = (typeof TABLE_ALIGNS)[number];

/** 表格尺寸。 */
export const TABLE_SIZES = ['small', 'medium', 'large'] as const;

export type TableSize = (typeof TABLE_SIZES)[number];

/** 单元格垂直对齐。 */
export const TABLE_VERTICAL_ALIGNS = ['top', 'middle', 'bottom'] as const;

export type TableVerticalAlign = (typeof TABLE_VERTICAL_ALIGNS)[number];

/** 表格布局方式，fixed 时按列宽分配。 */
export const TABLE_LAYOUTS = ['auto', 'fixed'] as const;

export type TableLayout = (typeof TABLE_LAYOUTS)[number];

/** 单元格渲染上下文。 */
export interface TableCellContext<T extends TableRow = TableRow> {
  /** 当前行数据 */
  row: T;
  /** 行下标 */
  rowIndex: number;
  /** 当前列配置 */
  col: TableColumn<T>;
  /** 列下标 */
  colIndex: number;
  /** 按 `colKey` 取到的原始值 */
  value: unknown;
}

/** 列配置，字段名与 TDesign 的 BaseTableCol 对齐。 */
export interface TableColumn<T extends TableRow = TableRow> {
  /** 列唯一标识，同时作为取值字段名 */
  colKey: string;
  /** 表头文字 */
  title?: string;
  /** 列宽 */
  width?: string | number;
  /** 最小列宽 */
  minWidth?: string | number;
  /** 单元格对齐 */
  align?: TableAlign;
  /** 是否省略超出内容 */
  ellipsis?: boolean;
  /** 固定列位置（本版本仅记录，固定列在后续版本实现） */
  fixed?: 'left' | 'right';
  /** 自定义单元格文本 */
  cell?: (context: TableCellContext<T>) => string;
  /** 列附加类名 */
  className?: string;
}
