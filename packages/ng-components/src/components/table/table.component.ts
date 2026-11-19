import { NgTemplateOutlet } from '@angular/common';
import {
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
import { TButton } from '../button';
import { TCheckbox, TCheckboxGroup } from '../checkbox';
import { TInput } from '../input';
import { TPagination, type PageInfo } from '../pagination';
import { TPopup } from '../popup';
import { TRadio, TRadioGroup } from '../radio';
import { TTableCell } from './table-cell.directive';
import { TTableExpandedRow } from './table-expanded-row.directive';
import {
  TABLE_ALIGNS,
  TABLE_LAYOUTS,
  TABLE_SIZES,
  TABLE_SORT_TYPES,
  TABLE_VERTICAL_ALIGNS,
  TableColumn,
  TableExpandChangeEvent,
  TableFilterChangeEvent,
  TableFilterChangeContext,
  TableFilterType,
  TableFilterValue,
  TableHeaderCell,
  TableLayout,
  TablePageChangeEvent,
  TablePagination,
  TableRow,
  TableRowSelectionType,
  TableRowspan,
  TableRowspanParams,
  TableScroll,
  TableColumnResizeEvent,
  TableSelectChangeEvent,
  TableSize,
  TableSort,
  TableSortInfo,
  TableSortType,
  TableVerticalAlign,
} from './table.types';

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

/** 列包含的叶子列数，分组列即为其 colspan。 */
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
 * 按层级生成表头矩阵，第 0 行为最上层。
 * 与 TDesign 的 useMultiHeader 一致：分组列 rowspan 1、colspan 为叶子数；
 * 叶子列 rowspan 为剩余行数、colspan 1。
 */
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
  imports: [NgTemplateOutlet, TButton, TCheckbox, TCheckboxGroup, TInput, TPagination, TPopup, TRadio, TRadioGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './table.component.html',
})
export class TTable implements OnDestroy {
  /** @zh 表格数据 @en Table data @defaultValue [] */
  readonly data = input<TableRow[]>([]);

  /** @zh 列配置 @en Column configuration @defaultValue [] */
  readonly columns = input<TableColumn[]>([]);

  /** @zh 行唯一标识字段名 @en Field name of the row key @defaultValue 'id' */
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

  /** @zh 是否显示加载中 @en Whether the table is loading @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @zh 加载提示文字 @en Loading text @defaultValue '加载中' */
  readonly loadingText = input('加载中');

  /** @zh 空数据提示文字 @en Empty content @defaultValue '暂无数据' */
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

  /** @zh 展开行变化 @en Emitted when the expanded rows change */
  readonly expandChange = output<TableExpandChangeEvent>();

  /**
   * @zh 分页配置，传入后表格底部显示分页；数据超过一页且未开启 disableDataPage 时自动本地分页
   * @en Pagination config; the table renders a pager and paginates locally unless disableDataPage is on
   * @defaultValue undefined
   */
  readonly pagination = input<TablePagination | undefined>(undefined);

  /**
   * @zh 关闭本地分页，只显示分页器并把翻页事件交给使用方（服务端分页）
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

  /** 非受控分页时内部记录的页码 / 每页条数。 */
  private readonly innerPagination = signal<{ current: number; pageSize: number } | null>(null);

  private readonly injector = inject(Injector);

  /** 展开行模板。 */
  protected readonly expandedRowTemplate = contentChild(TTableExpandedRow);

  /** 行选择列：`type` 为 single / multiple 的列。 */
  protected readonly selectColumn = computed(
    () => this.columns().find((col) => col.type === 'single' || col.type === 'multiple') ?? null,
  );

  /** 行选择类型。 */
  protected readonly selectionType = computed<TableRowSelectionType | null>(() => this.selectColumn()?.type ?? null);

  /** 是否渲染展开图标列。 */
  protected readonly showExpandColumn = computed(() => this.expandIcon() && !!this.expandedRowTemplate());

  /** 根列：展开图标列固定在首列。 */
  protected readonly rootColumns = computed<TableColumn[]>(() => {
    const columns = this.columns();
    if (!this.showExpandColumn()) return columns;
    return [{ colKey: EXPAND_COLUMN_KEY, width: 46, className: 't-table__expandable-icon-cell' }, ...columns];
  });

