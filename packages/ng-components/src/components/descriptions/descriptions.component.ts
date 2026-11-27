import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  input,
  numberAttribute,
} from '@angular/core';
import { TDescriptionItem } from './description-item.component';
import type {
  DescriptionItem,
  DescriptionsContent,
  DescriptionsItemLayout,
  DescriptionsLayout,
  DescriptionsSize,
  DescriptionsStyles,
  DescriptionsTableLayout,
} from './descriptions.types';

/** 尺寸到 `t-size-*` 修饰类的映射，与上游 `SIZE` 常量一致。 */
const SIZE_CLASS: Record<DescriptionsSize, string> = {
  small: 't-size-s',
  medium: 't-size-m',
  large: 't-size-l',
};

/** 单元格种类，决定用 `__label` 还是 `__content` 类。 */
type CellKind = 'label' | 'content';

/** 一个待渲染的单元格，对应一个 `<td>`。 */
interface DescriptionCell {
  kind: CellKind;
  value: DescriptionsContent;
  colspan: number;
  colon: boolean;
}

/** 一行待渲染的单元格，对应一个 `<tr>`。 */
type DescriptionTableRow = DescriptionCell[];

/**
 * 描述列表。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 * 行列算法与上游一致：`layout` 为 horizontal 时按 `column` 把描述项装箱成多列，
 * 行尾剩余列数由最后一项吃掉；再按 `layout` × `itemLayout` 展开成 1~2 行单元格。
 */
