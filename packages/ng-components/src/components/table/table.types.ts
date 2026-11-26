import type { Content } from '../../_utils/content';
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
  /** 表尾单元格内容，`footData` 的行按列取它，未声明时取行数据同名字段 */
  foot?: TableFootCellContent<T>;
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
  /** 该列是否允许拖拽调整宽度，`false` 时不出现拖拽手柄 */
  resizable?: boolean;
  /** 拖拽调整宽度时的最小 / 最大宽度 */
  resize?: TableColumnResizeConfig;
}

/** 列宽拖拽的宽窄限制。 */
export interface TableColumnResizeConfig {
  /** 最小宽度，默认 80 */
  minWidth: number;
  /** 最大宽度，默认 600 */
  maxWidth: number;
}

/** 列宽拖拽结束事件。 */
export interface TableColumnResizeEvent {
  /** 拖拽后的列宽，colKey → px */
  columnsWidth: Record<string, number>;
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

/** 键盘操作下行高亮的模式，与 TDesign 的 `activeRowType` 一致。 */
export const TABLE_ACTIVE_ROW_TYPES = ['single', 'multiple'] as const;

export type TableActiveRowType = (typeof TABLE_ACTIVE_ROW_TYPES)[number];

/** 高亮行列表里的一项。 */
export interface TableActiveRowItem<T extends TableRow = TableRow> {
  /** 行数据 */
  row: T;
  /** 行下标 */
  rowIndex: number;
}

/** 高亮行变化事件，字段与 TDesign 的 `onActiveChange` 对齐。 */
export interface TableActiveChangeEvent<T extends TableRow = TableRow> {
  /** 高亮行的 key 列表 */
  activeRowKeys: Array<string | number>;
  /** 高亮行的数据 */
  activeRowList: Array<TableActiveRowItem<T>>;
  /** 本次操作的行数据 */
  currentRowData?: T;
  /** 本次是高亮还是取消高亮 */
  type: 'active' | 'inactive';
}

/** 键盘操作高亮行时的动作，与 TDesign 的 `ActiveRowAction` 一致。 */
export const TABLE_ACTIVE_ROW_ACTIONS = [
  'shift-area-selection',
  'space-one-selection',
  'clear',
  'select-all',
] as const;

export type TableActiveRowAction = (typeof TABLE_ACTIVE_ROW_ACTIONS)[number];

/** 键盘操作高亮行事件。 */
export interface TableActiveRowActionEvent<T extends TableRow = TableRow> {
  /** 本次动作 */
  action: TableActiveRowAction;
  /** 当前高亮行列表 */
  activeRowList: Array<TableActiveRowItem<T>>;
}

/** 行事件上下文，字段与 TDesign 的 `onRowClick` 等对齐。 */
export interface TableRowEventContext<T extends TableRow = TableRow> {
  /** 行数据 */
  row: T;
  /** 行下标 */
  index: number;
  /** 原生事件 */
  e: Event;
}

/** 单元格点击事件上下文，字段与 TDesign 的 `onCellClick` 对齐。 */
export interface TableCellClickEvent<T extends TableRow = TableRow> {
  /** 行数据 */
  row: T;
  /** 列配置 */
  col: TableColumn<T>;
  /** 行下标 */
  rowIndex: number;
  /** 列下标 */
  colIndex: number;
  /** 原生事件 */
  e: Event;
}

/** 滚动事件上下文，字段与 TDesign 的 `onScroll` 等对齐。 */
export interface TableScrollEvent {
  /** 原生事件 */
  e: Event;
}

/** 行类名参数，字段与 TDesign 的 `RowClassNameParams` 对齐。 */
export interface TableRowClassNameParams<T extends TableRow = TableRow> {
  /** 行数据 */
  row: T;
  /** 行下标 */
  rowIndex: number;
  /** 行 key */
  rowKey: string | number;
  /** 行类型，表尾行为 `foot` */
  type?: 'body' | 'foot';
}

/**
 * 行类名。
 *
 * 支持字符串、回调、按「行下标 / 行 key」取值的映射，或它们的数组；
 * 数组内各项依次拼接，与 TDesign 的 `rowClassName` 行为一致。
 */
export type TableRowClassName<T extends TableRow = TableRow> =
  | string
  | ((params: TableRowClassNameParams<T>) => string | undefined)
  | Record<string | number, string | undefined>
  | Array<
      | string
      | ((params: TableRowClassNameParams<T>) => string | undefined)
      | Record<string | number, string | undefined>
    >;

/** 行属性参数，字段与 TDesign 的 `RowAttributesParams` 对齐。 */
export interface TableRowAttributesParams<T extends TableRow = TableRow> {
  /** 行数据 */
  row: T;
  /** 行下标 */
  rowIndex: number;
  /** 行类型，表尾行为 `foot` */
  type: 'body' | 'foot';
}

/** 单个行属性的取值。 */
export type TableRowAttributeValue = string | number | boolean | null | undefined;

/**
 * 一组行属性：属性名 → 取值，`class` / `style` 同样走这里。
 *
 * 取值不做类型限制：Angular 端统一走 `setAttribute` / `classList` / `style`，
 * 数字与布尔会按字符串处理，`undefined` / `null` / `false` 表示移除该属性。
 */
export type TableRowAttributesValue = Record<string, unknown>;

/**
 * 行属性。
 *
 * 支持对象、回调、或它们的数组；数组内各项按顺序合并，与 TDesign 的
 * `formatRowAttributes` 行为一致。
 */
export type TableRowAttributes<T extends TableRow = TableRow> =
  | TableRowAttributesValue
  | ((params: TableRowAttributesParams<T>) => TableRowAttributesValue | undefined)
  | Array<TableRowAttributesValue | ((params: TableRowAttributesParams<T>) => TableRowAttributesValue | undefined)>;

/** 加载状态配置，取 TDesign `LoadingProps` 里表格用得到的那部分。 */
export interface TableLoadingProps {
  /** 加载文案，优先于 `loadingText` / `locale.loadingText` */
  text?: Content;
  /** 加载图标，传 `false` 时不显示图标 */
  indicator?: Content | boolean;
  /** 加载图标尺寸 */
  size?: string;
  /** 是否显示遮罩 */
  showOverlay?: boolean;
}

/**
 * 语言配置，取 TDesign `TableConfig` 里表格用得到的那部分。
 *
 * 传入的字段优先于同名属性，例如 `locale.empty` 覆盖 `empty`。
 */
export interface TableLocale {
  /** 空数据文案 */
  empty?: Content;
  /** 加载中文案 */
  loadingText?: Content;
  /** 筛选面板「确定」文案 */
  confirmText?: string;
  /** 筛选面板「重置」文案 */
  resetText?: string;
  /** 表格尺寸 */
  size?: TableSize;
}

/**
 * 吸顶 / 吸底配置，字段与 `TAffix` 对齐。
 *
 * `headerAffixedTop` 之类的开关属性传 `true` 时用默认值，传对象时按这里的字段覆盖。
 */
export interface TableAffixProps {
  /** 滚动容器，与 `TAffix` 的 `container` 一致；留空视作窗口 */
  container?: string | HTMLElement | null;
  /** 距离容器顶部的偏移（px） */
  offsetTop?: number | null;
  /** 距离容器底部的偏移（px） */
  offsetBottom?: number | null;
  /** 吸顶 / 吸底时的层级 */
  zIndex?: number;
}

/** 表尾单元格内容。 */
export type TableFootCellContent<T extends TableRow = TableRow> =
  | Content
  | ((context: TableCellContext<T>) => Content);

/** 展开行内容的渲染上下文。 */
export interface TableExpandedRowContext<T extends TableRow = TableRow> {
  row: T;
  rowIndex: number;
}

/** 展开行内容：字符串、模板，或按行返回内容的函数。 */
export type TableExpandedRowContent<T extends TableRow = TableRow> =
  | Content
  | ((context: TableExpandedRowContext<T>) => Content);

