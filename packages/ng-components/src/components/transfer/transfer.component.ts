import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { TButton } from '../button/button.component';
import { TCheckbox } from '../checkbox/checkbox.component';
import { TInput } from '../input/input.component';
import type { InputChangeEvent } from '../input/input.types';
import type {
  TransferChangeEvent,
  TransferCheckedChangeEvent,
  TransferDirection,
  TransferFilter,
  TransferItem,
  TransferItemContext,
  TransferListContent,
  TransferListContext,
  TransferListItem,
  TransferListTemplate,
  TransferListType,
  TransferOperationDirection,
  TransferScrollEvent,
  TransferSearchEvent,
  TransferSideOption,
  TransferTargetSort,
  TransferValue,
} from './transfer.types';

/** 搜索框缺省占位文字，与上游 `globalConfig.placeholder` 一致。 */
const DEFAULT_SEARCH_PLACEHOLDER = '请输入关键词搜索';

/** 空态缺省文字，与上游 `globalConfig.empty` 一致。 */
const DEFAULT_EMPTY = '暂无数据';

/** `boolean` 属性支持裸写，也支持数组按侧配置。 */
function toBooleanOrArray(value: unknown): TransferSideOption<boolean> {
  const toBoolean = (item: unknown): boolean =>
    item !== null && item !== undefined && item !== false && item !== 'false';

  return Array.isArray(value) ? value.map((item) => toBoolean(item)) : toBoolean(value);
}

/**
 * 穿梭框。在两个列表之间移动数据，右侧即 `targetValue` 的镜像。
 *
 * 用法与 TDesign 一致：
 * ```html
 * <t-transfer [data]="data" [(targetValue)]="targetValue" [search]="true" />
 * ```
 */
