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

/** 排序触发方式。 */
export const TABLE_SORT_TYPES = ['all', 'asc', 'desc'] as const;

export type TableSortType = (typeof TABLE_SORT_TYPES)[number];

/** 筛选控件类型，与 TDesign 的 FilterType 一致。 */
export const TABLE_FILTER_TYPES = ['input', 'single', 'multiple'] as const;

export type TableFilterType = (typeof TABLE_FILTER_TYPES)[number];

/** 筛选项，与 TDesign 的 OptionData 对齐。 */
export interface TableFilterOption {
  /** 展示文字 */
  label?: string;
  /** 选项值 */
  value: string | number;
  /** 是否禁用 */
  disabled?: boolean;
}

/** 列筛选配置，与 TDesign 的 TableColumnFilter 对齐。 */
export interface TableColumnFilter {
  /** 筛选列表，`single` / `multiple` 时生效 */
  list?: TableFilterOption[];
  /** 筛选控件类型 */
  type?: TableFilterType;
  /** 是否显示「重置」「确定」按钮，开启后点击确定才提交 */
  showConfirmAndReset?: boolean;
  /** 重置时使用的值 */
  resetValue?: unknown;
}

/** 筛选值：colKey → 该列的筛选值。 */
export type TableFilterValue = Record<string, unknown>;

/** 筛选变化上下文，与 TDesign 的 TableFilterChangeContext 对齐。 */
export interface TableFilterChangeContext<T extends TableRow = TableRow> {
  /** 触发的列 */
  col: TableColumn<T>;
  /** 触发方式 */
  trigger: 'filter-change' | 'confirm' | 'reset' | 'clear';
}

/** 筛选变化事件。 */
export interface TableFilterChangeEvent<T extends TableRow = TableRow> {
  /** 完整筛选值，可直接用于过滤数据 */
  filterValue: TableFilterValue;
  /** 当前列的筛选值 */
  value: unknown;
  /** 触发的列 */
  col: TableColumn<T>;
  /** 触发方式 */
  trigger: TableFilterChangeContext['trigger'];
}

/** 单列排序信息，与 TDesign 的 SortInfo 一致。 */
export interface TableSortInfo {
  sortBy: string;
  descending: boolean;
}

/** 排序信息：单列或多列。 */
export type TableSort = TableSortInfo | TableSortInfo[];

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
  /** 是否可排序，函数形式为自定义比较器 */
  sorter?: boolean | ((a: T, b: T) => number);
  /** 排序触发方式，默认 asc → desc → 取消 */
  sortType?: TableSortType;
  /** 列筛选配置 */
  filter?: TableColumnFilter;
}