@Component({
  selector: 't-descriptions',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value !== undefined && value !== null) {
        {{ value }}
      }
    </ng-template>

    @if (title()) {
      <div class="t-descriptions__header">
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: title() }" />
      </div>
    }

    <table [class]="bodyClasses()">
      <tbody>
        @for (row of tableRows(); track $index) {
          <tr>
            @for (cell of row; track $index) {
              <td
                [class]="cell.kind === 'label' ? 't-descriptions__label' : 't-descriptions__content'"
                [attr.colspan]="cell.colspan"
                [style]="cell.kind === 'label' ? labelStyle() : contentStyle()"
              >
                <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: cell.value }" />{{ cell.colon ? ':' : '' }}
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TDescriptions {
  /** 是否显示边框与标签底色。 @zh 是否带边框 @en bordered @defaultValue false */
  readonly bordered = input(false, { transform: booleanAttribute });

  /** 是否在标签后显示冒号。 @zh 是否显示冒号 @en colon @defaultValue true */
  readonly colon = input(true, { transform: booleanAttribute });

  /** 一行展示的列数，每个描述项占一列。 @zh 每行列数 @en column @defaultValue 2 */
  readonly column = input(2, { transform: numberAttribute });

  /** 内容单元格的内联样式。 @zh 内容样式 @en content style */
  readonly contentStyle = input<DescriptionsStyles>(undefined);

  /** 标签与内容的排列方向。 @zh 描述项的排列方向 @en item layout @defaultValue horizontal @values horizontal,vertical */
  readonly itemLayout = input<DescriptionsItemLayout>('horizontal');

  /** 描述项数组，与子元素 `t-descriptions-item` 二选一，数组优先。 @zh 描述项 @en items */
  readonly items = input<ReadonlyArray<DescriptionItem> | undefined>(undefined);

  /** 标签单元格的内联样式。 @zh 标签样式 @en label style */
  readonly labelStyle = input<DescriptionsStyles>(undefined);

  /** 整体布局方向。 @zh 布局方向 @en layout @defaultValue horizontal @values horizontal,vertical */
  readonly layout = input<DescriptionsLayout>('horizontal');

  /** 描述列表尺寸。 @zh 尺寸 @en size @defaultValue medium @values small,medium,large */
  readonly size = input<DescriptionsSize>('medium');

  /** 表格布局方式。 @zh 表格布局 @en table layout @defaultValue fixed @values fixed,auto */
  readonly tableLayout = input<DescriptionsTableLayout>('fixed');

  /** 标题，字符串按文本渲染，模板交给 `*ngTemplateOutlet`。 @zh 标题 @en title */
  readonly title = input<DescriptionsContent>(undefined);

  /** 子元素形式的描述项，`items` 为空时使用。 */
  private readonly itemChildren = contentChildren(TDescriptionItem, { descendants: true });

  protected readonly classes = computed(() => 't-descriptions');

  protected readonly bodyClasses = computed(() =>
    this.mergeClasses(
      't-descriptions__body',
      SIZE_CLASS[this.size()],
      this.tableLayout() === 'fixed' ? 't-descriptions__body--fixed' : '',
      this.bordered() ? 't-descriptions__body--border' : '',
    ),
  );

  /** 归一化后的描述项：`items` 数组优先，否则取子元素 `t-descriptions-item`。 */
  private readonly sourceItems = computed<DescriptionItem[]>(() => {
    const items = this.items();
    if (items?.length) {
      return items.map((item) => ({ ...item }));
    }
    return this.itemChildren().map((child) => ({
      label: child.label(),
        content: child.content() ?? child.projectedContent(),
      span: child.span(),
    }));
  });

  /** 按 `layout` / `column` 装箱后的描述项行组，行内每一项还会带上修正后的 `span`。 */
  private readonly itemRows = computed<DescriptionItem[][]>(() => this.groupRows(this.sourceItems()));

  /** 最终要渲染的 `<tr>` 列表，四种布局模式在这里一次算完。 */
  protected readonly tableRows = computed<DescriptionTableRow[]>(() => {
    const horizontalLayout = this.layout() === 'horizontal';
    const horizontalItem = this.itemLayout() === 'horizontal';
    const colon = this.colon();
    const rows: DescriptionTableRow[] = [];
    for (const row of this.itemRows()) {
      const labels: DescriptionCell[] = row.map((item) => ({
        kind: 'label',
        value: item.label,
        colspan: this.labelColspan(item),
        colon,
      }));
      const contents: DescriptionCell[] = row.map((item) => ({
        kind: 'content',
        value: item.content,
        colspan: this.contentColspan(item),
        colon: false,
      }));
      if (horizontalLayout && horizontalItem) {
        // 横向布局 + 横向排列：一行内交替渲染标签、内容。
        rows.push(row.flatMap((_item, index) => [labels[index], contents[index]]));
      } else if (horizontalLayout) {
        // 横向布局 + 纵向排列：先渲染整行标签，再渲染整行内容。
        rows.push(labels, contents);
      } else if (horizontalItem) {
        // 纵向布局 + 横向排列：每个描述项一行，标签与内容同排。
        row.forEach((_item, index) => rows.push([labels[index], contents[index]]));
      } else {
        // 纵向布局 + 纵向排列：每个描述项拆成标签、内容两行。
        row.forEach((_item, index) => rows.push([labels[index]], [contents[index]]));
      }
    }
    return rows;
  });

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: DescriptionsContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 标签单元格的 colspan。 */
  private labelColspan(item: DescriptionItem): number {
    if (this.layout() !== 'horizontal') {
      return 1;
    }
    return this.itemLayout() === 'horizontal' ? 1 : this.spanOf(item);
  }

  /** 内容单元格的 colspan：横向排列时内容要跨过标签占掉的列。 */
  private contentColspan(item: DescriptionItem): number {
    if (this.layout() !== 'horizontal') {
      return 1;
    }
    const span = this.spanOf(item);
    return this.itemLayout() === 'horizontal' && span > 1 ? span * 2 - 1 : span;
  }

  /**
   * 把描述项装箱成行组。
   *
   * 与上游一致：`span` 先收敛到 `column` 以内，放不下就换行；最后一项吃掉行尾剩余列数，
   * 这样行尾不会留下空白单元格。`layout` 为 vertical 时每项独占一行，不做装箱。
   */
  private groupRows(items: DescriptionItem[]): DescriptionItem[][] {
    if (!items.length) {
      return [];
    }
    if (this.layout() === 'vertical') {
      return [items];
    }
    const column = this.columns();
    const rows: DescriptionItem[][] = [];
    let current: DescriptionItem[] = [];
    let remaining = column;
    items.forEach((item, index) => {
      const span = Math.min(this.spanOf(item), column);
      item.span = span;
      if (remaining >= span) {
        current.push(item);
        remaining -= span;
      } else {
        rows.push(current);
        current = [item];
        remaining = column - span;
      }
      if (index === items.length - 1) {
        if (remaining > 0) {
          item.span = span + remaining;
        }
        rows.push(current);
      }
    });
    return rows;
  }

  private columns(): number {
    const column = Math.trunc(this.column());
    return Number.isFinite(column) && column > 0 ? column : 2;
  }

  private spanOf(item: DescriptionItem): number {
    const span = Math.trunc(item.span ?? 1);
    return Number.isFinite(span) && span > 1 ? span : 1;
  }

  private mergeClasses(...classes: Array<string | undefined | false>): string {
    return classes.filter((item): item is string => !!item).join(' ');
  }
}
