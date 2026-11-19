import type {
  PageInfo,
  PaginationEllipsisMode,
  PaginationPageSizeOptions,
  PaginationSize,
  PaginationTheme,
} from '../pagination';

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

/** 行选择类型：单选 / 多选。 */
export const TABLE_ROW_SELECTION_TYPES = ['single', 'multiple'] as const;

export type TableRowSelectionType = (typeof TABLE_ROW_SELECTION_TYPES)[number];

/** 选中行变化事件，字段与 TDesign 的 SelectOptions 对齐。 */
export interface TableSelectChangeEvent<T extends TableRow = TableRow> {
  /** 选中行的 key 列表 */
  selectedRowKeys: Array<string | number>;
  /** 选中行的数据 */
  selectedRowData: T[];
  /** 本次是选中还是取消选中 */
  type: 'check' | 'uncheck';
  /** 本次操作的行 key */
  currentRowKey?: string | number;
  /** 本次操作的行数据 */
  currentRowData?: T;
}

/** 展开行变化事件，字段与 TDesign 的 ExpandOptions 对齐。 */
export interface TableExpandChangeEvent<T extends TableRow = TableRow> {
  /** 展开行的 key 列表 */
  expandedRowKeys: Array<string | number>;
  /** 展开行的数据 */
  expandedRowData: T[];
  /** 本次操作的行数据 */
  currentRowData?: T;
}

/** 展开行模板上下文。 */
export interface TableExpandedRowContext<T extends TableRow = TableRow> {
  /** 当前行数据 */
  row: T;
  /** 行下标 */
  rowIndex: number;
}

/** 固定列位置。 */
export const TABLE_COLUMN_FIXED = ['left', 'right'] as const;

export type TableColumnFixed = (typeof TABLE_COLUMN_FIXED)[number];

/**
 * 表格分页配置，字段与 TDesign 的 PaginationProps 对齐。
 *
 * 不传 `total` 时用 `data.length`；`current` / `pageSize` 传入即受控。
 */
export interface TablePagination {
  /** 当前页，传入即受控 */
  current?: number;
  /** 每页条数，传入即受控 */
  pageSize?: number;
  /** 默认当前页，非受控时生效 */
  defaultCurrent?: number;
  /** 默认每页条数，非受控时生效 */
  defaultPageSize?: number;
  /** 数据总条数，不传时用 data.length */
  total?: number;
  /** 每页条数选项 */
  pageSizeOptions?: PaginationPageSizeOptions;
  /** 是否显示每页条数选择器 */
  showPageSize?: boolean;
  /** 是否显示跳页器 */
  showJumper?: boolean;
  /** 是否显示总条数 */
  totalContent?: string | boolean;
  /** 是否显示首页 / 尾页按钮 */
  showFirstAndLastPageBtn?: boolean;
  /** 是否显示上一页 / 下一页按钮 */
  showPreviousAndNextBtn?: boolean;
  /** 是否显示页码 */
  showPageNumber?: boolean;
  /** 最多显示多少个页码 */
  maxPageBtn?: number;
  /** 折叠时最多显示多少个页码 */
  foldedMaxPageBtn?: number;
  /** 省略号出现的位置 */
  pageEllipsisMode?: PaginationEllipsisMode;
  /** 分页尺寸 */
  size?: PaginationSize;
  /** 分页形态 */
  theme?: PaginationTheme;
  /** 是否禁用分页 */
  disabled?: boolean;
}

/** 分页变化事件。 */
export interface TablePageChangeEvent<T extends TableRow = TableRow> {
  /** 分页信息 */
  pageInfo: PageInfo;
  /** 新一页的数据（本地分页时已切好） */
  dataSource: T[];
}

/** 合并单元格：返回的 span 会与相邻单元格合并。 */
export interface TableRowspan {
  /** 横向合并的列数 */
  colspan?: number;
  /** 纵向合并的行数 */
  rowspan?: number;
}

/** 合并单元格回调参数。 */
export interface TableRowspanParams<T extends TableRow = TableRow> {
  /** 当前行数据 */
  row: T;
  /** 当前列 */
  col: TableColumn<T>;
  /** 当前行下标 */
  rowIndex: number;
  /** 当前列下标 */
  colIndex: number;
}

/**
 * 虚拟滚动配置，字段与 TDesign 的 TScroll 对齐。
 *
 * 只有 `type: 'virtual'` 且行数超过 `threshold` 时才启用虚拟滚动。
 */
export interface TableScroll {
  /** 滚动类型，`virtual` 为虚拟滚动 */
  type?: 'virtual' | 'lazy';
  /** 行高，用于计算可视区域与占位高度，默认 47 */
  rowHeight?: number;
  /** 可视区域上下各多渲染几条，默认 10 */
  bufferSize?: number;
  /** 超过多少行才启用虚拟滚动，默认 100 */
  threshold?: number;
  /** 行高是否固定。固定行高时不再逐行测量，性能更好 */
  isFixedRowHeight?: boolean;
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
  /** 固定列位置，固定列需要同时声明宽度，否则横向滚动时无法计算偏移 */
  fixed?: TableColumnFixed;
  /** 列类型，`single` / `multiple` 时该列渲染为行选择列，宽度默认 64 */
  type?: TableRowSelectionType;
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
  /** 子列，声明后该列成为多级表头的分组列，子列按层级渲染 */
  children?: TableColumn<T>[];
}

/** 多级表头的一格：列本身 + 合并信息。 */
export interface TableHeaderCell<T extends TableRow = TableRow> {
  /** 该格对应的列 */
  col: TableColumn<T>;
  /** 横向合并的叶子列数 */
  colspan: number;
  /** 纵向合并的表头行数 */
  rowspan: number;
}