@Component({
  selector: 't-transfer',
  standalone: true,
  imports: [NgTemplateOutlet, TButton, TCheckbox, TInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[class]': 'classes()' },
  templateUrl: './transfer.component.html',
})
export class TTransfer {
  /** @zh 数据源 @en Data source @defaultValue [] */
  readonly data = input<TransferItem[]>([]);

  /** @zh 目标列表的值，受控；配合 `targetValueChange` 支持双向绑定 @en Target values, controlled; pair with `targetValueChange` for two-way binding @defaultValue undefined */
  readonly targetValue = input<TransferValue[] | undefined>(undefined);

  /** @zh 目标列表的初始值，非受控 @en Initial target values, uncontrolled @defaultValue [] */
  readonly defaultTargetValue = input<TransferValue[]>([]);

  /** @zh 移到右侧后新值的排序策略 @en Sorting strategy for new values moved to the right @defaultValue 'original' @values original push unshift */
  readonly targetSort = input<TransferTargetSort>('original');

  /** @zh 操作方向限制，`left` 只能左移、`right` 只能右移 @en Allowed move direction; `left`/`right` restrict to one way @defaultValue 'both' @values both left right */
  readonly direction = input<TransferDirection>('both');

  /** @zh 是否禁用，传数组时依次作用于左右列表 @en Whether disabled; an array maps to the left and right lists @defaultValue false */
  readonly disabled = input<TransferSideOption<boolean>, unknown>(false, { transform: toBooleanOrArray });

  /** @zh 两侧合并的勾选值，受控 @en Checked values of both lists, controlled @defaultValue undefined */
  readonly checked = input<TransferValue[] | undefined>(undefined);

  /** @zh 勾选值的初始值，非受控 @en Initial checked values, uncontrolled @defaultValue [] */
  readonly defaultChecked = input<TransferValue[]>([]);

  /** @zh 左侧勾选值，受控；优先于 `checked` @en Checked values of the left list, controlled; takes precedence over `checked` @defaultValue undefined */
  readonly sourceChecked = input<TransferValue[] | undefined>(undefined);

  /** @zh 右侧勾选值，受控；优先于 `checked` @en Checked values of the right list, controlled; takes precedence over `checked` @defaultValue undefined */
  readonly targetChecked = input<TransferValue[] | undefined>(undefined);

  /** @zh 是否开启两侧搜索框，传数组时按侧开启 @en Whether to show the search box; an array maps to the left and right lists @defaultValue false */
  readonly searchEnabled = input<TransferSideOption<boolean>, unknown>(false, {
    alias: 'search',
    transform: toBooleanOrArray,
  });

  /** @zh 自定义搜索过滤函数 @en Custom search filter @defaultValue undefined */
  readonly filter = input<TransferFilter | undefined>(undefined);

  /** @zh 搜索框占位文字，传数组时按侧设置 @en Search placeholder; an array maps to the left and right lists @defaultValue '' */
  readonly searchPlaceholder = input<string | string[] | undefined>(undefined);

  /** @zh 左右列表标题，依次为左侧、右侧 @en List titles, left then right @defaultValue [] */
  readonly title = input<TransferListContent[]>([]);

  /** @zh 左右列表底部内容，依次为左侧、右侧 @en Footer content, left then right @defaultValue [] */
  readonly footer = input<TransferListContent[]>([]);

  /** @zh 左右列表空态内容，依次为左侧、右侧 @en Empty content, left then right @defaultValue [] */
  readonly empty = input<TransferListContent[]>([]);

  /** @zh 中间操作按钮文字，传数组时依次为左移、右移按钮 @en Text of the operation buttons, left then right @defaultValue [] */
  readonly operation = input<string | string[]>([]);

  /** @zh 自定义列表项内容 @en Custom list item content @defaultValue undefined */
  readonly transferItem = input<TemplateRef<TransferItemContext> | undefined>(undefined);

  /** @zh 是否展示列表头部的全选开关，传数组时按侧设置 @en Whether to show the check-all switch; an array maps to the left and right lists @defaultValue true */
  readonly showCheckAll = input<TransferSideOption<boolean>, unknown>(true, { transform: toBooleanOrArray });

  /** @zh 列表高度，数字按 `px` 处理 @en List height; numbers are treated as `px` @defaultValue undefined */
  readonly height = input<string | number | undefined>(undefined);

  /** @zh 是否只允许从左向右单向移动 @en Whether only left-to-right moving is allowed @defaultValue false */
  readonly oneWay = input(false, { transform: booleanAttribute });

  /** @zh 移动事件，携带移动前后的状态 @en Move event with the states before and after the move */
  readonly change = output<TransferChangeEvent>();

  /** @zh 目标值变化事件，用于双向绑定 @en Target value change event, used for two-way binding */
  readonly targetValueChange = output<TransferValue[]>();

  /** @zh 勾选变化事件 @en Checked change event */
  readonly checkedChange = output<TransferCheckedChangeEvent>();

  /** @zh 左侧勾选变化事件 @en Left checked change event */
  readonly sourceCheckedChange = output<TransferValue[]>();

  /** @zh 右侧勾选变化事件 @en Right checked change event */
  readonly targetCheckedChange = output<TransferValue[]>();

  /** @zh 搜索事件 @en Search event */
  readonly search = output<TransferSearchEvent>();

  /** @zh 列表滚动事件 @en List scroll event */
  readonly scroll = output<TransferScrollEvent>();

  private readonly innerTargetValue = signal<TransferValue[] | null>(null);

  private readonly innerChecked = signal<TransferValue[] | null>(null);

  protected readonly queries = signal<Record<TransferListType, string>>({ source: '', target: '' });

  /** 当前目标值：受控优先，其次内部状态，最后非受控初值。 */
  protected readonly targetValues = computed<TransferValue[]>(() =>
    this.targetValue() ?? this.innerTargetValue() ?? this.defaultTargetValue(),
  );

  /** 当前勾选值，语义同上。 */
  protected readonly checkedValues = computed<TransferValue[]>(() =>
    this.checked() ?? this.innerChecked() ?? this.defaultChecked(),
  );

  protected readonly disabledOptions = computed(() => this.splitSides(this.disabled()));

  protected readonly searchOptions = computed(() => this.splitSides(this.searchEnabled()));

  protected readonly checkAllOptions = computed(() => this.splitSides(this.showCheckAll()));

  protected readonly classes = computed(() => {
    const classes = ['t-transfer'];
    const search = this.searchOptions();
    if (search.source || search.target) classes.push('t-transfer__search');
    if (this.hasContent(this.footer())) classes.push('t-transfer__footer');
    return classes.join(' ');
  });

  protected readonly listHeight = computed(() => {
    const height = this.height();
    if (height === undefined || height === null || height === '') return null;
    return typeof height === 'number' ? `${height}px` : height;
  });

  /** 左侧列表的渲染项，按 `data` 顺序排除已移到右侧的值。 */
  protected readonly sourceItems = computed<TransferListItem[]>(() => {
    const targetValues = this.targetValues();
    return this.buildItems(this.data()).filter(
      (item) => !targetValues.some((value) => value === item.value),
    );
  });

  /** 右侧列表的渲染项，按 `targetValue` 顺序排列。 */
  protected readonly targetItems = computed<TransferListItem[]>(() => {
    const items = this.buildItems(this.data());
    return this.targetValues()
      .map((value) => items.find((item) => item.value === value))
      .filter((item): item is TransferListItem => item !== undefined);
  });

  protected readonly filteredSourceItems = computed(() =>
    this.matchItems(this.sourceItems(), 'source'),
  );

  protected readonly filteredTargetItems = computed(() =>
    this.matchItems(this.targetItems(), 'target'),
  );

  /** 左侧勾选值，按当前列表裁剪。 */
  protected readonly sourceCheckedValues = computed(() =>
    (this.sourceChecked() ?? this.checkedValues()).filter((value) =>
      this.sourceItems().some((item) => item.value === value),
    ),
  );

  /** 右侧勾选值，按当前列表裁剪。 */
  protected readonly targetCheckedValues = computed(() =>
    (this.targetChecked() ?? this.checkedValues()).filter((value) =>
      this.targetItems().some((item) => item.value === value),
    ),
  );

  protected readonly sourceAllChecked = computed(() => {
    const checked = this.sourceCheckedValues();
    const items = this.searchOptions().source ? this.filteredSourceItems() : this.sourceItems();
    return checked.length > 0 && items.every((item) => item.disabled || checked.includes(item.value));
  });

  protected readonly targetAllChecked = computed(() => {
    const checked = this.targetCheckedValues();
    const items = this.searchOptions().target ? this.filteredTargetItems() : this.targetItems();
    return checked.length > 0 && items.every((item) => item.disabled || checked.includes(item.value));
  });

  protected readonly sourceIndeterminate = computed(
    () => !this.sourceAllChecked() && this.sourceCheckedValues().length > 0,
  );

  protected readonly targetIndeterminate = computed(
    () => !this.targetAllChecked() && this.targetCheckedValues().length > 0,
  );

  /** 左移按钮禁用：左侧列表禁用、方向限制、单向模式或右侧未勾选。 */
  protected readonly leftDisabled = computed(
    () =>
      this.disabledOptions().target ||
      this.direction() === 'right' ||
      this.oneWay() ||
      this.targetCheckedValues().length === 0,
  );

  /** 右移按钮禁用：右侧列表禁用、方向限制或左侧未勾选。 */
  protected readonly rightDisabled = computed(
    () =>
      this.disabledOptions().source ||
      this.direction() === 'left' ||
      this.sourceCheckedValues().length === 0,
  );

  protected splitSides(value: TransferSideOption<boolean>): { source: boolean; target: boolean } {
    if (Array.isArray(value)) {
      const source = value[0] ?? false;
      return { source, target: value[1] ?? source };
    }
    return { source: value, target: value };
  }

  protected hasContent(list: readonly TransferListContent[]): boolean {
    return list.some((value) => (typeof value === 'string' ? value.length > 0 : !!value));
  }

  protected asListTemplate(value: TransferListContent | undefined): TransferListTemplate | null {
    return value instanceof TemplateRef ? value : null;
  }

  protected titleText(type: TransferListType): string {
    const value = this.sideContent(this.title(), type);
    return typeof value === 'string' ? value : '';
  }

  protected titleTemplate(type: TransferListType): TransferListTemplate | null {
    return this.asListTemplate(this.sideContent(this.title(), type));
  }

  protected footerText(type: TransferListType): string {
    const value = this.sideContent(this.footer(), type);
    return typeof value === 'string' ? value : '';
  }

  protected footerTemplate(type: TransferListType): TransferListTemplate | null {
    return this.asListTemplate(this.sideContent(this.footer(), type));
  }

  protected emptyText(type: TransferListType): string {
    const value = this.sideContent(this.empty(), type);
    return typeof value === 'string' && value ? value : DEFAULT_EMPTY;
  }

  protected emptyTemplate(type: TransferListType): TransferListTemplate | null {
    return this.asListTemplate(this.sideContent(this.empty(), type));
  }

  protected searchPlaceholderAt(type: TransferListType): string {
    const raw = this.searchPlaceholder();
    const value = Array.isArray(raw) ? raw[type === 'source' ? 0 : 1] : raw;
    return value || DEFAULT_SEARCH_PLACEHOLDER;
  }

  protected ariaLabel(type: TransferListType): string {
    return this.titleText(type) || (type === 'source' ? '源列表' : '目标列表');
  }

  protected listContext(type: TransferListType): TransferListContext {
    return { $implicit: type, type };
  }

  protected itemContext(item: TransferListItem, type: TransferListType): TransferItemContext {
    return { $implicit: item.data, data: item.data, index: item.index, type };
  }

  /** 中间按钮文字：数组依次对应左移、右移，字符串对两侧同时生效。 */
  protected operationText(direction: TransferOperationDirection): string {
    const operation = this.operation();
    if (Array.isArray(operation)) {
      const value = operation[direction === 'right' ? 1 : 0];
      return typeof value === 'string' ? value : '';
    }
    return operation;
  }

  /** 有文字时按钮为矩形，否则为方形图标按钮。 */
  protected buttonShape(direction: TransferOperationDirection): 'rectangle' | 'square' {
    return this.operationText(direction) ? 'rectangle' : 'square';
  }

  protected isItemChecked(item: TransferListItem, type: TransferListType): boolean {
    const checked = type === 'source' ? this.sourceCheckedValues() : this.targetCheckedValues();
    return checked.includes(item.value);
  }

  protected isItemDisabled(item: TransferListItem, type: TransferListType): boolean {
    if (item.disabled) return true;
    if (type === 'source') return this.disabledOptions().source;
    return this.disabledOptions().target || this.oneWay();
  }

  protected toggleItem(item: TransferListItem, type: TransferListType): void {
    if (this.isItemDisabled(item, type)) return;

    const current = type === 'source' ? this.sourceCheckedValues() : this.targetCheckedValues();
    const next = current.includes(item.value)
      ? current.filter((value) => value !== item.value)
      : [...current, item.value];
    this.updateChecked(type, next);
  }

  protected toggleAll(type: TransferListType): void {
    const allChecked = type === 'source' ? this.sourceAllChecked() : this.targetAllChecked();
    if (allChecked) {
      this.updateChecked(type, []);
      return;
    }

    const items =
      type === 'source'
        ? this.searchOptions().source
          ? this.filteredSourceItems()
          : this.sourceItems()
        : this.searchOptions().target
          ? this.filteredTargetItems()
          : this.targetItems();
    this.updateChecked(
      type,
      items.filter((item) => !item.disabled).map((item) => item.value),
    );
  }

  /** 点击列表项：命中复选框时交给复选框自身的 `checkedChange`，避免二次触发。 */
  protected handleItemClick(event: MouseEvent, item: TransferListItem, type: TransferListType): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('t-checkbox')) return;
    this.toggleItem(item, type);
  }

  /** 列表项键盘操作：空格/回车切换勾选，上下方向键移动焦点。 */
  protected handleItemKeydown(
    event: KeyboardEvent,
    item: TransferListItem,
    type: TransferListType,
  ): void {
    if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
      event.preventDefault();
      this.toggleItem(item, type);
      return;
    }

    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (step === 0) return;

    event.preventDefault();
    const host = event.currentTarget as HTMLElement | null;
    const container = host?.parentElement;
    if (!host || !container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('.t-transfer__list-item'),
    ).filter((element) => element.getAttribute('tabindex') === '0');
    items[items.indexOf(host) + step]?.focus();
  }

  protected handleSearch(event: InputChangeEvent, type: TransferListType): void {
    const query = String(event.value ?? '');
    this.queries.update((current) => ({ ...current, [type]: query }));
    this.search.emit({
      query,
      type,
      trigger: 'input',
      e: event.event ?? new Event('input'),
    });
  }

  protected handleSearchEnter(event: KeyboardEvent, type: TransferListType): void {
    this.search.emit({
      query: this.queries()[type],
      type,
      trigger: 'enter',
      e: event,
    });
  }

  protected handleScroll(event: Event, type: TransferListType): void {
    const target = event.target as HTMLElement;
    this.scroll.emit({
      e: event,
      bottomDistance: target.scrollHeight - target.scrollTop - target.clientHeight,
      type,
    });
  }

  /** 移动勾选项；排序策略与上游 `targetSort` 对齐。 */
  protected transferTo(to: TransferListType): void {
    if (to === 'target' ? this.rightDisabled() : this.leftDisabled()) return;

    const oldTargetValue = [...this.targetValues()];
    const movedValue = to === 'target' ? this.sourceCheckedValues() : this.targetCheckedValues();
    if (movedValue.length === 0) return;

    let next: TransferValue[];
    if (to === 'source') {
      next = oldTargetValue.filter((value) => !movedValue.includes(value));
    } else if (this.targetSort() === 'original') {
      const remainValue = this.data()
        .filter((item) => item.disabled && oldTargetValue.includes(item.value))
        .map((item) => item.value);
      next = this.data()
        .filter((item) => oldTargetValue.includes(item.value) || movedValue.includes(item.value))
        .filter((item) => !item.disabled || remainValue.includes(item.value))
        .map((item) => item.value);
    } else if (this.targetSort() === 'unshift') {
      next = [...movedValue, ...oldTargetValue];
    } else {
      next = [...oldTargetValue, ...movedValue];
    }

    this.updateChecked(to === 'target' ? 'source' : 'target', []);
    this.commitTargetValue(next, movedValue, to);
  }

  private buildItems(data: TransferItem[]): TransferListItem[] {
    return data.map((item, index) => ({
      data: item,
      index,
      label: item.label === undefined || item.label === null ? String(item.value) : String(item.label),
      value: item.value,
      disabled: !!item.disabled,
    }));
  }

  private matchItems(items: TransferListItem[], type: TransferListType): TransferListItem[] {
    const query = this.queries()[type].trim();
    if (!query) return items;

    const filter = this.filter();
    if (filter) return items.filter((item) => filter(query, item.data));

    const lower = query.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(lower));
  }

  private sideContent(
    list: readonly TransferListContent[],
    type: TransferListType,
  ): TransferListContent | undefined {
    return list[type === 'source' ? 0 : 1];
  }

  /** 同步勾选值并抛出两侧合并后的事件。 */
  private updateChecked(type: TransferListType, values: TransferValue[]): void {
    const sourceNext = type === 'source' ? values : this.sourceCheckedValues();
    const targetNext = type === 'target' ? values : this.targetCheckedValues();
    const checked = [...sourceNext, ...targetNext];

    if (this.checked() === undefined) this.innerChecked.set(checked);

    this.checkedChange.emit({ checked, sourceChecked: sourceNext, targetChecked: targetNext, type });
    if (type === 'source') {
      this.sourceCheckedChange.emit(sourceNext);
    } else {
      this.targetCheckedChange.emit(targetNext);
    }
  }

  /** 写入目标值并抛出 `targetValueChange` 与 `change`。 */
  private commitTargetValue(
    next: TransferValue[],
    movedValue: TransferValue[],
    type: TransferListType,
  ): void {
    if (this.targetValue() === undefined) this.innerTargetValue.set(next);
    this.targetValueChange.emit(next);

    const byValue = new Map(this.data().map((item) => [item.value, item] as const));
    this.change.emit({
      value: next,
      movedKeys: movedValue,
      source: this.data().filter((item) => !next.includes(item.value)),
      target: next
        .map((value) => byValue.get(value))
        .filter((item): item is TransferItem => item !== undefined),
      data: { type, movedValue },
    });
  }
}
