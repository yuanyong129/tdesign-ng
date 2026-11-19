import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import {
  TABLE_ALIGNS,
  TABLE_LAYOUTS,
  TABLE_SIZES,
  TABLE_VERTICAL_ALIGNS,
  TableColumn,
  TableLayout,
  TableRow,
  TableSize,
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
 * <t-table [data]="data" [columns]="columns" rowKey="id" [bordered]="true" />
 * ```
 */
@Component({
  selector: 't-table',
  standalone: true,
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

  protected readonly aligns = TABLE_ALIGNS;
  protected readonly sizes = TABLE_SIZES;
  protected readonly layouts = TABLE_LAYOUTS;
  protected readonly verticalAligns = TABLE_VERTICAL_ALIGNS;

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

  protected readonly rows = computed(() => this.data());

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

  protected columnStyle(col: TableColumn): Record<string, string> | null {
    const style: Record<string, string> = {};
    if (col.width !== undefined) style['width'] = this.toLength(col.width);
    if (col.minWidth !== undefined) style['min-width'] = this.toLength(col.minWidth);
    return Object.keys(style).length ? style : null;
  }

  protected trackRow = (_index: number, row: TableRow): unknown => row?.[this.rowKey()] ?? _index;

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
