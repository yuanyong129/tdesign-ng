import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TAffix, type AffixScrollContainer } from '../affix';
import { TButton } from '../button';
import { TCheckbox, TCheckboxGroup } from '../checkbox';
import { TInput } from '../input';
import { TPagination, type PageInfo } from '../pagination';
import { TPopup } from '../popup';
import { TRadio, TRadioGroup } from '../radio';
import type { Content } from '../../_utils/content';
import { contentText, isContentEmpty, isTemplateContent } from '../../_utils/content';
import { TTableCell } from './table-cell.directive';
import { TTableExpandedRow } from './table-expanded-row.directive';
import { TTableRowAttributes } from './table-row-attributes.directive';
import {
  TABLE_ALIGNS,
  TABLE_LAYOUTS,
  TABLE_SIZES,
  TABLE_SORT_TYPES,
  TABLE_VERTICAL_ALIGNS,
  TableActiveChangeEvent,
  TableActiveRowAction,
  TableActiveRowActionEvent,
  TableActiveRowItem,
  TableActiveRowType,
  TableAffixProps,
  TableCellClickEvent,
  TableCellContext,
  TableColumn,
  TableExpandChangeEvent,
  TableExpandedRowContent,
  TableFilterChangeEvent,
  TableFilterChangeContext,
  TableFilterType,
  TableFilterValue,
  TableFootCellContent,
  TableHeaderCell,
  TableLayout,
  TableLoadingProps,
  TableLocale,
  TablePageChangeEvent,
  TablePagination,
  TableRow,
  TableRowAttributes,
  TableRowAttributesParams,
  TableRowAttributesValue,
  TableRowClassName,
  TableRowClassNameParams,
  TableRowEventContext,
  TableRowSelectionType,
  TableRowspan,
  TableRowspanParams,
  TableScroll,
  TableScrollEvent,
  TableColumnResizeEvent,
  TableSelectChangeEvent,
  TableSize,
  TableSort,
  TableSortInfo,
  TableSortType,
  TableVerticalAlign,
} from './table.types';

/** 单元格为空时的占位内容。 */
type TableCellEmptyContent = Content | ((context: TableCellContext) => Content);

const SIZE_CLASS: Record<TableSize, string> = {
  small: 't-size-s',
  medium: '',
  large: 't-size-l',
};

/** 展开图标列的 colKey，与 TDesign 保持一致。 */
const EXPAND_COLUMN_KEY = '__EXPAND_ROW_ICON_COLUMN__';

/** 列的最大层级，单层表头为 1。 */
function columnDepth(columns: TableColumn[], depth = 1): number {
  let max = depth;
  for (const col of columns) {
    if (col.children?.length) max = Math.max(max, columnDepth(col.children, depth + 1));
  }
  return max;
}

/** 列包含的叶子列数，分组列即为子列 colspan 之和。 */
function leafCount(col: TableColumn): number {
  if (!col.children?.length) return 1;
  return col.children.reduce((sum, child) => sum + leafCount(child), 0);
}

/** 展平成叶子列：多级表头的分组列本身不渲染单元格。 */
function flattenColumns(columns: TableColumn[]): TableColumn[] {
  const leaves: TableColumn[] = [];
  for (const col of columns) {
    if (col.children?.length) leaves.push(...flattenColumns(col.children));
    else leaves.push(col);
  }
  return leaves;
}

/**
 * 按显示列过滤列树，并按 displayColumns 里的顺序重排。
 * 分组列保留可见子列，全部子列被隐藏时整组一起隐藏。
 */
function filterColumnsByKeys(columns: TableColumn[], keys: string[] | undefined): TableColumn[] {
  if (!keys) return columns;

  const order = new Map(keys.map((key, index) => [key, index]));
  const rankOf = (column: TableColumn): number => {
    const own = order.get(column.colKey);
    if (own !== undefined) return own;
    const children = column.children ?? [];
    return children.reduce((rank, child) => Math.min(rank, rankOf(child)), Number.POSITIVE_INFINITY);
  };

  const filtered: TableColumn[] = [];
  for (const column of columns) {
    if (column.children?.length) {
      const children = filterColumnsByKeys(column.children, keys);
      if (children.length) filtered.push({ ...column, children });
      continue;
    }
    if (order.has(column.colKey)) filtered.push(column);
  }

  return filtered.sort((a, b) => rankOf(a) - rankOf(b));
}

/**
 * 按层级生成表头矩阵，第 0 行为最上层。
  * 与 TDesign 的 useMultiHeader 一致：分组列 rowspan 1、colspan 为叶子数。
   * 叶子列 rowspan 为剩余行数、colspan 1。 */
function buildHeaderRows(columns: TableColumn[]): TableHeaderCell[][] {
  const maxDepth = columnDepth(columns);
  const rows: TableHeaderCell[][] = [];
  const walk = (nodes: TableColumn[], depth: number): void => {
    const row = (rows[depth - 1] ??= []);
    for (const col of nodes) {
      const children = col.children;
      if (children?.length) {
        row.push({ col, colspan: leafCount(col), rowspan: 1 });
        walk(children, depth + 1);
      } else {
        row.push({ col, colspan: 1, rowspan: maxDepth - depth + 1 });
      }
    }
  };
  walk(columns, 1);
  return rows;
}

/** 单元格合并状态。 */
interface TableCellSpan {
  rowspan?: number;
  colspan?: number;
  skipped?: boolean;
}

const EMPTY_CELL_SPAN: TableCellSpan = {};

/** 归一化后的吸顶 / 吸底配置，直接摊给 `t-affix`。 */
interface ResolvedAffix {
  enabled: boolean;
  container: AffixScrollContainer;
  offsetTop: number | null;
  offsetBottom: number | null;
  zIndex: number | undefined;
}

/**
 * 归一化吸顶 / 吸底配置。
  *
 * 开关属性既可以是 `boolean` 也可以是配置对象（与上游 `boolean | Partial<AffixProps>` 一致）。
  * 单独的 `xxxAffixProps` 只做覆盖、不负责开启。
 */
function resolveAffix(
  value: boolean | TableAffixProps | undefined,
  override: TableAffixProps | undefined,
): ResolvedAffix {
  const base = typeof value === 'object' && value !== null ? value : {};
  const merged = { ...base, ...(override ?? {}) };
  return {
    enabled: !!value,
    container: merged.container ?? null,
    offsetTop: merged.offsetTop ?? 0,
    offsetBottom: merged.offsetBottom ?? 0,
    zIndex: merged.zIndex,
  };
}

/** 内容里的模板部分，纯文本内容返回 `null`。 */
function asTemplate(value: Content | null | undefined): TemplateRef<unknown> | null {
  return isTemplateContent(value) ? value : null;
}

/** 把类名取值拆成 token 列表。 */
function splitClasses(value: string | undefined): string[] {
  return value ? value.split(/\s+/).filter(Boolean) : [];
}

/**
 * 计算合并单元格：返回 cellKey → span 的映射。
  *
 * 先算出锚点单元格的 span，再把它覆盖到的其余单元格标记为 skipped，
 * 表体与表尾共用同一套规则（对应上游 `rowspanAndColspanInFooter`）。
 */
function buildCellSpans(
  rows: TableRow[],
  columns: TableColumn[],
  rowKey: string,
  handler: (params: TableRowspanParams) => TableRowspan | undefined,
): Map<string, TableCellSpan> {
  const map = new Map<string, TableCellSpan>();

  rows.forEach((row, rowIndex) => {
    columns.forEach((col, colIndex) => {
      const key = cellKeyOf(row, col, rowIndex, colIndex, rowKey);
      const state = map.get(key) ?? {};
      const result = handler({ row, col, rowIndex, colIndex });
      if (result?.rowspan) state.rowspan = result.rowspan;
      if (result?.colspan) state.colspan = result.colspan;
      if (state.rowspan || state.colspan) map.set(key, state);

      const maxRowIndex = rowIndex + (state.rowspan ?? 1);
      const maxColIndex = colIndex + (state.colspan ?? 1);
      for (let i = rowIndex; i < maxRowIndex; i += 1) {
        for (let j = colIndex; j < maxColIndex; j += 1) {
          if (i === rowIndex && j === colIndex) continue;
          if (!rows[i] || !columns[j]) return;
          const coveredKey = cellKeyOf(rows[i], columns[j], i, j, rowKey);
          const covered = map.get(coveredKey) ?? {};
          covered.skipped = true;
          map.set(coveredKey, covered);
        }
      }
    });
  });

  return map;
}

/** 单元格唯一键：行 key + 列 key，行 key 缺失时退化为行下标。 */
function cellKeyOf(
  row: TableRow,
  col: TableColumn,
  rowIndex: number,
  colIndex: number,
  rowKey: string,
): string {
  const rowValue = row[rowKey];
  const colValue = col.colKey || colIndex;
  return rowValue === undefined ? `__row_${rowIndex}___${colValue}` : `${rowValue}_${colValue}`;
}

/**
 * 表格。
  *
 * ```html
 * <t-table [data]="data" [columns]="columns" rowKey="id">
 *   <ng-template tTableCell="status" let-value>
 *     <t-tag theme="success">{{ value }}</t-tag>
 *   </ng-template>
 * </t-table>
 * ```
 */
@Component({
  selector: 't-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    TAffix,
    TButton,
    TCheckbox,
    TCheckboxGroup,
    TInput,
    TPagination,
    TPopup,
    TRadio,
    TRadioGroup,
    TTableRowAttributes,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './table.component.html',
})
export class TTable implements AfterViewChecked, OnDestroy {
  /** @zh 表格数据 @en Table data @defaultValue [] */
  readonly data = input<TableRow[]>([]);

  /** @zh 列配置 @en Column configuration @defaultValue [] */
  readonly columns = input<TableColumn[]>([]);

  /**
   * @zh 实际显示的列，按 colKey 的顺序渲染；传入后表格只渲染这些列
   * @en Columns to display, rendered in the order of the colKeys
   * @defaultValue undefined
   */
  readonly displayColumns = input<string[] | undefined>(undefined);

  /**
   * @zh 实际显示的列默认值，非受控场景生效
   * @en Default columns to display, used when uncontrolled
   * @defaultValue undefined
   */
  readonly defaultDisplayColumns = input<string[] | undefined>(undefined);

  /** @zh 行唯一标识字段 @en Field name of the row key @defaultValue 'id' */
  readonly rowKey = input('id');

  /** @zh 是否显示边框 @en Whether to show borders @defaultValue false */
  readonly bordered = input(false, { transform: booleanAttribute });

  /** @zh 是否显示斑马纹 @en Whether to show stripes @defaultValue false */
  readonly stripe = input(false, { transform: booleanAttribute });

  /** @zh 鼠标悬停高亮行 @en Whether to highlight the row on hover @defaultValue true */
  readonly hover = input(true, { transform: booleanAttribute });

  /** @zh 表格尺寸 @en Table size @defaultValue 'medium' @values small, medium, large */
  readonly size = input<TableSize>('medium');

  /** @zh 单元格垂直对齐 @en Vertical alignment of cells @defaultValue 'middle' @values top, middle, bottom */
  readonly verticalAlign = input<TableVerticalAlign>('middle');

  /** @zh 表格布局方式 @en Table layout mode @defaultValue 'fixed' @values auto, fixed */
  readonly tableLayout = input<TableLayout>('fixed');

  /** @zh 是否显示表头 @en Whether to show the header @defaultValue true */
  readonly showHeader = input(true, { transform: booleanAttribute });

  /** @zh 是否显示加载态 @en Whether the table is loading @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @zh 加载提示文字 @en Loading text @defaultValue '加载。 */
  readonly loadingText = input('加载中');