  /** 实际渲染的列：多级表头只渲染叶子列。 */
  protected readonly displayColumns = computed<TableColumn[]>(() => flattenColumns(this.rootColumns()));

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
   * 开启拖拽后总宽按实测宽度固定，否则表格是 100% 宽、拖动没有意义。
   */
  protected readonly columnWidths = computed<Map<string, number>>(() => {
    const overrides = this.columnWidthOverrides();
    const measured = this.colWidths();
    const map = new Map<string, number>();
    for (const col of this.displayColumns()) {
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

  /** 实测列宽（colKey → px）。固定列偏移优先用它，取不到时回退到列配置的数字宽度。 */
  private readonly colWidths = signal<Record<string, number>>({});

  /** 横向滚动状态，用于决定固定列两侧的阴影分界线是否显示。 */
  private readonly scrollState = signal({ scrollLeft: 0, contentWidth: 0, viewportWidth: 0 });

  private resizeObserver?: ResizeObserver;

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
    const columns = this.displayColumns();
    let key: string | null = null;
    columns.forEach((col, index) => {
      if (col.fixed === 'left' && columns[index + 1]?.fixed !== 'left') key = col.colKey;
    });
    return key;
  });

  /** 右侧第一个固定列，用来挂滚动分界线。 */
  protected readonly firstRightKey = computed(() => {
    const columns = this.displayColumns();
    const index = columns.findIndex((col) => col.fixed === 'right');
    return index < 0 ? null : columns[index].colKey;
  });

  /** 已向右滚动且存在左侧固定列时显示左阴影。 */
  protected readonly showLeftShadow = computed(
    () => this.scrollState().scrollLeft > 0 && this.displayColumns().some((col) => col.fixed === 'left'),
  );

  /** 右侧还有未滚动到的内容且存在右侧固定列时显示右阴影。 */
  protected readonly showRightShadow = computed(() => {
    const scroll = this.scrollState();
    if (!this.displayColumns().some((col) => col.fixed === 'right')) return false;
    return scroll.scrollLeft + scroll.viewportWidth < scroll.contentWidth - 1;
  });

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
   * 与上游 `useRowspanAndColspan` 一致：先算出锚点单元格的 span，
   * 再把它覆盖到的其余单元格标记为 skipped（渲染时直接跳过）。
   */
  private readonly cellSpans = computed<Map<string, TableCellSpan>>(() => {
    const map = new Map<string, TableCellSpan>();
    const handler = this.rowspanAndColspan();
    if (!handler) return map;

    const rows = this.rows();
    const columns = this.displayColumns();
    const rowKey = this.rowKey();

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
  });

  protected readonly classes = computed(() =>
    [
      't-table',
      this.bordered() ? 't-table--bordered' : '',
      this.stripe() ? 't-table--striped' : '',
      this.hover() ? 't-table--hoverable' : '',
      `t-table--align-${this.verticalAlign()}`,
      SIZE_CLASS[this.size()],
      this.loading() ? 't-table--loading' : '',
      this.selectColumn() ? 't-table--row-select' : '',
      this.showExpandColumn() ? 't-table--row-expandable' : '',
      this.hasMultiHeader() ? 't-table--multiple-header' : '',
      this.rowspanAndColspan() ? 't-table--rowspan-colspan' : '',
      this.hasFixedColumn() ? 't-table--column-fixed' : '',
      this.resizable() ? 't-table--column-resizable' : '',
      this.showLeftShadow() ? 't-table__content--scrollable-to-left' : '',
      this.showRightShadow() ? 't-table__content--scrollable-to-right' : '',
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
   * 只有「所有列都写了固定宽度」时才给表格设总宽，
   * 否则交回 100%，让浏览器按剩余空间分配（与上游一致）。
   */
  protected readonly tableWidth = computed(() => {
    const columns = this.displayColumns();
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

    // 固定列需要实测宽度：首屏渲染后量一次，列 / 数据变化后再量
    afterNextRender(() => this.setupFixedColumns());

    effect(() => {
      this.columns();
      this.rows();
      untracked(() => this.scheduleColumnMeasure());
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);
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

  /** 表头鼠标移动：靠近列右边缘 8px 内显示 col-resize，并把该列记为拖拽目标。 */
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

    const target = this.displayColumns().find((item) => item.colKey === key);
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
      const nextCol = this.displayColumns().find((item) => item.colKey === drag.nextKey);
      const nextMin = Math.max(nextCol?.resize?.minWidth ?? 80, this.numericWidth(nextCol?.minWidth) ?? 0);
      next[drag.nextKey] = Math.max(nextMin, Math.round(drag.nextWidth - consumed));
    }

    this.columnWidthOverrides.set({ ...this.columnWidthOverrides(), ...next });
    this.columnResizeChange.emit({ columnsWidth: next });
  };

  /** 同一层级相邻的可拖拽列（跳过显式关闭拖拽的列）。 */
  private siblingColumn(col: TableColumn, step: 1 | -1): TableColumn | null {
    const columns = this.displayColumns();
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
  }

  /** 表格分页器的尺寸：large 没有对应分页尺寸，回落到 medium。 */
  protected readonly paginationSize = computed<'small' | 'medium'>(() =>
    this.size() === 'small' ? 'small' : 'medium',
  );

  /** 翻页：非受控时记下页码，随后把滚动位置复位并抛出事件。 */
  protected handlePageChange(pageInfo: PageInfo): void {
    const config = this.pagination();
    if (!config) return;

    if (config.current === undefined) {
      this.innerPagination.set({ current: pageInfo.current, pageSize: pageInfo.pageSize });
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

  /** 点击行：按需展开 / 选中。 */
  protected handleRowClick(row: TableRow): void {
    if (this.expandOnRowClick() && this.showExpandColumn()) this.toggleExpand(row);
    if (this.selectOnRowClick() && this.selectColumn()) this.handleSelectRow(row, !this.isRowSelected(row));
  }

  protected rowClasses(row: TableRow): string {
    return [
      this.isRowSelected(row) ? 't-table__row--selected' : '',
      this.showExpandColumn() ? (this.isRowExpanded(row) ? 't-table__row--expanded' : 't-table__row--folded') : '',
    ]
      .filter(Boolean)
      .join(' ');
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
    // 单列排序时点新列会替换掉原来的排序，多列排序才追加
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

  /** 筛选控件类型，缺省为多选（与 TDesign 文档示例一致）。 */
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
      // 打开面板时同步一次草稿，保证面板展示的是当前生效值
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

  protected cellContext(row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): Record<string, unknown> {
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

  protected trackRow = (_index: number, row: TableRow): unknown => row?.[this.rowKey()] ?? _index;

  private scheduleColumnMeasure(): void {
    afterNextRender(
      () => {
        this.refreshColumnMetrics();
        this.refreshVirtualViewport();
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
