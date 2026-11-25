import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TSelect } from '../select/select.component';
import type { Content } from '../../_utils/content';
import { contentText, isTemplateContent } from '../../_utils/content';
import {
  PAGINATION_ELLIPSIS_MODES,
  PAGINATION_SIZES,
  PAGINATION_THEMES,
  PageInfo,
  PageSizeOption,
  PaginationEllipsisMode,
  PaginationPageSizeOptions,
  PaginationSelectProps,
  PaginationSize,
  PaginationTheme,
} from './pagination.types';

const SIZE_CLASS: Record<PaginationSize, string> = {
  small: 't-size-s',
  medium: '',
};

/**
 * 分页。
 *
 * ```html
 * <t-pagination [(current)]="current" [(pageSize)]="pageSize" [total]="100" [showJumper]="true" />
 * ```
 */
@Component({
  selector: 't-pagination',
  standalone: true,
  imports: [NgTemplateOutlet, TSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pagination.component.html',
})
export class TPagination {
  /** @zh 当前页，受控用法传入（配合 (currentChange) 双向绑定） @en Current page, pass it for controlled usage @defaultValue undefined */
  readonly current = input<number | undefined>(undefined);

  /** @zh 默认当前页，非受控用法 @en Default current page, used when uncontrolled @defaultValue 1 */
  readonly defaultCurrent = input(1);

  /** @zh 数据总条数 @en Total number of items @defaultValue 0 */
  readonly total = input(0);

  /** @zh 每页条数，受控用法传入（配合 (pageSizeChange) 双向绑定） @en Page size, pass it for controlled usage @defaultValue undefined */
  readonly pageSize = input<number | undefined>(undefined);

  /** @zh 默认每页条数，非受控用法 @en Default page size, used when uncontrolled @defaultValue 10 */
  readonly defaultPageSize = input(10);

  /** @zh 每页条数选项 @en Page size options @defaultValue [10, 20, 50] */
  readonly pageSizeOptions = input<PaginationPageSizeOptions>([10, 20, 50]);

  /** @zh 是否显示每页条数选择器 @en Whether to show the page size selector @defaultValue true */
  readonly showPageSize = input(true, { transform: booleanAttribute });

  /** @zh 是否显示跳转输入框 @en Whether to show the jumper @defaultValue false */
  readonly showJumper = input(false, { transform: booleanAttribute });

  /** @zh 自定义数据统计内容，支持字符串与模板，false 隐藏 @en Custom total content, string or template, false hides it @defaultValue true */
  readonly totalContent = input<Content | boolean>(true);

  /** @zh 每页条数选择器的透传配置 @en Props passed to the page size selector @defaultValue undefined */
  readonly selectProps = input<PaginationSelectProps | undefined>(undefined);

  /** @zh 是否显示首页/末页按钮 @en Whether to show the first/last page buttons @defaultValue true */
  readonly showFirstAndLastPageBtn = input(true, { transform: booleanAttribute });

  /** @zh 是否显示上一页/下一页按钮 @en Whether to show the prev/next page buttons @defaultValue true */
  readonly showPreviousAndNextBtn = input(true, { transform: booleanAttribute });

  /** @zh 是否显示页码 @en Whether to show page numbers @defaultValue true */
  readonly showPageNumber = input(true, { transform: booleanAttribute });

  /** @zh 页码最多显示个数 @en Maximum number of page buttons @defaultValue 7 */
  readonly maxPageBtn = input(7);

  /** @zh 折叠时省略号两侧的页码个数 @en Number of page buttons next to the ellipsis when folded @defaultValue 5 */
  readonly foldedMaxPageBtn = input(5);

  /** @zh 省略号模式 @en Ellipsis mode @defaultValue 'mid' @values mid, both-ends */
  readonly pageEllipsisMode = input<PaginationEllipsisMode>('mid');

  /** @zh 分页尺寸 @en Pagination size @defaultValue 'medium' @values small, medium */
  readonly size = input<PaginationSize>('medium');

  /** @zh 分页形态 @en Pagination theme @defaultValue 'default' @values default, simple */
  readonly theme = input<PaginationTheme>('default');

  /** @zh 是否禁用 @en Whether the pagination is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 当前页变化，用于双向绑定 @en Current page change, used for two-way binding */
  readonly currentChange = output<number>();

  /** @zh 每页条数变化，用于双向绑定 @en Page size change, used for two-way binding */
  readonly pageSizeChange = output<number>();

  /** @zh 分页变化 @en Pagination change */
  readonly change = output<PageInfo>();

  protected readonly sizes = PAGINATION_SIZES;
  protected readonly themes = PAGINATION_THEMES;
  protected readonly ellipsisModes = PAGINATION_ELLIPSIS_MODES;

  protected readonly innerCurrent = signal(1);
  private readonly innerPageSize = signal(10);

  protected readonly pageCount = computed(() => {
    const total = Number(this.total()) || 0;
    const pageSize = Math.max(Number(this.innerPageSize()) || 1, 1);
    return Math.max(Math.ceil(total / pageSize), 1);
  });

  protected readonly jumpValue = computed(() => this.innerCurrent());

  /** 是否需要折叠页码。 */
  protected readonly folded = computed(() => this.pageCount() > this.maxPageBtn());

  /** 是否按「中间省略」模式展现省略号。 */
  protected readonly isMidEllipsis = computed(() => this.pageEllipsisMode() === 'mid');

  private readonly curPageLeftCount = computed(() => Math.ceil((this.foldedMaxPageBtn() - 1) / 2));

  private readonly curPageRightCount = computed(() => Math.floor((this.foldedMaxPageBtn() - 1) / 2));

  /** 左侧是否显示「更多」，与上游 useMoreAction 保持一致。 */
  protected readonly showPrevMore = computed(() => 2 + this.curPageLeftCount() < this.innerCurrent());

  /** 右侧是否显示「更多」，与上游 useMoreAction 保持一致。 */
  protected readonly showNextMore = computed(
    () => this.pageCount() - 1 - this.curPageRightCount() > this.innerCurrent(),
  );

  /**
   * 折叠时显示的页码。
   * 与上游一致：mid 模式首尾页单独渲染在省略号外侧；both-ends 模式只渲染中间窗口。
   */
  protected readonly pages = computed<number[]>(() => {
    const pageCount = this.pageCount();
    if (!this.folded()) return Array.from({ length: pageCount }, (_, index) => index + 1);

    const current = this.innerCurrent();
    let start: number;
    let end: number;

    if (this.showPrevMore() && this.showNextMore()) {
      start = current - this.curPageLeftCount();
      end = current + this.curPageRightCount();
    } else {
      const foldedStart = this.isMidEllipsis() ? 2 : 1;
      const foldedEnd = this.isMidEllipsis() ? pageCount - 1 : pageCount;
      start = this.showPrevMore()
        ? Math.min(current - 1, pageCount - this.foldedMaxPageBtn() + 1)
        : foldedStart;
      end = this.showNextMore() ? Math.max(current + 1, this.foldedMaxPageBtn()) : foldedEnd;
    }

    const pages: number[] = [];
    for (let page = start; page <= end; page += 1) pages.push(page);
    return pages;
  });

  protected readonly classes = computed(() =>
    [
      't-pagination',
      SIZE_CLASS[this.size()],
      this.disabled() ? 't-is-disabled' : '',
      this.theme() === 'simple' ? 't-pagination--simple' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly prevDisabled = computed(() => this.disabled() || this.innerCurrent() <= 1);

  protected readonly nextDisabled = computed(() => this.disabled() || this.innerCurrent() >= this.pageCount());

  protected readonly totalTemplate = computed<TemplateRef<unknown> | null>(() => {
    const content = this.totalContent();
    if (content === false || content === true || content === undefined) return null;
    return isTemplateContent(content) ? (content as TemplateRef<unknown>) : null;
  });

  protected readonly totalText = computed<string | null>(() => {
    const content = this.totalContent();
    if (content === false) return null;
    if (content === true || content === undefined) return `共 ${Number(this.total()) || 0} 条`;
    if (isTemplateContent(content)) return null;
    const text = contentText(content);
    return text || `共 ${Number(this.total()) || 0} 条`;
  });

  /** 页数选择器的尺寸，selectProps.size 优先。 */
  protected readonly selectSize = computed(() => this.selectProps()?.size ?? (this.size() === 'small' ? 'small' : 'medium'));

  protected readonly selectPlaceholder = computed(() => this.selectProps()?.placeholder);

  protected readonly selectClearable = computed(() => this.selectProps()?.clearable ?? false);

  protected readonly selectOptions = computed<PageSizeOption[]>(() =>
    this.pageSizeOptions().map((option) => {
      if (typeof option === 'number') return { label: `${option} 条/页`, value: option };
      return { label: option.label, value: option.value };
    }),
  );

  protected readonly selectValue = computed(() => this.innerPageSize());

  /** 首页与末页按钮复用上一页/下一页的类名，与上游一致。 */
  protected readonly firstBtnClasses = computed(
    () => `t-pagination__btn t-pagination__btn-prev ${this.prevDisabled() ? 't-is-disabled' : ''}`.trim(),
  );

  protected readonly lastBtnClasses = computed(
    () => `t-pagination__btn t-pagination__btn-next ${this.nextDisabled() ? 't-is-disabled' : ''}`.trim(),
  );

  constructor() {
    // 受控：外部传入 current / pageSize 时以外部为准
    effect(() => {
      const current = this.current();
      if (current === undefined) return;
      untracked(() => this.syncCurrent(current));
    });

    effect(() => {
      const pageSize = this.pageSize();
      if (pageSize === undefined) return;
      untracked(() => this.syncPageSize(pageSize));
    });

    // 非受控：跟随 defaultCurrent / defaultPageSize
    effect(() => {
      const current = this.defaultCurrent();
      if (this.current() !== undefined) return;
      untracked(() => this.syncCurrent(current));
    });

    effect(() => {
      const pageSize = this.defaultPageSize();
      if (this.pageSize() !== undefined) return;
      untracked(() => this.syncPageSize(pageSize));
    });
  }

  private syncCurrent(current: number | undefined): void {
    const next = this.clamp(current ?? 1);
    if (next !== this.innerCurrent()) this.innerCurrent.set(next);
  }

  private syncPageSize(pageSize: number | undefined): void {
    const next = Math.max(Number(pageSize) || 1, 1);
    if (next === this.innerPageSize()) return;
    this.innerPageSize.set(next);
    // 每页条数变化后当前页可能越界，收敛到最后一页
    const clamped = Math.min(this.innerCurrent(), this.pageCount());
    if (clamped !== this.innerCurrent()) this.innerCurrent.set(clamped);
  }

  protected goTo(page: number): void {
    if (this.disabled()) return;
    const next = this.clamp(page);
    if (next === this.innerCurrent()) return;

    const previous = this.innerCurrent();
    this.innerCurrent.set(next);
    this.currentChange.emit(next);
    this.change.emit({ current: next, previous, pageSize: this.innerPageSize() });
  }

  protected goFirst(): void {
    this.goTo(1);
  }

  protected goLast(): void {
    this.goTo(this.pageCount());
  }

  protected goPrev(): void {
    this.goTo(this.innerCurrent() - 1);
  }

  protected goNext(): void {
    this.goTo(this.innerCurrent() + 1);
  }

  /** 省略号点击：向前/向后跳 foldedMaxPageBtn 页。 */
  protected goPrevMore(): void {
    this.goTo(Math.max(2, this.innerCurrent() - this.foldedMaxPageBtn()));
  }

  protected goNextMore(): void {
    this.goTo(Math.min(this.pageCount() - 1, this.innerCurrent() + this.foldedMaxPageBtn()));
  }

  protected handlePageSizeChange(value: number | unknown): void {
    if (this.disabled()) return;
    const next = Math.max(Number(value) || 1, 1);
    if (next === this.innerPageSize()) return;

    this.innerPageSize.set(next);
    const clamped = Math.min(this.innerCurrent(), this.pageCount());
    this.innerCurrent.set(clamped);
    this.pageSizeChange.emit(next);
    this.currentChange.emit(clamped);
    this.change.emit({ current: clamped, previous: clamped, pageSize: next });
  }

  protected handleJump(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (!Number.isFinite(value)) {
      input.value = String(this.innerCurrent());
      return;
    }
    this.goTo(value);
    input.value = String(this.innerCurrent());
  }

  /** 键盘激活：Enter / Space 与点击行为一致。 */
  protected handleKeyAction(event: KeyboardEvent, action: string, page?: number): void {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    event.preventDefault();
    switch (action) {
      case 'first':
        this.goFirst();
        break;
      case 'last':
        this.goLast();
        break;
      case 'prev':
        this.goPrev();
        break;
      case 'next':
        this.goNext();
        break;
      case 'prev-more':
        this.goPrevMore();
        break;
      case 'next-more':
        this.goNextMore();
        break;
      default:
        if (typeof page === 'number') this.goTo(page);
    }
  }

  private clamp(page: number): number {
    const value = Math.round(Number(page) || 1);
    return Math.min(Math.max(value, 1), this.pageCount());
  }
}