  /** @zh 空数据提示文案 @en Empty content @defaultValue '暂无数据' */
  readonly empty = input<string>('暂无数据');

  /** @zh 表格高度，超出后内部滚动 @en Table height, scrolls inside when exceeded @defaultValue undefined */
  readonly height = input<string | number | undefined>(undefined);

  /** @zh 表格最大高度，超出后内部滚动 @en Max table height, scrolls inside when exceeded @defaultValue undefined */
  readonly maxHeight = input<string | number | undefined>(undefined);

  /**
   * @zh 受控排序，传入后表格不再本地排序 @en Controlled sort, the table stops sorting locally once provided
   * @defaultValue undefined
   */
  readonly sort = input<TableSort | undefined>(undefined);

  /** @zh 默认排序，仅初始生效 @en Default sort, applied initially @defaultValue undefined */
  readonly defaultSort = input<TableSort | undefined>(undefined);

  /** @zh 是否支持多列排序 @en Whether multiple column sorting is allowed @defaultValue false */
  readonly multipleSort = input(false, { transform: booleanAttribute });

  /** @zh 排序变化 @en Emitted when the sort changes */
  readonly sortChange = output<TableSort | undefined>();

  /**
   * @zh 受控筛选值，传入后表格不再自己记录筛选状态 @en Controlled filter value, the table stops keeping filter state once provided
   * @defaultValue undefined
   */
  readonly filterValue = input<TableFilterValue | undefined>(undefined);

  /** @zh 默认筛选值，仅初始生效 @en Default filter value, applied initially @defaultValue undefined */
  readonly defaultFilterValue = input<TableFilterValue | undefined>(undefined);

  /** @zh 筛选变化，表格本身不改变数据，需要在使用方自行过滤 @en Emitted when the filter changes, filter the data yourself */
  readonly filterChange = output<TableFilterChangeEvent>();

  /**
   * @zh 受控的选中行 key，传入后表格不再自己记录选中状态 @en Controlled selected row keys, the table stops keeping selection state once provided
   * @defaultValue undefined
   */
  readonly selectedRowKeys = input<Array<string | number> | undefined>(undefined);

  /** @zh 默认选中的行 key，仅初始生效 @en Default selected row keys, applied initially @defaultValue undefined */
  readonly defaultSelectedRowKeys = input<Array<string | number> | undefined>(undefined);

  /** @zh 半选状态的行 key，用于表格外部控制半选 @en Row keys in indeterminate state @defaultValue [] */
  readonly indeterminateSelectedRowKeys = input<Array<string | number>>([]);

  /**
   * @zh 单选时是否允许再次点击取消选中 @en Whether clicking a selected row again deselects it in single mode
   * @defaultValue false
   */
  readonly rowSelectionAllowUncheck = input(false, { transform: booleanAttribute });

  /**
   * @zh 行选择器类型，覆盖列上 type 的渲染
   * @en Row selector type, overrides the type declared on the column
   * @values single, multiple
   * @defaultValue undefined
   */
  readonly rowSelectionType = input<TableRowSelectionType | undefined>(undefined);


  /** @zh 点击行时选中该行 @en Whether clicking a row selects it @defaultValue false */
  readonly selectOnRowClick = input(false, { transform: booleanAttribute });

  /** @zh 选中行变化 @en Emitted when the selected rows change */
  readonly selectChange = output<TableSelectChangeEvent>();

  /**
   * @zh 受控的展开行 key，传入后表格不再自己记录展开状态 @en Controlled expanded row keys, the table stops keeping expand state once provided
   * @defaultValue undefined
   */
  readonly expandedRowKeys = input<Array<string | number> | undefined>(undefined);

  /** @zh 默认展开的行 key，仅初始生效 @en Default expanded row keys, applied initially @defaultValue undefined */
  readonly defaultExpandedRowKeys = input<Array<string | number> | undefined>(undefined);

  /** @zh 点击行时展开 / 收起该行 @en Whether clicking a row toggles its expanded state @defaultValue false */
  readonly expandOnRowClick = input(false, { transform: booleanAttribute });

  /** @zh 是否显示展开图标列 @en Whether to show the expand icon column @defaultValue true */
  readonly expandIcon = input(true, { transform: booleanAttribute });

  /**
   * @zh 展开行内容，支持字符串与模板；传函数时按行返回内容
   * @en Expanded row content, accepts a string or a template; a function receives the row
   * @defaultValue undefined
   */
  readonly expandedRow = input<TableExpandedRowContent | undefined>(undefined);

  /** @zh 展开行变化 @en Emitted when the expanded rows change */
  readonly expandChange = output<TableExpandChangeEvent>();

  /**
   * @zh 分页配置，传入后表格底部显示分页；数据超过一页且未开启 disableDataPage 时自动本地分页。
    * @en Pagination config; the table renders a pager and paginates locally unless disableDataPage is on
   * @defaultValue undefined
   */
  readonly pagination = input<TablePagination | undefined>(undefined);

  /**
   * @zh 翻页时是否保留已选中的行
   * @en Whether selected rows are kept when changing page
   * @defaultValue true
   */
  readonly reserveSelectedRowOnPaginate = input(true, { transform: booleanAttribute });

  /**
   * @zh 关闭本地分页，只显示分页器并把翻页事件交给使用方（服务端分页。
    * @en Disable local pagination, only render the pager and emit page changes (server-side paging)
   * @defaultValue false
   */
  readonly disableDataPage = input(false, { transform: booleanAttribute });

  /** @zh 分页变化，携带新一页的数据 @en Emitted when the page changes, with the new page data */
  readonly pageChange = output<TablePageChangeEvent>();

  /**
   * @zh 合并单元格回调，返回 `{ rowspan, colspan }` 与相邻单元格合并
   * @en Merge cells by returning `{ rowspan, colspan }` for the target cell
   * @defaultValue undefined
   */
  readonly rowspanAndColspan = input<
    ((params: TableRowspanParams) => TableRowspan | undefined) | undefined
  >(undefined);

  /**
   * @zh 虚拟滚动配置，`type: 'virtual'` 且行数超过 `threshold` 时只渲染可视区域的行
   * @en Virtual scroll config; only visible rows are rendered when `type` is `virtual` and rows exceed `threshold`
   * @defaultValue undefined
   */
  readonly scroll = input<TableScroll | undefined>(undefined);

  /**
   * @zh 是否允许拖拽表头调整列宽，单列可以用 `resizable: false` 关闭
   * @en Whether column widths can be adjusted by dragging the header edge
   * @defaultValue false
   */
  readonly resizable = input(false, { transform: booleanAttribute });

  /** @zh 列宽拖拽结束，携带拖拽后的列宽 @en Emitted after a column resize drag ends */
  readonly columnResizeChange = output<TableColumnResizeEvent>();

  /**
   * @zh 受控的高亮行 key，传入后表格不再自己记录高亮行
   * @en Controlled active row keys, the table stops keeping highlight state once provided
   * @defaultValue undefined
   */
  readonly activeRowKeys = input<Array<string | number> | undefined>(undefined);

  /** @zh 默认高亮行 key，仅初始生效 @en Default active row keys, applied initially @defaultValue undefined */
  readonly defaultActiveRowKeys = input<Array<string | number> | undefined>(undefined);

  /**
   * @zh 键盘操作的高亮模式，`single` 单行、`multiple` 多行
   * @en Highlight mode used by keyboard operations, `single` or `multiple`
   * @defaultValue undefined @values single, multiple
   */
  readonly activeRowType = input<TableActiveRowType | undefined>(undefined);

  /**
   * @zh 空格键是否禁用取消高亮行 @en Whether pressing space can deactivate the active row
   * @defaultValue false
   */
  readonly disableSpaceInactiveRow = input(false, { transform: booleanAttribute });

  /** @zh 键盘移动时是否显示行悬停高亮 @en Whether keyboard navigation highlights the row @defaultValue false */
  readonly keyboardRowHover = input(false, { transform: booleanAttribute });

  /** @zh 高亮行变化 @en Emitted when the active rows change */
  readonly activeChange = output<TableActiveChangeEvent>();

  /** @zh 键盘操作高亮行时的动作 @en Emitted with the keyboard action applied to active rows */
  readonly activeRowAction = output<TableActiveRowActionEvent>();

  /** @zh 点击行 @en Emitted when a row is clicked */
  readonly rowClick = output<TableRowEventContext>();

  /** @zh 双击行 @en Emitted when a row is double clicked */
  readonly rowDblclick = output<TableRowEventContext>();

  /** @zh 行内按下鼠标 @en Emitted when the mouse button is pressed on a row */
  readonly rowMousedown = output<TableRowEventContext>();

  /** @zh 行内松开鼠标 @en Emitted when the mouse button is released on a row */
  readonly rowMouseup = output<TableRowEventContext>();

  /** @zh 鼠标进入行 @en Emitted when the pointer enters a row */
  readonly rowMouseenter = output<TableRowEventContext>();

  /** @zh 鼠标离开行 @en Emitted when the pointer leaves a row */
  readonly rowMouseleave = output<TableRowEventContext>();

  /** @zh 鼠标在行内移动 @en Emitted when the pointer moves inside a row */
  readonly rowMouseover = output<TableRowEventContext>();

  /** @zh 点击单元格 @en Emitted when a cell is clicked */
  readonly cellClick = output<TableCellClickEvent>();

  /** @zh 表格滚动 @en Emitted when the table scrolls, horizontally or vertically */
  readonly scrollChange = output<TableScrollEvent>();

  /** @zh 表格横向滚动 @en Emitted when the table scrolls horizontally */
  readonly scrollXChange = output<TableScrollEvent>();

  /** @zh 表格纵向滚动 @en Emitted when the table scrolls vertically */
  readonly scrollYChange = output<TableScrollEvent>();

  /**
   * @zh 表格顶部内容，渲染在表格内容之上 @en Content rendered above the table content
   * @defaultValue undefined
   */
  readonly topContent = input<Content>(undefined);

  /**
   * @zh 表格底部内容，渲染在分页之上 @en Content rendered below the table content, above the pager
   * @defaultValue undefined
   */
  readonly bottomContent = input<Content>(undefined);

  /**
   * @zh 表头下方的整行内容 @en Full-width content rendered as the first body row
   * @defaultValue undefined
   */
  readonly firstFullRow = input<Content>(undefined);

  /**
   * @zh 表尾上方的整行内容 @en Full-width content rendered as the last body row
   * @defaultValue undefined
   */
  readonly lastFullRow = input<Content>(undefined);

  /**
   * @zh 单元格内容为空时的占位，支持回调按单元格取值
   * @en Placeholder rendered when a cell is empty, a callback can return per-cell content
   * @defaultValue undefined
   */
  readonly cellEmptyContent = input<TableCellEmptyContent>(undefined);

  /** @zh 表尾数据，渲染在 `tfoot` 里 @en Footer data rendered in `tfoot` @defaultValue [] */
  readonly footData = input<TableRow[]>([]);

  /**
   * @zh 表尾整行总结内容，与 `footData` 二选一 @en Full-width footer summary, alternative to `footData`
   * @defaultValue undefined
   */
  readonly footerSummary = input<Content>(undefined);

  /**
   * @zh 表尾单元格合并回调 @en Merge footer cells by returning `{ rowspan, colspan }`
   * @defaultValue undefined
   */
  readonly rowspanAndColspanInFooter = input<
    ((params: TableRowspanParams) => TableRowspan | undefined) | undefined
  >(undefined);

