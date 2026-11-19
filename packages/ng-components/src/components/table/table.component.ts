import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { TTableCell } from './table-cell.directive';
import {
  TABLE_ALIGNS,
  TABLE_LAYOUTS,
  TABLE_SIZES,
  TABLE_SORT_TYPES,
  TABLE_VERTICAL_ALIGNS,
  TableColumn,
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
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './table.component.html',
})
export class TTable {
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

  protected readonly sizes = TABLE_SIZES;
  protected readonly aligns = TABLE_ALIGNS;
  protected readonly layouts = TABLE_LAYOUTS;
  protected readonly verticalAligns = TABLE_VERTICAL_ALIGNS;
  protected readonly sortTypes = TABLE_SORT_TYPES;

  private readonly innerSort = signal<TableSortInfo[]>([]);

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
    return [
      col.align ? `t-align-${col.align}` : '',
      col.ellipsis ? 't-table-td--ellipsis' : '',
      col.className ?? '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected headerCellClasses(col: TableColumn): string {
    return [
      this.cellClasses(col),
      col.sorter ? 't-table__cell--sortable' : '',
      this.sortOrderOf(col.colKey) ? 't-table__sort-column' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected columnStyle(col: TableColumn): Record<string, string> | null {
    const style: Record<string, string> = {};
    if (col.width !== undefined) style['width'] = this.toLength(col.width);
    if (col.minWidth !== undefined) style['min-width'] = this.toLength(col.minWidth);
    return Object.keys(style).length ? style : null;
  }

  protected trackRow = (_index: number, row: TableRow): unknown => row?.[this.rowKey()] ?? _index;

  private normalizeSort(sort: TableSort | undefined): TableSortInfo[] {
    if (!sort) return [];
    return Array.isArray(sort) ? sort : [sort];
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
