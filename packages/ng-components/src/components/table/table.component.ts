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
import { TCheckboxGroup } from '../checkbox';
import { TInput } from '../input';
import { TPopup } from '../popup';
import { TRadioGroup } from '../radio';
import { TTableCell } from './table-cell.directive';
import {
  TABLE_ALIGNS,
  TABLE_LAYOUTS,
  TABLE_SIZES,
  TABLE_SORT_TYPES,
  TABLE_VERTICAL_ALIGNS,
  TableColumn,
  TableFilterChangeEvent,
  TableFilterChangeContext,
  TableFilterType,
  TableFilterValue,
  TableLayout,
  TableRow,
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
  imports: [NgTemplateOutlet, TButton, TCheckboxGroup, TInput, TPopup, TRadioGroup],
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

  protected readonly sizes = TABLE_SIZES;
  protected readonly aligns = TABLE_ALIGNS;
  protected readonly layouts = TABLE_LAYOUTS;
  protected readonly verticalAligns = TABLE_VERTICAL_ALIGNS;
  protected readonly sortTypes = TABLE_SORT_TYPES;

  private readonly innerSort = signal<TableSortInfo[]>([]);

  private readonly innerFilterValue = signal<TableFilterValue>({});

  /** 筛选面板里的草稿值，开启 showConfirmAndReset 时点「确定」才提交。 */
  private readonly draftFilterValue = signal<TableFilterValue>({});

  /** 当前展开筛选面板的列。 */
  private readonly openedFilterKey = signal<string | null>(null);

  private readonly injector = inject(Injector);

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
    const widthOf = (col: TableColumn) => widths[col.colKey] ?? this.numericWidth(col.width) ?? 0;
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
    const columns = this.columns();
    let key: string | null = null;
    columns.forEach((col, index) => {
      if (col.fixed === 'left' && columns[index + 1]?.fixed !== 'left') key = col.colKey;
    });
    return key;
  });

  /** 右侧第一个固定列，用来挂滚动分界线。 */
  protected readonly firstRightKey = computed(() => {
    const columns = this.columns();
    const index = columns.findIndex((col) => col.fixed === 'right');
    return index < 0 ? null : columns[index].colKey;
  });

  /** 已向右滚动且存在左侧固定列时显示左阴影。 */
  protected readonly showLeftShadow = computed(
    () => this.scrollState().scrollLeft > 0 && this.columns().some((col) => col.fixed === 'left'),
  );

  /** 右侧还有未滚动到的内容且存在右侧固定列时显示右阴影。 */
  protected readonly showRightShadow = computed(() => {
    const scroll = this.scrollState();
    if (!this.columns().some((col) => col.fixed === 'right')) return false;
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

  protected readonly classes = computed(() =>
    [
      't-table',
      this.bordered() ? 't-table--bordered' : '',
      this.stripe() ? 't-table--striped' : '',
      this.hover() ? 't-table--hoverable' : '',
      `t-table--align-${this.verticalAlign()}`,
      SIZE_CLASS[this.size()],
      this.loading() ? 't-table--loading' : '',
      this.hasFixedColumn() ? 't-table--column-fixed' : '',
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
    const columns = this.columns();
    if (!columns.length) return null;

    const widths = columns.map((col) => this.numericWidth(col.width));
    if (widths.some((width) => width === null)) return null;

    const total = (widths as number[]).reduce((sum, width) => sum + width, 0);
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

  /** 展示用数据：受控排序时原样返回，否则按本地排序重排。 */
  protected readonly rows = computed(() => {
    const data = this.data();
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
  }

  protected handleScroll(event: Event): void {
    this.updateScrollState(event.target as HTMLElement);
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

  protected cellContext(row: TableRow, col: TableColumn, rowIndex: number, colIndex: number): Record<string, unknown> {
    const value = row?.[col.colKey];
    // $implicit 与上游 slot 参数保持一致（整行），单元格值用 value 单独暴露
    return { $implicit: row, row, value, rowIndex, col, colIndex };
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
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected columnStyle(col: TableColumn): Record<string, string> | null {
    const style: Record<string, string> = {};
    if (col.width !== undefined) style['width'] = this.toLength(col.width);
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
    afterNextRender(() => this.refreshColumnMetrics(), { injector: this.injector });
  }

  /** 首次渲染后建立滚动 / 尺寸监听。 */
  private setupFixedColumns(): void {
    const element = this.contentRef()?.nativeElement;
    if (!element) return;

    this.refreshColumnMetrics();
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      this.refreshColumnMetrics();
      this.updateScrollState(element);
    });
    this.resizeObserver.observe(element);
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