  /**
   * @zh 固定行数，`[顶部固定行数, 底部固定行数]`，固定行不随内容滚动
   * @en Fixed row counts as `[top, bottom]`, fixed rows stay in place while the content scrolls
   * @defaultValue []
   */
  readonly fixedRows = input<number[]>([]);

  /**
   * @zh 行属性，支持对象、回调或它们的数组，`class` / `style` 会被合并
   * @en Row attributes: an object, a callback, or an array of both
   * @defaultValue undefined
   */
  readonly rowAttributes = input<TableRowAttributes | undefined>(undefined);

  /**
   * @zh 行类名，支持字符串、回调、按行下标或行 key 取值的映射、以及它们的数组
   * @en Row class names: a string, a callback, a map keyed by row index or row key, or an array of them
   * @defaultValue undefined
   */
  readonly rowClassName = input<TableRowClassName | undefined>(undefined);

  /**
   * @zh 表格内容宽度，超过容器宽度时出现横向滚动条
   * @en Width of the table content, a horizontal scrollbar shows up when it exceeds the container
   * @defaultValue undefined
   */
  readonly tableContentWidth = input<string | number | undefined>(undefined);

  /**
   * @zh 加载状态配置，可覆盖文案、图标与遮罩 @en Loading config overriding the text, indicator and overlay
   * @defaultValue undefined
   */
  readonly loadingProps = input<TableLoadingProps | undefined>(undefined);

  /**
   * @zh 语言配置，传入的字段优先于同名属性（如 `empty`、`loadingText`、`size`）
   * @en Locale config, its fields take precedence over the same-named props
   * @defaultValue undefined
   */
  readonly locale = input<TableLocale | undefined>(undefined);

  /**
   * @zh 表头吸顶，表格滚出可视区后表头固定在容器顶部；传对象可配置 `offsetTop` / `zIndex` / `container`
   * @en Affix the header to the top of the container once it scrolls out of view; pass an object to configure it
   * @defaultValue false
   */
  readonly headerAffixedTop = input<boolean | TableAffixProps>(false);

  /**
   * @zh 表头吸顶的附加配置，优先于 `headerAffixedTop` 里的对象
   * @en Extra affix config for the header, wins over the object passed to `headerAffixedTop`
   * @defaultValue undefined
   */
  readonly headerAffixProps = input<TableAffixProps | undefined>(undefined);

  /**
   * @zh 表尾吸底，表格滚出可视区后表尾固定在容器底部
   * @en Affix the footer to the bottom of the container once it scrolls out of view
   * @defaultValue false
   */
  readonly footerAffixedBottom = input<boolean | TableAffixProps>(false);

  /**
   * @zh 表尾吸底的附加配置，优先于 `footerAffixedBottom` 里的对象
   * @en Extra affix config for the footer, wins over the object passed to `footerAffixedBottom`
   * @defaultValue undefined
   */
  readonly footerAffixProps = input<TableAffixProps | undefined>(undefined);

  /**
   * @zh 分页吸底，分页器滚出可视区后固定在容器底部
   * @en Affix the pager to the bottom of the container once it scrolls out of view
   * @defaultValue undefined
   */
  readonly paginationAffixedBottom = input<boolean | TableAffixProps | undefined>(undefined);

  /**
   * @zh 横向滚动条吸底，表格较宽时在容器底部固定一条横向滚动条
   * @en Affix a horizontal scrollbar to the bottom of the container when the table is wider than it
   * @defaultValue undefined
   */
  readonly horizontalScrollAffixedBottom = input<boolean | TableAffixProps | undefined>(undefined);

  protected readonly sizes = TABLE_SIZES;
  protected readonly aligns = TABLE_ALIGNS;
  protected readonly layouts = TABLE_LAYOUTS;
  protected readonly verticalAligns = TABLE_VERTICAL_ALIGNS;
  protected readonly sortTypes = TABLE_SORT_TYPES;
  /** 展开图标列的 colKey，模板里用来判断特殊列。 */
  protected readonly expandColumnKey = EXPAND_COLUMN_KEY;

  private readonly innerSort = signal<TableSortInfo[]>([]);

  private readonly innerFilterValue = signal<TableFilterValue>({});

  /** 筛选面板里的草稿值，开启 showConfirmAndReset 时点「确定」才提交。 */
  private readonly draftFilterValue = signal<TableFilterValue>({});

  /** 当前展开筛选面板的列。 */
  private readonly openedFilterKey = signal<string | null>(null);

  /** 内部选中行 key，受控时忽略。 */
  private readonly innerSelectedRowKeys = signal<Array<string | number>>([]);

  /** 内部展开行 key，受控时忽略。 */
  private readonly innerExpandedRowKeys = signal<Array<string | number>>([]);

  /** 内部高亮行 key，受控时忽略。 */
  private readonly innerActiveRowKeys = signal<Array<string | number>>([]);

  /** 非受控分页时内部记录的页码 / 每页条数。 */
  private readonly innerPagination = signal<{ current: number; pageSize: number } | null>(null);

  private readonly injector = inject(Injector);

  /** 展开行模板。 */
  protected readonly expandedRowTemplate = contentChild(TTableExpandedRow);

  /** 行选择列：`type` 为 single / multiple 的列。 */
  protected readonly selectColumn = computed(
    () => this.rootColumns().find((col) => col.type === 'single' || col.type === 'multiple') ?? null,
  );

  /** 行选择类型：rowSelectionType 优先，其次看列上声明的 type。 */
  protected readonly selectionType = computed<TableRowSelectionType | null>(
    () => this.rowSelectionType() ?? this.selectColumn()?.type ?? null,
  );

  /** 是否渲染展开图标列。 */
  protected readonly showExpandColumn = computed(
    () => this.expandIcon() && (!!this.expandedRowTemplate() || this.expandedRow() !== undefined),
  );

  /** 非受控时的显示列。 */
  private readonly innerDisplayColumns = signal<string[] | undefined>(undefined);

  /** 生效的显示列：受控优先，其次非受控默认值；undefined 表示全部显示。 */
  protected readonly visibleColumnKeys = computed(
    () => this.displayColumns() ?? this.innerDisplayColumns(),
  );

  /** 根列：按显示列过滤，展开图标列固定在首列。 */
  protected readonly rootColumns = computed<TableColumn[]>(() => {
    const columns = filterColumnsByKeys(this.columns(), this.visibleColumnKeys());
    if (!this.showExpandColumn()) return columns;
    return [{ colKey: EXPAND_COLUMN_KEY, width: 46, className: 't-table__expandable-icon-cell' }, ...columns];
  });

  /** 实际渲染的列：多级表头只渲染叶子列。 */
  protected readonly renderColumns = computed<TableColumn[]>(() => flattenColumns(this.rootColumns()));

  /** 表头矩阵，第 0 行为最上层，每格带 rowspan / colspan。 */
  protected readonly headerRows = computed<TableHeaderCell[][]>(() => buildHeaderRows(this.rootColumns()));

  /** 是否多级表头（超过一行）。 */
  protected readonly hasMultiHeader = computed(() => this.headerRows().length > 1);

  /** 拖拽后的列宽（colKey → px），优先级高于列配置与实测宽度。 */
  private readonly columnWidthOverrides = signal<Record<string, number>>({});

  /** 当前拖拽线：可见性、横坐标与高度。 */
  protected readonly resizeLineState = signal({ visible: false, left: 0, top: 0, height: 0 });

  /**
   * 生效的列宽：拖拽结果 → 列配置的数字宽度 → 实测宽度（仅开启 resizable 时）。
    * 开启拖拽后总宽按实测宽度固定，否则表格按 100% 宽、拖动没有意义。 */
  protected readonly columnWidths = computed<Map<string, number>>(() => {
    const overrides = this.columnWidthOverrides();
    const measured = this.colWidths();
    const map = new Map<string, number>();
    for (const col of this.renderColumns()) {
      const width =
        overrides[col.colKey] ??
        this.numericWidth(col.width) ??
        (this.resizable() ? measured[col.colKey] : undefined);
      if (width !== undefined) map.set(col.colKey, width);
    }
    return map;
  });

  /** 当前选中的行 key。 */
  protected readonly selectedKeys = computed(() => this.selectedRowKeys() ?? this.innerSelectedRowKeys());

  private readonly selectedKeySet = computed(() => new Set(this.selectedKeys()));

  /** 当前展开的行 key。 */
  protected readonly expandedKeys = computed(() => this.expandedRowKeys() ?? this.innerExpandedRowKeys());

  private readonly expandedKeySet = computed(() => new Set(this.expandedKeys()));

  /** 当前高亮的行 key。 */
  protected readonly activeKeys = computed(() => this.activeRowKeys() ?? this.innerActiveRowKeys());

  private readonly activeKeySet = computed(() => new Set(this.activeKeys()));

  /** 键盘操作的当前行下标，-1 表示还没进入表格。 */
  private readonly currentOperationRowIndex = signal(-1);

  /** 键盘移动时高亮的行 key，仅 `keyboardRowHover` 打开时使用。 */
  private readonly hoveredRowKey = signal<string | number | null>(null);

  /** 是否按下了 Shift（区域选择）。 */
  private isShiftPressed = false;

  /** Shift 区域选择的起点行下标。 */
  private areaSelectionStartIndex = -1;

  /** 固定行的上下偏移（px），按实际行高测量得到。 */
  private readonly fixedRowOffsets = signal<{ top: number[]; bottom: number[] }>({ top: [], bottom: [] });

  /** 上一次测量固定行时的表格形态，变了才重新测量。 */
  private fixedRowSignature = '';

  /** 生效的表格尺寸：`locale.size` 优先。 */
  protected readonly effectiveSize = computed<TableSize>(() => this.locale()?.size ?? this.size());

  /** 生效的空数据内容：`locale.empty` 优先。 */
  protected readonly emptyContent = computed<Content>(() => this.locale()?.empty ?? this.empty());

  /** 空数据模板，模板内容优先于文本。 */
  protected readonly emptyTemplate = computed(() => asTemplate(this.emptyContent()));

  /** 空数据文本。 */
  protected readonly emptyText = computed(() => contentText(this.emptyContent()));

  /** 生效的加载文案：`loadingProps.text` → `locale.loadingText` → `loadingText`。 */
  protected readonly loadingContent = computed<Content>(
    () => this.loadingProps()?.text ?? this.locale()?.loadingText ?? this.loadingText(),
  );

  /** 加载模板。 */
  protected readonly loadingTemplate = computed(() => asTemplate(this.loadingContent()));

  /** 加载文本。 */
  protected readonly loadingTextContent = computed(() => contentText(this.loadingContent()));

  /** 自定义加载图标，`loadingProps.indicator === false` 时回落成默认图标。 */
  protected readonly loadingIndicator = computed(() => {
    const indicator = this.loadingProps()?.indicator;
    return typeof indicator === 'boolean' ? null : asTemplate(indicator ?? null);
  });

  /** 是否显示加载图标，`loadingProps.indicator === false` 时隐藏。 */
  protected readonly loadingShowIcon = computed(() => this.loadingProps()?.indicator !== false);

  /** 加载图标的尺寸类名，上游 loading 用 `t-size-s` / `m` / `l`。 */
  protected readonly loadingSizeClass = computed(() => {
    const size = this.loadingProps()?.size;
    const token = size === 'medium' ? 'm' : size === 'large' ? 'l' : 's';
    return `t-size-${token}`;
  });

  /** 是否显示加载遮罩。 */
  protected readonly loadingOverlay = computed(() => this.loadingProps()?.showOverlay ?? true);

  /** 表头 / 表尾是否吸顶吸底：传了高度时表头贴住顶部、表尾贴住底部。 */
  protected readonly isFixedHeader = computed(() => this.height() !== undefined || this.maxHeight() !== undefined);

  /** 表头吸顶配置。 */
  protected readonly headerAffix = computed(() => resolveAffix(this.headerAffixedTop(), this.headerAffixProps()));

  /** 表尾吸底配置。 */
  protected readonly footerAffix = computed(() => resolveAffix(this.footerAffixedBottom(), this.footerAffixProps()));

  /** 分页吸底配置。 */
  protected readonly paginationAffix = computed(() =>
    resolveAffix(this.paginationAffixedBottom(), undefined),
  );

  /** 横向滚动条吸底配置。 */
  protected readonly horizontalScrollAffix = computed(() =>
    resolveAffix(this.horizontalScrollAffixedBottom(), undefined),
  );

  /** 是否存在任意吸顶 / 吸底元素，用来决定要不要挂滚动监听与横向同步。 */
  protected readonly isAffixed = computed(
    () =>
      this.headerAffix().enabled ||
      this.footerAffix().enabled ||
      this.paginationAffix().enabled ||
      this.horizontalScrollAffix().enabled,
  );

  /** 吸顶 / 吸底元素的有效显隐：贴近表格边缘时让位给原位元素。 */
  protected readonly showAffixHeader = signal(true);
  protected readonly showAffixFooter = signal(true);
  protected readonly showAffixPagination = signal(true);

  /**
   * 吸底开关在首帧之后才生效：TAffix 在 ngOnInit 里就测一次高度，
   * 那时投影内容还没进 DOM，测到 0 就会按 0 高度固定下来再也回不去。
    * 先传 null 让首次测量不吸附，等首屏渲染完再传真实值触发重新测量。
   */
  protected readonly affixReady = signal(false);

  /** 吸顶表头高度，由原位表头测量得到，用来占位避免内容跳动。 */
  protected readonly affixedHeaderHeight = computed(() =>
    this.headerAffix().enabled ? this.headerHeight() : 0,
  );

  /** 吸顶 / 吸底表格的宽度：按内容实际宽度，表格比容器宽时也要对齐。 */
  protected readonly affixedTableWidth = computed(() => {
    const state = this.scrollState();
    return state.contentWidth || state.viewportWidth;
  });

  /** 分页状态：当前页 / 每页条数 / 总条数，非受控时用内部值兜底。 */
  protected readonly paginationState = computed(() => {
    const config = this.pagination();
    const inner = this.innerPagination();
    return {
      current: config?.current ?? inner?.current ?? config?.defaultCurrent ?? 1,
      pageSize: config?.pageSize ?? inner?.pageSize ?? config?.defaultPageSize ?? 10,
      total: config?.total ?? this.data().length,
    };
  });

  /** 是否本地分页：传了分页配置、没关掉 disableDataPage、且数据超过一页。 */
  protected readonly isPaginateData = computed(() => {
    if (!this.pagination() || this.disableDataPage()) return false;
    return this.data().length > this.paginationState().pageSize;
  });

  /** 当前页的数据，本地分页时已经切好。 */
  protected readonly pagedData = computed<TableRow[]>(() => {
    if (!this.isPaginateData()) return this.data();
    const { current, pageSize } = this.paginationState();
    const start = (current - 1) * pageSize;
    return this.data().slice(start, start + pageSize);
  });

  /** 当前页已选中的行数。 */
  private readonly selectedRowCount = computed(
    () => this.pagedData().filter((row) => this.selectedKeySet().has(this.keyOf(row))).length,
  );

  /** 是否全部选中（多选表头的复选框状态）。 */
  protected readonly allSelected = computed(
    () => this.pagedData().length > 0 && this.selectedRowCount() === this.pagedData().length,
  );

  /** 是否半选（多选表头的复选框状态）。 */
  protected readonly partiallySelected = computed(
    () => this.selectedRowCount() > 0 && this.selectedRowCount() < this.pagedData().length,
  );

  private readonly contentRef = viewChild<ElementRef<HTMLElement>>('content');

  /** 表格根元素，键盘操作时用来聚焦。 */
  private readonly rootRef = viewChild<ElementRef<HTMLElement>>('root');

  /** 吸顶表头的横向滚动容器，滚动位置跟着内容容器走。 */
  private readonly affixedHeaderElm = viewChild<ElementRef<HTMLElement>>('affixedHeaderElm');

  /** 吸底表尾的横向滚动容器。 */
  private readonly affixedFooterElm = viewChild<ElementRef<HTMLElement>>('affixedFooterElm');

  /** 吸底横向滚动条。 */
  private readonly affixedScrollbarElm = viewChild<ElementRef<HTMLElement>>('affixedScrollbarElm');

  /** 分页器容器，用来判断要不要显示吸底分页。 */
  private readonly paginationElm = viewChild<ElementRef<HTMLElement>>('paginationElm');

  /** 实测列宽（colKey → px）。固定列偏移优先用它，取不到时回退到列配置的数字宽度。 */
  private readonly colWidths = signal<Record<string, number>>({});

  /** 横向滚动状态，用于决定固定列两侧的阴影分界线是否显示。 */
  protected readonly scrollState = signal({ scrollLeft: 0, contentWidth: 0, viewportWidth: 0 });

  /** 上一次滚动位置，用来判断横向 / 纵向滚动是否真的变了。 */
  private readonly lastScrollPosition = { left: 0, top: 0 };

  private resizeObserver?: ResizeObserver;

  /** 页面滚动监听是否已挂上。 */
  private affixWatching = false;

  /** 合并页面滚动回调用的帧号。 */
  private affixFrame = 0;

  /** 解绑页面滚动监听。 */
  private detachAffixWatchers?: () => void;

  /** 是否存在固定列。 */
  protected readonly hasFixedColumn = computed(() => this.columns().some((col) => !!col.fixed));

  /** 固定列偏移：colKey → 距离表格左 / 右边缘的像素值。 */
  protected readonly fixedOffset = computed(() => {
    const columns = this.columns();
    const widths = this.colWidths();
    const overrides = this.columnWidthOverrides();
    const widthOf = (col: TableColumn) =>
      overrides[col.colKey] ?? widths[col.colKey] ?? this.numericWidth(col.width) ?? 0;
    const map = new Map<string, number>();

    let left = 0;
    for (const col of columns) {
      if (col.fixed !== 'left') continue;
      map.set(col.colKey, left);
      left += widthOf(col);
    }

    let right = 0;
    for (let index = columns.length - 1; index >= 0; index--) {
      const col = columns[index];
      if (col.fixed !== 'right') continue;
      map.set(col.colKey, right);
      right += widthOf(col);
    }
    return map;
  });

  /** 左侧最后一个固定列，用来挂滚动分界线。 */
  protected readonly lastLeftKey = computed(() => {
    const columns = this.renderColumns();
    let key: string | null = null;
    columns.forEach((col, index) => {
      if (col.fixed === 'left' && columns[index + 1]?.fixed !== 'left') key = col.colKey;
    });
    return key;
  });

  /** 右侧第一个固定列，用来挂滚动分界线。 */
  protected readonly firstRightKey = computed(() => {
    const columns = this.renderColumns();
    const index = columns.findIndex((col) => col.fixed === 'right');
    return index < 0 ? null : columns[index].colKey;
  });

  /** 已向右滚动且存在左侧固定列时显示左阴影。 */
  protected readonly showLeftShadow = computed(
    () => this.scrollState().scrollLeft > 0 && this.renderColumns().some((col) => col.fixed === 'left'),
  );

  /** 右侧还有未滚动到的内容且存在右侧固定列时显示右阴影。 */
  protected readonly showRightShadow = computed(() => {
    const scroll = this.scrollState();
    if (!this.renderColumns().some((col) => col.fixed === 'right')) return false;
    return scroll.scrollLeft + scroll.viewportWidth < scroll.contentWidth - 1;
  });

  /** 内容是否横向溢出容器，用于 `t-table--width-overflow`。 */
  protected readonly hasHorizontalOverflow = computed(() => {
    const scroll = this.scrollState();
    return scroll.contentWidth > scroll.viewportWidth + 1;
  });

  /** 滚动容器的类名：分界线阴影挂在 `.t-table__content` 上，与样式文件一致。 */
  protected readonly contentClasses = computed(() =>
    [
      't-table__content',
      this.showLeftShadow() ? 't-table__content--scrollable-to-left' : '',
      this.showRightShadow() ? 't-table__content--scrollable-to-right' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  private readonly cellDirectives = contentChildren(TTableCell);

  /** colKey → 单元格模板。 */
  protected readonly cellTemplates = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const directive of this.cellDirectives()) {
      map.set(directive.colKey(), directive.template);
    }
    return map;
  });

  /**
   * 单元格合并状态：cellKey → `{ rowspan, colspan, skipped }`。
    * 与上游 `useRowspanAndColspan` 一致：先算出锚点单元格的 span。
     * 再把它覆盖到的其余单元格标记为 skipped（渲染时直接跳过）。
   */
  private readonly cellSpans = computed<Map<string, TableCellSpan>>(() => {
    const handler = this.rowspanAndColspan();
    if (!handler) return new Map<string, TableCellSpan>();
    return buildCellSpans(this.rows(), this.renderColumns(), this.rowKey(), handler);
  });

  /** 表尾的单元格合并状态，规则与表体一致。 */
  private readonly footerSpans = computed<Map<string, TableCellSpan>>(() => {
    const handler = this.rowspanAndColspanInFooter();
    if (!handler) return new Map<string, TableCellSpan>();
    return buildCellSpans(this.footData(), this.renderColumns(), this.rowKey(), handler);
  });

  protected readonly classes = computed(() =>
    [
      't-table',
      this.bordered() ? 't-table--bordered' : '',
      this.stripe() ? 't-table--striped' : '',
      this.hover() ? 't-table--hoverable' : '',
      `t-table--align-${this.verticalAlign()}`,
      SIZE_CLASS[this.effectiveSize()],
      this.loading() ? 't-table--loading' : '',
      this.selectColumn() ? 't-table--row-select' : '',
      this.showExpandColumn() ? 't-table--row-expandable' : '',
      this.hasMultiHeader() ? 't-table--multiple-header' : '',
      this.rowspanAndColspan() || this.rowspanAndColspanInFooter() ? 't-table--rowspan-colspan' : '',
      this.hasFixedColumn() ? 't-table--column-fixed' : '',
      this.resizable() ? 't-table--column-resizable' : '',
      this.isFixedHeader() ? 't-table--header-fixed' : '',
      this.activeRowType() ? `t-table__row--active-${this.activeRowType()}` : '',
      this.headerAffix().enabled ? 't-table--affixed-header' : '',
    this.footerAffix().enabled ? 't-table--footer-affixed' : '',
    this.horizontalScrollAffix().enabled ? 't-table--horizontal-bar-affixed' : '',
    this.hasHorizontalOverflow() ? 't-table--width-overflow' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** table-layout 只对 <table> 生效，所以类名要放在表格元素上。 */
  protected readonly tableLayoutClass = computed(() => `t-table--layout-${this.tableLayout()}`);

  protected readonly contentStyle = computed(() => {
    const height = this.height();
    const maxHeight = this.maxHeight();
    const style: Record<string, string> = {};

    if (height !== undefined) {
      style['height'] = this.toLength(height);
      style['overflow'] = 'auto';
    }
    if (maxHeight !== undefined) {
      style['max-height'] = this.toLength(maxHeight);
      style['overflow'] = 'auto';
    }
    return Object.keys(style).length ? style : null;
  });

  /**
   * 只有「所有列都写了固定宽度」时才给表格设总宽。
    * 否则交回 100%，让浏览器按剩余空间分配（与上游一致）。 */
  protected readonly tableWidth = computed(() => {
    // 显式传了表宽就以它为准
    const contentWidth = this.tableContentWidth();
    if (contentWidth !== undefined) return this.toLength(contentWidth);

    const columns = this.renderColumns();
    if (!columns.length) return null;

    const widths = this.columnWidths();
    if (columns.some((col) => !widths.has(col.colKey))) return null;

    const total = columns.reduce((sum, col) => sum + (widths.get(col.colKey) ?? 0), 0);
    return `${total}px`;
  });

  /** 当前排序状态：colKey → asc / desc。 */
  protected readonly sortState = computed(() => {
    const controlled = this.sort();
    const list = this.normalizeSort(controlled === undefined ? this.innerSort() : controlled);
    return new Map(list.map((info) => [info.sortBy, info.descending ? 'desc' : 'asc'] as const));
  });

  /** 当前筛选值：受控时用外部传入的，否则用内部状态。 */
  protected readonly filterState = computed<TableFilterValue>(() => {
    const controlled = this.filterValue();
    return controlled === undefined ? this.innerFilterValue() : controlled;
  });

  /** 展示用数据：先按分页切页，再按本地排序重排；受控排序时只切页。 */
  protected readonly rows = computed(() => {
    const data = this.pagedData();
    if (this.sort() !== undefined) return data;

    const sortList = this.innerSort();
    if (!sortList.length) return data;

    const columns = this.columns();
    return [...data].sort((a, b) => {
      for (const info of sortList) {
        const col = columns.find((item) => item.colKey === info.sortBy);
        const result = this.compare(a, b, info.sortBy, col);
        if (result !== 0) return info.descending ? -result : result;
      }
      return 0;
    });
  });

  /** 虚拟滚动行高。 */
  protected readonly virtualRowHeight = computed(() => this.scroll()?.rowHeight ?? 47);

  private readonly virtualBuffer = computed(() => this.scroll()?.bufferSize ?? 10);

  private readonly virtualThreshold = computed(() => this.scroll()?.threshold ?? 100);

  /** 是否启用虚拟滚动：`type: 'virtual'` 且行数超过阈值。 */
  protected readonly isVirtualScroll = computed(
    () => this.scroll()?.type === 'virtual' && this.rows().length > this.virtualThreshold(),
  );

  private readonly scrollTop = signal(0);

  private readonly viewportHeight = signal(0);

  /** 虚拟滚动的可视范围（含上下缓冲区）。 */
  private readonly virtualRange = computed(() => {
    const rowHeight = this.virtualRowHeight() || 47;
    const buffer = this.virtualBuffer();
    const total = this.rows().length;
    if (!this.isVirtualScroll()) return { startIndex: 0, endIndex: total, translateY: 0 };

    const startIndex = Math.max(Math.floor(this.scrollTop() / rowHeight) - buffer, 0);
    const capacity = Math.ceil(this.viewportHeight() / rowHeight) + buffer * 2 + 1;
    return {
      startIndex,
      endIndex: Math.min(startIndex + capacity, total),
      translateY: startIndex * rowHeight,
    };
  });

  /** 实际渲染的行：虚拟滚动时只含可视范围，行下标仍是全局下标。 */
  protected readonly tableRows = computed(() => {
    const rows = this.rows();
    const { startIndex, endIndex } = this.virtualRange();
    return rows.slice(startIndex, endIndex).map((row, index) => ({ row, rowIndex: startIndex + index }));
  });

  /** 虚拟滚动的占位高度，决定滚动条长度。 */
  protected readonly virtualScrollHeight = computed(
    () => this.rows().length * (this.virtualRowHeight() || 47),
  );

  /** tbody 位移，让可视行落在正确位置。 */
  protected readonly tbodyTransform = computed(() => {
    const { translateY } = this.virtualRange();
    return this.isVirtualScroll() && translateY ? `translateY(${translateY}px)` : null;
  });

  /** 表头高度，虚拟滚动时用来对齐占位高度与行位置。 */
  private readonly headerHeight = signal(0);

  /** 表尾高度，吸底表尾要用它把克隆表叠回原位。 */
  protected readonly footerHeight = signal(0);

  /** 内容区原生横向滚动条占位高度。 */
  protected readonly scrollbarHeight = signal(0);

  /** 虚拟滚动占位元素的高度：行总高加上表头，保证最后一行能滚到视口底部。 */
  protected readonly virtualCursorHeight = computed(
    () =>
      this.virtualScrollHeight() +
      (this.showHeader() && this.isVirtualScroll() ? this.headerHeight() : 0),
  );

  constructor() {
    effect(() => {
      const defaultSort = this.defaultSort();
      untracked(() => {
        if (defaultSort !== undefined) this.innerSort.set(this.normalizeSort(defaultSort));
      });
    });

    effect(() => {
      const defaultFilterValue = this.defaultFilterValue();
      untracked(() => {
        if (defaultFilterValue !== undefined) this.innerFilterValue.set({ ...defaultFilterValue });
      });
    });

    effect(() => {
      const defaultSelected = this.defaultSelectedRowKeys();
      untracked(() => {
        if (defaultSelected !== undefined) this.innerSelectedRowKeys.set([...defaultSelected]);
      });
    });

    effect(() => {
      const defaultExpanded = this.defaultExpandedRowKeys();
      untracked(() => {
        if (defaultExpanded !== undefined) this.innerExpandedRowKeys.set([...defaultExpanded]);
      });
    });

    effect(() => {
      const defaultActive = this.defaultActiveRowKeys();
      untracked(() => {
        if (defaultActive !== undefined) this.innerActiveRowKeys.set([...defaultActive]);
      });
    });

    effect(() => {
      const defaultDisplayColumns = this.defaultDisplayColumns();
      untracked(() => {
        if (defaultDisplayColumns !== undefined) this.innerDisplayColumns.set([...defaultDisplayColumns]);
      });
    });

    // 固定列需要实测宽度：首屏渲染后量一次，列宽 / 数据变化后再量。
    afterNextRender(() => {
      this.setupFixedColumns();
      this.setupAffixWatchers();
      // 首屏布局完成后才把吸底开关交给 TAffix，避免它按 0 高度测量吸附
      requestAnimationFrame(() => this.affixReady.set(true));
    });

    effect(() => {
      this.columns();
      this.rows();
      untracked(() => this.scheduleColumnMeasure());
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.detachAffixWatchers?.();
    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);
  }

  /** 渲染后测量固定行高度，算出吸顶 / 吸底偏移。 */
  ngAfterViewChecked(): void {
    this.measureFixedRows();
  }

  /**
   * 测量固定行。
   *
   * `fixedRows` 只给出「顶部 / 底部固定几行」，每行的 `top` / `bottom` 需要按真实
   * 行高累加，否则多行同时固定会叠在一起；行高只能渲染后读，因此放在视图检查里，
   * 并用签名挡住没有变化的重测。
   */
  private measureFixedRows(): void {
    const [topCount = 0, bottomCount = 0] = this.fixedRows();
    const rows = this.rows();

    if ((!topCount && !bottomCount) || !rows.length) {
      if (this.fixedRowSignature) {
        this.fixedRowSignature = '';
        this.fixedRowOffsets.set({ top: [], bottom: [] });
      }
      return;
    }

    const widthSignature = [...this.columnWidths().values()].join(',');
    const signature = [
      topCount,
      bottomCount,
      rows.length,
      this.keyOf(rows[0]),
      this.keyOf(rows[rows.length - 1]),
      widthSignature,
    ].join(':');
    if (signature === this.fixedRowSignature) return;

    const body = this.contentRef()?.nativeElement.querySelector('tbody');
    if (!body) return;

    const elements = Array.from(body.children).filter(
      (element): element is HTMLTableRowElement =>
        element instanceof HTMLTableRowElement &&
        !element.classList.contains('t-table__row--full') &&
        !element.classList.contains('t-table__expanded-row'),
    );
    const fallbackHeight = this.scroll()?.rowHeight ?? 47;
    const heightOf = (index: number): number => elements[index]?.offsetHeight || fallbackHeight;

    const top: number[] = [];
    let offset = this.isFixedHeader() ? this.headerHeight() : 0;
    for (let index = 0; index < topCount && index < rows.length; index += 1) {
      top[index] = Math.round(offset);
      offset += heightOf(index);
    }

    const bottom: number[] = [];
    let bottomOffset = 0;
    for (let index = rows.length - 1; index >= 0 && index >= rows.length - bottomCount; index -= 1) {
      bottom[index] = Math.round(bottomOffset);
      bottomOffset += heightOf(index);
    }

    this.fixedRowSignature = signature;
    this.fixedRowOffsets.set({ top, bottom });
  }

  /** 拖拽中的临时状态。 */
  private resizeDrag: {
    colKey: string;
    nextKey: string | null;
    startX: number;
    startLeft: number;
    startWidth: number;
    nextWidth: number;
    minWidth: number;
    maxWidth: number;
  } | null = null;

  /** 鼠标当前停在哪一列的右边缘。 */
  private resizeHoverKey: string | null = null;

  /** 表头鼠标移动：靠近列右边界 8px 内显示 col-resize，并把该列记为拖拽目标。 */
  protected handleHeaderMouseMove(event: MouseEvent, col: TableColumn): void {
    if (!this.isColumnResizable(col)) return;

    const cell = event.currentTarget as HTMLElement;
    const rect = cell.getBoundingClientRect();
    const nearRight = rect.right - event.clientX <= 8;
    const previous = event.clientX - rect.left <= 8 ? this.siblingColumn(col, -1) : null;

    if (nearRight) {
      this.resizeHoverKey = col.colKey;
      cell.style.cursor = 'col-resize';
      return;
    }
    if (previous) {
      this.resizeHoverKey = previous.colKey;
      cell.style.cursor = 'col-resize';
      return;
    }
    this.resizeHoverKey = null;
    cell.style.cursor = '';
  }

  protected handleHeaderMouseLeave(event: MouseEvent): void {
    (event.currentTarget as HTMLElement).style.cursor = '';
  }

  /** 按下表头右边缘：记录初始宽度，拖拽期间只移动竖线。 */
  protected handleHeaderMouseDown(event: MouseEvent, col: TableColumn): void {
    const key = this.resizeHoverKey;
    if (!key || !this.resizable()) return;

    const target = this.renderColumns().find((item) => item.colKey === key);
    const element = this.contentRef()?.nativeElement;
    if (!target || !element) return;

    const th = Array.from(element.querySelectorAll<HTMLElement>('thead th[data-colkey]')).find(
      (item) => item.dataset['colkey'] === key,
    );
    if (!th) return;

    event.preventDefault();
    const rect = th.getBoundingClientRect();
    const contentRect = element.getBoundingClientRect();
    const widths = this.columnWidths();
    const next = this.siblingColumn(target, 1);
    const minWidth = Math.max(target.resize?.minWidth ?? 80, this.numericWidth(target.minWidth) ?? 0);

    this.resizeDrag = {
      colKey: key,
      nextKey: next?.colKey ?? null,
      startX: event.clientX,
      startLeft: rect.right - contentRect.left,
      startWidth: widths.get(key) ?? rect.width,
      nextWidth: next ? (widths.get(next.colKey) ?? 0) : 0,
      minWidth,
      maxWidth: target.resize?.maxWidth ?? 600,
    };
    this.resizeLineState.set({
      visible: true,
      left: this.resizeDrag.startLeft,
      top: rect.top - contentRect.top,
      height: contentRect.bottom - rect.top,
    });

    document.addEventListener('mousemove', this.handleResizeMove);
    document.addEventListener('mouseup', this.handleResizeEnd, { once: true });
  }

  private readonly handleResizeMove = (event: MouseEvent): void => {
    const drag = this.resizeDrag;
    if (!drag) return;

    const delta = event.clientX - drag.startX;
    const left = Math.min(
      Math.max(drag.startLeft + delta, drag.startLeft - (drag.startWidth - drag.minWidth)),
      drag.startLeft + (drag.maxWidth - drag.startWidth),
    );
    this.resizeLineState.set({ ...this.resizeLineState(), visible: true, left });
  };

  private readonly handleResizeEnd = (): void => {
    const drag = this.resizeDrag;
    const left = this.resizeLineState().left;
    document.removeEventListener('mousemove', this.handleResizeMove);
    this.resizeDrag = null;
    this.resizeLineState.set({ visible: false, left: 0, top: 0, height: 0 });
    if (!drag) return;

    const width = Math.round(
      Math.min(Math.max(drag.startWidth + (left - drag.startLeft), drag.minWidth), drag.maxWidth),
    );
    if (width === Math.round(drag.startWidth)) return;

    const next = { ...Object.fromEntries(this.columnWidths()) };
    const consumed = width - drag.startWidth;
    next[drag.colKey] = width;

    if (drag.nextKey && drag.nextWidth > 0) {
      const nextCol = this.renderColumns().find((item) => item.colKey === drag.nextKey);
      const nextMin = Math.max(nextCol?.resize?.minWidth ?? 80, this.numericWidth(nextCol?.minWidth) ?? 0);
      next[drag.nextKey] = Math.max(nextMin, Math.round(drag.nextWidth - consumed));
    }

    this.columnWidthOverrides.set({ ...this.columnWidthOverrides(), ...next });
    this.columnResizeChange.emit({ columnsWidth: next });
  };

  /** 同一层级相邻的可拖拽列（跳过显式关闭拖拽的列）。 */
  private siblingColumn(col: TableColumn, step: 1 | -1): TableColumn | null {
    const columns = this.renderColumns();
    let index = columns.findIndex((item) => item.colKey === col.colKey);
    while (index >= 0) {
      index += step;
      const candidate = columns[index];
      if (!candidate) return null;
      if (candidate.resizable !== false) return candidate;
    }
    return null;
  }

  protected handleScroll(event: Event): void {
    const element = event.target as HTMLElement;
    this.updateScrollState(element);
    if (this.isVirtualScroll()) {
      this.scrollTop.set(element.scrollTop);
      this.viewportHeight.set(element.clientHeight);
    }
    // 吸顶表头 / 吸底表尾 / 吸底滚动条共用同一条横向滚动位置
    this.syncAffixedScroll(element);

    // 滚动事件只在与上一次不同的时候抛，避免高频重复
    const position = { left: element.scrollLeft, top: element.scrollTop };
    if (position.left !== this.lastScrollPosition.left) {
      this.lastScrollPosition.left = position.left;
      this.scrollXChange.emit({ e: event as unknown as WheelEvent });
    }
    if (position.top !== this.lastScrollPosition.top) {
      this.lastScrollPosition.top = position.top;
      this.scrollYChange.emit({ e: event as unknown as WheelEvent });
    }
    this.scrollChange.emit({ e: event as unknown as WheelEvent });
  }

  /** 表格分页器的尺寸：large 没有对应分页尺寸，回落到 medium。 */
  protected readonly paginationSize = computed<'small' | 'medium'>(() =>
    this.effectiveSize() === 'small' ? 'small' : 'medium',
  );

  /** 翻页：非受控时记下页码，随后把滚动位置复位并抛出事件。 */
  protected handlePageChange(pageInfo: PageInfo): void {
    const config = this.pagination();
    if (!config) return;

    if (config.current === undefined) {
      this.innerPagination.set({ current: pageInfo.current, pageSize: pageInfo.pageSize });
    }

    // 未开启 reserveSelectedRowOnPaginate 时，翻页后丢弃不在当前页的选中项
    if (!this.reserveSelectedRowOnPaginate()) {
      const start = (pageInfo.current - 1) * pageInfo.pageSize;
      const pageRows = this.disableDataPage() ? this.data() : this.data().slice(start, start + pageInfo.pageSize);
      const pageKeys = new Set(pageRows.map((row) => this.keyOf(row)));
      const currentKeys = this.selectedKeys();
      const next = currentKeys.filter((key) => pageKeys.has(key));
      if (next.length !== currentKeys.length) this.commitSelection(next, 'uncheck');
    }

    const data = this.data();
    const start = (pageInfo.current - 1) * pageInfo.pageSize;
    const dataSource = this.disableDataPage() ? data : data.slice(start, start + pageInfo.pageSize);

    const content = this.contentRef()?.nativeElement;
    if (content) {
      content.scrollTop = 0;
      content.scrollLeft = 0;
    }

    this.pageChange.emit({ pageInfo, dataSource });
  }

  protected isRowSelected(row: TableRow): boolean {
    return this.selectedKeySet().has(this.keyOf(row));
  }

  protected isRowIndeterminate(row: TableRow): boolean {
    return this.indeterminateSelectedRowKeys().includes(this.keyOf(row));
  }

  /** 行选择：单选只能选中一个，多选累加；单选允许取消时再次点击可清空。 */
  protected handleSelectRow(row: TableRow, checked: boolean): void {
    const key = this.keyOf(row);
    const current = this.selectedKeys();
    const isSingle = this.selectionType() === 'single';

    if (isSingle && !checked && !this.rowSelectionAllowUncheck()) return;

    const next = isSingle
      ? checked
        ? [key]
        : current.filter((item) => item !== key)
      : checked
        ? current.includes(key)
          ? current
          : [...current, key]
        : current.filter((item) => item !== key);

    this.commitSelection(next, checked ? 'check' : 'uncheck', key, row);
  }

  /** 多选表头：全选当前页，同时保留不在当前页的已选 key。 */
  protected handleSelectAll(checked: boolean): void {
    const current = this.selectedKeys();
    const keys = this.data().map((row) => this.keyOf(row));
    const next = checked
      ? Array.from(new Set([...current, ...keys]))
      : current.filter((key) => !keys.includes(key));
    this.commitSelection(next, checked ? 'check' : 'uncheck');
  }

  protected isRowExpanded(row: TableRow): boolean {
    return this.expandedKeySet().has(this.keyOf(row));
  }

  protected handleExpandClick(event: Event, row: TableRow): void {
    // 展开图标所在单元格不再触发行的点击（选中 / 展开）逻辑
    event.stopPropagation();
    this.toggleExpand(row);
  }

  /** 点击行：抛出事件，并按需高亮 / 展开 / 选中。 */
  protected handleRowClick(event: Event, row: TableRow, rowIndex: number): void {
    if (this.activeRowType()) {
      this.activateRow(rowIndex);
      // 键盘操作要能接着用，点击后把焦点移到表格上
      this.rootRef()?.nativeElement.focus({ preventScroll: true });
    }
    this.rowClick.emit({ row, index: rowIndex, e: event });
    if (this.expandOnRowClick() && this.showExpandColumn()) this.toggleExpand(row);
    if (this.selectOnRowClick() && this.selectColumn()) this.handleSelectRow(row, !this.isRowSelected(row));
  }

  /** 其余行事件：双击 / 按下 / 松开 / 进入 / 离开 / 移动。 */
  protected handleRowEvent(
    type: 'rowDblclick' | 'rowMousedown' | 'rowMouseup' | 'rowMouseenter' | 'rowMouseleave' | 'rowMouseover',
    event: Event,
    row: TableRow,
    rowIndex: number,
  ): void {
    this[type].emit({ row, index: rowIndex, e: event });
  }

  /** 点击单元格。 */
  protected handleCellClick(event: Event, row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): void {
    this.cellClick.emit({ row, col, rowIndex, colIndex, e: event });
  }

  /** 行类名：固定行 → 自定义类名 → 高亮 / 键盘悬停。 */
  protected rowClasses(row: TableRow, rowIndex: number): string {
    const key = this.keyOf(row);
    const classes = [...this.fixedRowClasses(rowIndex), ...this.customRowClasses(row, rowIndex, 'body')];
    if (this.activeKeySet().has(key)) classes.push('t-table__row--active');
    if (this.hoveredRowKey() === key) classes.push('t-table__row--hover');
    return classes.filter(Boolean).join(' ');
  }

  /** 行内联样式：固定行要把 `top` / `bottom` 偏移写到行上。 */
  protected rowStyle(rowIndex: number): Record<string, string> | null {
    const offsets = this.fixedRowOffsets();
    const style: Record<string, string> = {};
    const top = offsets.top[rowIndex];
    const bottom = offsets.bottom[rowIndex];
    if (top !== undefined) style['top'] = `${top}px`;
    if (bottom !== undefined) style['bottom'] = `${bottom}px`;
    return Object.keys(style).length ? style : null;
  }

  /** 行属性：多个来源按顺序合并，`class` 拼接、`style` 逐项合并。 */
  protected rowAttributesOf(row: TableRow, rowIndex: number, type: 'body' | 'foot'): TableRowAttributesValue | null {
    const source = this.rowAttributes();
    if (!source) return null;

    const params: TableRowAttributesParams = { row, rowIndex, type };
    const items = Array.isArray(source) ? source : [source];
    const attributes: TableRowAttributesValue = {};
    const classNames: unknown[] = [];
    const styles: Record<string, unknown> = {};

    for (const item of items) {
      const value = typeof item === 'function' ? item(params) : item;
      if (!value) continue;
      for (const [name, entry] of Object.entries(value)) {
        if (name === 'class') classNames.push(entry);
        else if (name === 'style') Object.assign(styles, entry as Record<string, unknown>);
        else attributes[name] = entry;
      }
    }

    if (classNames.length) attributes['class'] = classNames;
    if (Object.keys(styles).length) attributes['style'] = styles;
    return Object.keys(attributes).length ? attributes : null;
  }

  /** 自定义行类名，支持字符串 / 回调 / 映射 / 数组。 */
  private customRowClasses(row: TableRow, rowIndex: number, type: 'body' | 'foot'): string[] {
    const source = this.rowClassName();
    if (!source) return [];

    const params: TableRowClassNameParams = { row, rowIndex, rowKey: this.keyOf(row), type };
    const items = Array.isArray(source) ? source : [source];
    return items.flatMap((item) => {
      if (typeof item === 'function') return splitClasses(item(params));
      if (typeof item === 'string') return splitClasses(item);
      // 对象形式先用行下标、再用行 key 取值，与上游一致
      return splitClasses(item[rowIndex] ?? item[params.rowKey]);
    });
  }

  /** 固定行的类名：顶部固定、底部固定、底部第一行、以及它上面那行的去边框。 */
  private fixedRowClasses(rowIndex: number): string[] {
    const [topCount = 0, bottomCount = 0] = this.fixedRows();
    if (!topCount && !bottomCount) return [];

    const classes: string[] = [];
    if (topCount && rowIndex < topCount) classes.push('t-table__row--fixed-top');

    const firstFixedBottomRow = this.rows().length - bottomCount;
    if (bottomCount && rowIndex >= firstFixedBottomRow) {
      classes.push('t-table__row--fixed-bottom');
      if (rowIndex === firstFixedBottomRow) classes.push('t-table__row--fixed-bottom-first');
      if (rowIndex === firstFixedBottomRow - 1) classes.push('t-table__row--without-border-bottom');
    }
    return classes;
  }

  /** 高亮行：单选取代、多选累加，再次操作取消。 */
  private activateRow(rowIndex: number, source: 'mouse' | 'keyboard' = 'mouse'): void {
    const rows = this.rows();
    const row = rows[rowIndex];
    if (!row) return;

    const key = this.keyOf(row);
    const keys = this.activeKeys();
    const isActive = keys.includes(key);

    if (isActive && source === 'keyboard' && this.disableSpaceInactiveRow()) {
      this.activeRowAction.emit({ action: 'space-one-selection', activeRowList: this.activeRowList(keys) });
      return;
    }

    const next =
      this.activeRowType() === 'single'
        ? isActive
          ? []
          : [key]
        : isActive
          ? keys.filter((item) => item !== key)
          : [...keys, key];

    this.commitActiveRows(next, isActive ? 'inactive' : 'active', row);
  }

  /** Shift 区域选择：把起止行之间的行全部高亮。 */
  private activateRange(fromIndex: number, toIndex: number): void {
    const rows = this.rows();
    const start = Math.max(0, Math.min(fromIndex, toIndex));
    const end = Math.min(rows.length - 1, Math.max(fromIndex, toIndex));
    if (end < start) return;

    const keys = rows.slice(start, end + 1).map((row) => this.keyOf(row));
    const next = this.activeRowType() === 'single' ? keys.slice(0, 1) : keys;
    this.activeRowAction.emit({ action: 'shift-area-selection', activeRowList: this.activeRowList(next) });
    this.commitActiveRows(next, 'active', rows[end]);
  }

  private commitActiveRows(
    keys: Array<string | number>,
    type: 'active' | 'inactive',
    currentRowData?: TableRow,
  ): void {
    if (this.activeRowKeys() === undefined) this.innerActiveRowKeys.set([...keys]);
    this.activeChange.emit({
      activeRowKeys: [...keys],
      activeRowList: this.activeRowList(keys),
      currentRowData,
      type,
    });
  }

  private activeRowList(keys: Array<string | number>): Array<TableActiveRowItem> {
    const set = new Set(keys);
    const list: Array<TableActiveRowItem> = [];
    this.rows().forEach((row, rowIndex) => {
      if (set.has(this.keyOf(row))) list.push({ row, rowIndex });
    });
    return list;
  }

  private clearActiveRows(): void {
    this.activeRowAction.emit({ action: 'clear', activeRowList: [] });
    this.commitActiveRows([], 'inactive');
  }

  /**
   * 表格键盘操作，语义照抄上游 `useRowHighlight`：
   * 上下键移动当前行（单选时直接高亮）、空格切换、Shift + 空格区域选择、
   * Esc / `c` 清空、`Ctrl + A` / `a` 在多选下全选。
   */
  protected handleTableKeydown(event: KeyboardEvent): void {
    if (!this.activeRowType()) return;

    const rows = this.rows();
    if (!rows.length) return;

    const current = this.currentOperationRowIndex();
    const key = event.key;

    if (key === 'Shift') {
      this.isShiftPressed = true;
      this.areaSelectionStartIndex = current;
      return;
    }

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const step = key === 'ArrowDown' ? 1 : -1;
      const next = Math.min(Math.max(current + step, 0), rows.length - 1);
      this.currentOperationRowIndex.set(next);
      this.hoveredRowKey.set(this.keyboardRowHover() ? this.keyOf(rows[next]) : null);
      if (this.activeRowType() === 'single') this.activateRow(next, 'keyboard');
      return;
    }

    if (key === ' ') {
      event.preventDefault();
      if (current < 0) return;
      if (this.isShiftPressed && this.areaSelectionStartIndex >= 0) {
        this.activateRange(this.areaSelectionStartIndex, current);
        return;
      }
      this.activateRow(current, 'keyboard');
      return;
    }

    if (key === 'Escape' || key === 'c' || key === 'C') {
      this.clearActiveRows();
      return;
    }

    if ((key === 'a' || key === 'A') && (event.ctrlKey || event.metaKey) && this.activeRowType() === 'multiple') {
      event.preventDefault();
      const keys = rows.map((row) => this.keyOf(row));
      this.activeRowAction.emit({ action: 'select-all', activeRowList: this.activeRowList(keys) });
      this.commitActiveRows(keys, 'active');
    }
  }

  protected handleTableKeyup(event: KeyboardEvent): void {
    if (event.key !== 'Shift') return;
    this.isShiftPressed = false;
    this.areaSelectionStartIndex = -1;
  }

  private toggleExpand(row: TableRow): void {
    const key = this.keyOf(row);
    const current = this.expandedKeys();
    const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
    if (this.expandedRowKeys() === undefined) this.innerExpandedRowKeys.set(next);
    this.expandChange.emit({
      expandedRowKeys: next,
      expandedRowData: this.data().filter((item) => next.includes(this.keyOf(item))),
      currentRowData: row,
    });
  }

  private commitSelection(
    keys: Array<string | number>,
    type: 'check' | 'uncheck',
    currentRowKey?: string | number,
    currentRowData?: TableRow,
  ): void {
    if (this.selectedRowKeys() === undefined) this.innerSelectedRowKeys.set(keys);
    const selected = new Set(keys);
    this.selectChange.emit({
      selectedRowKeys: keys,
      selectedRowData: this.data().filter((row) => selected.has(this.keyOf(row))),
      type,
      currentRowKey,
      currentRowData,
    });
  }

  private keyOf(row: TableRow): string | number {
    return row?.[this.rowKey()];
  }

  protected sortOrderOf(colKey: string): 'asc' | 'desc' | null {
    return this.sortState().get(colKey) ?? null;
  }

  protected handleSort(col: TableColumn): void {
    if (!col.sorter) return;

    const current = this.sortOrderOf(col.colKey);
    const sortType: TableSortType = col.sortType ?? 'all';
    const next: 'asc' | 'desc' | null =
      sortType === 'asc'
        ? 'asc'
        : sortType === 'desc'
          ? 'desc'
          : current === null
            ? 'asc'
            : current === 'asc'
              ? 'desc'
              : null;

    const controlled = this.sort();
    // 单列排序时点新列会替换掉原来的排序，多列排序才追加。
    const base = this.multipleSort()
      ? this.normalizeSort(controlled === undefined ? this.innerSort() : controlled).filter(
          (info) => info.sortBy !== col.colKey,
        )
      : [];
    if (next) base.push({ sortBy: col.colKey, descending: next === 'desc' });

    const value: TableSort | undefined = base.length === 0 ? undefined : base.length === 1 ? base[0] : base;
    if (controlled === undefined) this.innerSort.set(base);
    this.sortChange.emit(value);
  }

  /** 该列是否配置了筛选。 */
  protected hasFilter(col: TableColumn): boolean {
    const filter = col.filter;
    return !!filter && Object.keys(filter).length > 0;
  }

  /** 筛选控件类型，缺省为多选（与 TDesign 文档示例一致） */
  protected filterTypeOf(col: TableColumn): TableFilterType {
    return col.filter?.type ?? 'multiple';
  }

  /** 有筛选值时筛选图标进入激活态。 */
  protected hasFilterValue(col: TableColumn): boolean {
    const value = this.filterState()[col.colKey];
    if (Array.isArray(value)) return value.length > 0;
    if (value !== null && typeof value === 'object') return Object.keys(value).length > 0;
    return !['null', '', 'undefined'].includes(String(value));
  }

  protected draftValueOf(col: TableColumn): any {
    return this.draftFilterValue()[col.colKey];
  }

  protected filterVisible(col: TableColumn): boolean {
    return this.openedFilterKey() === col.colKey;
  }

  protected handleFilterVisibleChange(col: TableColumn, visible: boolean): void {
    if (visible) {
      this.openedFilterKey.set(col.colKey);
      // 打开面板时同步一次草稿，保证面板展示的是当前生效的值。
      this.draftFilterValue.set({ ...this.filterState() });
      return;
    }
    if (this.openedFilterKey() === col.colKey) this.openedFilterKey.set(null);
  }

  /** 选项类控件改值：草稿必更新，未开启「确定」按钮时立即提交。 */
  protected handleFilterOptionChange(col: TableColumn, value: unknown): void {
    const filter = col.filter;
    if (!filter) return;

    const next = { ...this.draftFilterValue(), [col.colKey]: value };
    this.draftFilterValue.set(next);
    if (!filter.showConfirmAndReset) this.commitFilter(col, next, 'filter-change');
  }

  /** 输入类控件改值：与上游一致，未开启「确定」按钮时随输入立即提交。 */
  protected handleFilterTextChange(col: TableColumn, value: unknown): void {
    const filter = col.filter;
    if (!filter) return;

    const next = { ...this.draftFilterValue(), [col.colKey]: value };
    this.draftFilterValue.set(next);
    if (!filter.showConfirmAndReset) this.commitFilter(col, next, 'filter-change');
  }

  protected handleFilterConfirm(col: TableColumn): void {
    this.commitFilter(col, this.draftFilterValue(), 'confirm');
    this.openedFilterKey.set(null);
    this.draftFilterValue.set({ ...this.filterState() });
  }

  protected handleFilterReset(col: TableColumn): void {
    const filter = col.filter;
    if (!filter) return;

    const resetValue = filter.resetValue !== undefined ? filter.resetValue : this.emptyFilterValueOf(col);
    const next = { ...this.draftFilterValue(), [col.colKey]: resetValue };
    this.draftFilterValue.set(next);
    this.commitFilter(col, next, 'reset');
    this.openedFilterKey.set(null);
    this.draftFilterValue.set({ ...this.filterState() });
  }

  protected cellTemplate(col: TableColumn): TemplateRef<unknown> | null {
    return this.cellTemplates().get(col.colKey) ?? null;
  }

  /** 展开行模板上下文。 */
  protected expandedRowContext(row: TableRow, rowIndex: number): Record<string, unknown> {
    return { $implicit: row, row, rowIndex };
  }

  /** 展开行内容：函数按行求值，其余交给模板 / 文本分支渲染。 */
  protected expandedRowOf(row: TableRow, rowIndex: number): Content {
    const value = this.expandedRow();
    return typeof value === 'function' ? value({ row, rowIndex }) : value;
  }

  protected cellContext(
    row: TableRow,
    col: TableColumn,
    rowIndex: number,
    colIndex: number,
  ): TableCellContext & { $implicit: TableRow } {
    const value = row?.[col.colKey];
    // $implicit 与上游 slot 参数保持一致（整行），单元格值用 value 单独暴露
    return { $implicit: row, row, value, rowIndex, col, colIndex };
  }

  /** 单元格合并状态，模板里用来设置 rowspan / colspan 并跳过被合并掉的格子。 */
  protected cellSpanOf(row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): TableCellSpan {
    return this.cellSpans().get(cellKeyOf(row, col, rowIndex, colIndex, this.rowKey())) ?? EMPTY_CELL_SPAN;
  }

  /** 单元格文本：优先用列自定义的 `cell`，否则按键取值。 */
  protected cellText(row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): string {
    const value = row?.[col.colKey];
    if (col.cell) {
      return col.cell({ row, rowIndex, col, colIndex, value });
    }
    return value === undefined || value === null ? '' : String(value);
  }

  /** 单元格是否为空：既没有单元格模板也没有文本。 */
  protected isCellEmpty(row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): boolean {
    if (this.cellTemplate(col)) return false;
    return !this.cellText(row, col, rowIndex, colIndex);
  }

  /** 空单元格占位内容。 */
  protected cellEmptyOf(row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): Content {
    const source = this.cellEmptyContent();
    if (source === undefined) return '';
    if (typeof source === 'function') return source(this.cellContext(row, col, rowIndex, colIndex)) ?? '';
    return source;
  }

  /** 是否有表尾：有汇总内容或有表尾数据。 */
  protected readonly hasFooter = computed(
    () => !isContentEmpty(this.footerSummary()) || this.footData().length > 0,
  );

  /** 表尾单元格内容：优先 `col.foot`，否则取同名字段。 */
  protected footerCell(row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): Content {
    const foot = col.foot;
    if (typeof foot === 'function') return foot(this.cellContext(row, col, rowIndex, colIndex)) ?? '';
    if (foot !== undefined) return foot;
    const value = row?.[col.colKey];
    return value === undefined || value === null ? '' : String(value);
  }

  /** 表尾的单元格合并状态。 */
  protected footerSpanOf(row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): TableCellSpan {
    return this.footerSpans().get(cellKeyOf(row, col, rowIndex, colIndex, this.rowKey())) ?? EMPTY_CELL_SPAN;
  }

  /** 表尾行的自定义类名，`rowClassName` 带 `type` 为 `foot`。 */
  protected footerRowClasses(row: TableRow, rowIndex: number): string {
    return this.customRowClasses(row, rowIndex, 'foot').join(' ');
  }

  /** 内容入参统一转成模板 / 文本，模板里直接调用。 */
  protected templateOf(value: Content | null | undefined): TemplateRef<unknown> | null {
    return asTemplate(value);
  }

  protected textOf(value: Content | null | undefined): string {
    return contentText(value);
  }

  /** 没有任何数据、也没有整行内容时才显示空态。 */
  protected readonly isEmpty = computed(
    () => !this.rows().length && !this.loading() && !this.firstFullRow() && !this.lastFullRow(),
  );

  protected cellClasses(col: TableColumn): string {
    const fixed = col.fixed;
    return [
      col.align ? `t-align-${col.align}` : '',
      col.ellipsis ? 't-table-td--ellipsis' : '',
      col.type ? 't-table__cell-check' : '',
      col.className ?? '',
      fixed ? `t-table__cell--fixed-${fixed}` : '',
      fixed === 'left' && col.colKey === this.lastLeftKey() ? 't-table__cell--fixed-left-last' : '',
      fixed === 'right' && col.colKey === this.firstRightKey() ? 't-table__cell--fixed-right-first' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  /** 表头内层容器：sortable / filterable 类挂在这里，表头本身保持表格单元格布局。 */
  protected headerTitleClasses(col: TableColumn): string {
    return [
      col.sorter ? 't-table__cell--sortable' : '',
      this.hasFilter(col) ? 't-table__cell--filterable' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected headerCellClasses(col: TableColumn): string {
    return [
      this.cellClasses(col),
      this.sortOrderOf(col.colKey) ? 't-table__sort-column' : '',
      this.isColumnResizable(col) ? 't-table__cell-resizable' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  /** 该列是否参与列宽拖拽：表级开关打开且列上没有显式关闭。 */
  protected isColumnResizable(col: TableColumn): boolean {
    return this.resizable() && col.resizable !== false && !col.children?.length;
  }

  protected columnStyle(col: TableColumn): Record<string, string> | null {
    const style: Record<string, string> = {};
    const width = this.columnWidths().get(col.colKey);
    if (width !== undefined) style['width'] = `${width}px`;
    else if (col.width !== undefined) style['width'] = this.toLength(col.width);
    if (col.type && col.width === undefined) style['width'] = '64px';
    if (col.minWidth !== undefined) style['min-width'] = this.toLength(col.minWidth);

    // 固定列用 sticky，偏移量必须写在单元格上
    const offset = this.fixedOffset().get(col.colKey);
    if (offset !== undefined && col.fixed) {
      style[col.fixed] = `${offset}px`;
    }
    return Object.keys(style).length ? style : null;
  }

  /** 吸顶 / 吸底克隆表只关心列宽，sticky 偏移交给单元格。 */
  protected colWidthStyle(col: TableColumn): Record<string, string> | null {
    const style: Record<string, string> = {};
    const width = this.columnWidths().get(col.colKey);
    if (width !== undefined) style['width'] = `${width}px`;
    else if (col.width !== undefined) style['width'] = this.toLength(col.width);
    else if (col.type) style['width'] = '64px';
    if (col.minWidth !== undefined) style['min-width'] = this.toLength(col.minWidth);
    return Object.keys(style).length ? style : null;
  }

  protected trackRow = (_index: number, row: TableRow): unknown => row?.[this.rowKey()] ?? _index;

  private scheduleColumnMeasure(): void {
    afterNextRender(
      () => {
        this.refreshColumnMetrics();
        this.refreshVirtualViewport();
        this.updateAffixVisibility();
      },
      { injector: this.injector },
    );
  }

  /** 首次渲染后建立滚动 / 尺寸监听。 */
  private setupFixedColumns(): void {
    const element = this.contentRef()?.nativeElement;
    if (!element) return;

    this.refreshColumnMetrics();
    this.refreshVirtualViewport();
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      this.refreshColumnMetrics();
      this.refreshVirtualViewport();
      this.updateScrollState(element);
    });
    this.resizeObserver.observe(element);
  }

  /** 记录虚拟滚动需要的可视区域高度，并在数据变少时把滚动位置收回范围内。 */
  private refreshVirtualViewport(): void {
    const element = this.contentRef()?.nativeElement;
    if (!element) return;

    const header = element.querySelector<HTMLElement>('thead');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    if (this.headerHeight() !== headerHeight) this.headerHeight.set(headerHeight);

    const foot = element.querySelector<HTMLElement>('tfoot');
    const footerHeight = foot ? foot.getBoundingClientRect().height : 0;
    if (this.footerHeight() !== footerHeight) this.footerHeight.set(footerHeight);

    const scrollbarHeight = Math.max(0, element.offsetHeight - element.clientHeight);
    if (this.scrollbarHeight() !== scrollbarHeight) this.scrollbarHeight.set(scrollbarHeight);

    this.viewportHeight.set(element.clientHeight);
    const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
    if (element.scrollTop > maxScrollTop) {
      element.scrollTop = maxScrollTop;
      this.scrollTop.set(maxScrollTop);
    }
  }

  /** 量一次表头宽度与横向滚动状态。 */
  private refreshColumnMetrics(): void {
    const element = this.contentRef()?.nativeElement;
    if (!element) return;

    const next: Record<string, number> = {};
    element.querySelectorAll<HTMLElement>('thead th[data-colkey]').forEach((cell) => {
      const key = cell.dataset['colkey'];
      const width = cell.getBoundingClientRect().width;
      if (key && width > 0) next[key] = Math.round(width * 100) / 100;
    });

    const previous = this.colWidths();
    const keys = Object.keys(next);
    const changed =
      keys.length !== Object.keys(previous).length || keys.some((key) => previous[key] !== next[key]);
    if (changed) this.colWidths.set(next);

    this.updateScrollState(element);
  }

  private updateScrollState(element: HTMLElement): void {
    const previous = this.scrollState();
    const next = {
      scrollLeft: element.scrollLeft,
      contentWidth: element.scrollWidth,
      viewportWidth: element.clientWidth,
    };
    if (
      previous.scrollLeft !== next.scrollLeft ||
      previous.contentWidth !== next.contentWidth ||
      previous.viewportWidth !== next.viewportWidth
    ) {
      this.scrollState.set(next);
    }
  }

  /** 吸顶 / 吸底需要的页面滚动监听，只挂一次。 */
  private setupAffixWatchers(): void {
    if (this.affixWatching || typeof window === 'undefined') return;
    this.affixWatching = true;

    const schedule = (): void => {
      if (this.affixFrame) return;
      this.affixFrame = window.requestAnimationFrame(() => {
        this.affixFrame = 0;
        this.updateAffixVisibility();
      });
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    this.detachAffixWatchers = () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (this.affixFrame) window.cancelAnimationFrame(this.affixFrame);
      this.affixWatching = false;
    };
  }

  /**
   * 判断吸顶 / 吸底元素此刻该不该显示。
    *
   * 与上游 `useAffix` 一致：表格顶部快要滚出可视区时显示吸顶表头；
   * 吸底元素只在原位元素还没进入可视区时显示，避免和原位内容重复。
   */
  private updateAffixVisibility(): void {
    if (!this.isAffixed()) return;

    const rect = this.contentRef()?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    const headerHeight = this.headerHeight();
    if (this.headerAffix().enabled) {
      const footerHeight = this.affixedFooterElm()?.nativeElement.getBoundingClientRect().height ?? 0;
      const offsetTop = this.headerAffix().offsetTop ?? 0;
      const next = Math.abs(rect.top) < rect.height - headerHeight - offsetTop - footerHeight;
      if (this.showAffixHeader() !== next) this.showAffixHeader.set(next);
    }

    const belowViewport = (element: HTMLElement | null): boolean => {
      if (!element) return false;
      const target = element.getBoundingClientRect();
      return rect.top + headerHeight < target.top && target.top > target.height;
    };

    if (this.footerAffix().enabled || this.horizontalScrollAffix().enabled) {
      const anchor = this.footerAffix().enabled
        ? this.affixedFooterElm()?.nativeElement
        : this.affixedScrollbarElm()?.nativeElement;
      const next = belowViewport(anchor ?? null);
      if (this.showAffixFooter() !== next) this.showAffixFooter.set(next);
    }

    if (this.paginationAffix().enabled) {
      const next = belowViewport(this.paginationElm()?.nativeElement ?? null);
      if (this.showAffixPagination() !== next) this.showAffixPagination.set(next);
    }
  }

  /** 把横向滚动位置同步到吸顶表头 / 吸底表尾 / 吸底滚动条，避免和表体错位。 */
  protected syncAffixedScroll(source: EventTarget | null): void {
    if (!this.isAffixed()) return;

    const origin = source instanceof HTMLElement ? source : this.contentRef()?.nativeElement;
    if (!origin) return;

    const left = origin.scrollLeft;
    const targets = [
      this.contentRef()?.nativeElement,
      this.affixedHeaderElm()?.nativeElement,
      this.affixedFooterElm()?.nativeElement,
      this.affixedScrollbarElm()?.nativeElement,
    ];
    for (const target of targets) {
      if (target && target !== origin && target.scrollLeft !== left) target.scrollLeft = left;
    }
  }

  private normalizeSort(sort: TableSort | undefined): TableSortInfo[] {
    if (!sort) return [];
    return Array.isArray(sort) ? sort : [sort];
  }

  /** 重置时的空值：单选 / 输入为空串，多选为空数组。 */
  private emptyFilterValueOf(col: TableColumn): unknown {
    switch (this.filterTypeOf(col)) {
      case 'single':
      case 'input':
        return '';
      default:
        return [];
    }
  }

  private commitFilter(col: TableColumn, value: TableFilterValue, trigger: TableFilterChangeContext['trigger']): void {
    if (this.filterValue() === undefined) this.innerFilterValue.set(value);
    this.filterChange.emit({ filterValue: value, value: value[col.colKey], col, trigger });
  }

  private compare(a: TableRow, b: TableRow, key: string, col?: TableColumn): number {
    if (col && typeof col.sorter === 'function') return col.sorter(a, b);

    const left = a?.[key];
    const right = b?.[key];

    if (left === right) return 0;
    if (left === undefined || left === null) return -1;
    if (right === undefined || right === null) return 1;
    if (typeof left === 'number' && typeof right === 'number') return left - right;

    return String(left).localeCompare(String(right), 'zh-CN');
  }

  private toLength(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }

  private numericWidth(value: string | number | undefined): number | null {
    if (value === undefined) return null;
    if (typeof value === 'number') return value;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
