import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TPopup } from '../popup';
import { TTreeSelectPanelBottom, TTreeSelectPanelTop } from './tree-select-content.directives';
import { TREE_SELECT_DEFAULT_KEYS, buildTreeSelectTree } from './tree-select-tree';
import {
  TreeSelectChangeEvent,
  TreeSelectData,
  TreeSelectKeys,
  TreeSelectNode,
  TreeSelectValue,
} from './tree-select.types';

const SIZE_SUFFIX: Record<'small' | 'medium' | 'large', string> = {
  small: 's',
  medium: 'm',
  large: 'l',
};

/**
 * @zh 树选择，用树形结构的数据做单选。
 *
 * ```html
 * <t-tree-select [data]="data" [value]="value" (change)="value = $event.value" />
 * ```
 *
 * @en Tree select: single selection from tree data.
 */
@Component({
  selector: 't-tree-select',
  standalone: true,
  imports: [NgTemplateOutlet, TPopup],
  templateUrl: './tree-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TTreeSelect {
  /**
   * @zh 树形数据。
   * @en Tree data.
   * @defaultValue []
   */
  readonly data = input<TreeSelectData[]>([]);

  /**
   * @zh 选中值，受控用法。
   * @en Selected value in controlled mode.
   */
  readonly value = input<TreeSelectValue | undefined>(undefined);

  /**
   * @zh 默认选中值，非受控用法。
   * @en Default selected value in uncontrolled mode.
   */
  readonly defaultValue = input<TreeSelectValue | undefined>(undefined);

  /**
   * @zh 自定义字段名，默认 label / value / children / disabled。
   * @en Custom field names; defaults to label / value / children / disabled.
   */
  readonly keys = input<TreeSelectKeys>({});

  /**
   * @zh 值的形态：`value` 返回数据项的 value，`object` 返回整个数据项。
   * @en Value form: `value` returns the item value, `object` returns the whole item.
   * @defaultValue 'value'
   * @values value, object
   */
  readonly valueType = input<'value' | 'object'>('value');

  /**
   * @zh 是否可清空。
   * @en Whether the value can be cleared.
   * @defaultValue false
   */
  readonly clearable = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否禁用。
   * @en Whether the tree select is disabled.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 输入框尺寸。
   * @en Size of the input.
   * @defaultValue 'medium'
   * @values small, medium, large
   */
  readonly size = input<'small' | 'medium' | 'large'>('medium');

  /**
   * @zh 占位文案。
   * @en Placeholder text.
   * @defaultValue '请选择'
   */
  readonly placeholder = input('请选择');

  /**
   * @zh 无数据时的提示文案。
   * @en Text shown when there is no data.
   * @defaultValue '暂无数据'
   */
  readonly empty = input('暂无数据');

  /**
   * @zh 是否处于加载中。
   * @en Whether the panel is loading.
   * @defaultValue false
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * @zh 加载中的提示文案。
   * @en Text shown while loading.
   * @defaultValue '加载中'
   */
  readonly loadingText = input('加载中');

  /**
   * @zh 选中值变化时触发。
   * @en Emitted when the selected value changes.
   */
  readonly change = output<TreeSelectChangeEvent>();

  /** @zh 弹层显隐变化 @en Emitted when the popup visibility changes */
  readonly visibleChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<TreeSelectValue | undefined>(undefined);
  private readonly expandedValues = signal<Set<string | number>>(new Set());

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  /** 宿主宽度：弹层至少和触发器同宽（对齐上游 SelectInput 的 matchWidth）。 */
  protected readonly hostWidth = signal(0);

  constructor() {
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      this.hostWidth.set(Math.round(width));
    });
    observer.observe(this.hostRef.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private readonly panelTopDirectives = contentChildren(TTreeSelectPanelTop);
  private readonly panelBottomDirectives = contentChildren(TTreeSelectPanelBottom);

  protected readonly panelTopTemplate = computed(() => this.panelTopDirectives()[0]?.template ?? null);
  protected readonly panelBottomTemplate = computed(
    () => this.panelBottomDirectives()[0]?.template ?? null,
  );

  private readonly fieldKeys = computed<Required<TreeSelectKeys>>(() => ({
    ...TREE_SELECT_DEFAULT_KEYS,
    ...this.keys(),
  }));

  /** `data` 展开后的索引，展开 / 选中 / 回显都基于它。 */
  protected readonly tree = computed(() => buildTreeSelectTree(this.data(), this.fieldKeys()));

  protected readonly currentValue = computed<TreeSelectValue | undefined>(() => {
    if (this.value() !== undefined) return this.value();
    if (this.innerValue() !== undefined) return this.innerValue();
    return this.defaultValue();
  });

  protected readonly selectedNode = computed<TreeSelectNode | null>(() => {
    const value = this.currentValue();
    if (value === undefined || value === null || value === '') return null;
    const tree = this.tree();
    if (typeof value === 'object') {
      const byData = tree.byData.get(value);
      if (byData) return byData;
      const key = value[this.fieldKeys().value] as string | number | undefined;
      return key === undefined ? null : (tree.byValue.get(key) ?? null);
    }
    return tree.byValue.get(value) ?? null;
  });

  protected readonly hasValue = computed(() => {
    const value = this.currentValue();
    return value !== undefined && value !== null && value !== '';
  });

  protected readonly displayText = computed(() => {
    const node = this.selectedNode();
    if (node) return node.label;
    if (!this.hasValue()) return '';
    const value = this.currentValue();
    if (typeof value === 'object') {
      return String(value[this.fieldKeys().value] ?? '');
    }
    return String(value);
  });

  /** 当前可见的节点：根节点 + 展开节点的子节点，按树顺序拉平。 */
  protected readonly flatNodes = computed<TreeSelectNode[]>(() => {
    const result: TreeSelectNode[] = [];
    const expanded = this.expandedValues();
    const walk = (nodes: TreeSelectNode[]): void => {
      for (const node of nodes) {
        result.push(node);
        if (node.children.length && expanded.has(node.value)) walk(node.children);
      }
    };
    walk(this.tree().roots);
    return result;
  });

  protected readonly wrapperClasses = computed(() => {
    const classes = ['t-select-input', 't-tree-select'];
    if (this.open()) classes.push('t-select-input--popup-visible');
    if (!this.hasValue()) classes.push('t-select-input--empty');
    return classes.join(' ');
  });

  protected readonly inputClasses = computed(() => {
    const classes = ['t-input', 't-input--prefix', 't-input--suffix'];
    if (this.size() !== 'medium') classes.push(`t-size-${SIZE_SUFFIX[this.size()]}`);
    if (this.open()) classes.push('t-input--focused', 't-is-focused');
    if (this.disabled()) classes.push('t-is-disabled');
    return classes.join(' ');
  });

  protected readonly arrowClasses = computed(() => {
    const classes = ['t-fake-arrow'];
    if (this.open()) classes.push('t-fake-arrow--active', 't-fake-arrow--highlight');
    if (this.disabled()) classes.push('t-fake-arrow--disable');
    return classes.join(' ');
  });

  protected readonly panelSizeClass = computed(
    () => `t-select__dropdown-inner--size-${SIZE_SUFFIX[this.size()]}`,
  );

  protected readonly treeClasses = computed(() =>
    ['t-tree', 't-tree--hoverable', 't-tree--transition', this.disabled() ? 't-is-disabled' : '']
      .filter(Boolean)
      .join(' '),
  );

  protected readonly placeholderText = computed(() => {
    const label = this.selectedNode()?.label;
    return this.open() && label ? label : this.placeholder();
  });

  protected isExpanded(node: TreeSelectNode): boolean {
    return this.expandedValues().has(node.value);
  }

  protected isActive(node: TreeSelectNode): boolean {
    return this.selectedNode() === node;
  }

  protected isNodeDisabled(node: TreeSelectNode): boolean {
    return this.disabled() || node.disabled;
  }

  protected itemClasses(node: TreeSelectNode): string {
    return [
      't-tree__item',
      this.isExpanded(node) ? 't-tree__item--open' : '',
      this.isActive(node) ? 't-is-active' : '',
      this.isNodeDisabled(node) ? 't-is-disabled' : '',
      't-tree__item--visible',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected labelClasses(node: TreeSelectNode): string {
    return ['t-tree__label', this.isActive(node) ? 't-is-active' : ''].filter(Boolean).join(' ');
  }

  protected handleVisibleChange(visible: boolean): void {
    if (this.disabled()) return;
    this.open.set(visible);
    this.visibleChange.emit(visible);
    if (visible) this.expandParentsOfSelected();
  }

  protected selectNode(node: TreeSelectNode, event: Event): void {
    event.stopPropagation();
    if (this.isNodeDisabled(node)) return;

    const value: TreeSelectValue = this.valueType() === 'object' ? node.data : node.value;
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, data: node.data, trigger: 'check' });
    this.open.set(false);
    this.visibleChange.emit(false);
  }

  protected toggleExpand(node: TreeSelectNode, event: Event): void {
    event.stopPropagation();
    if (this.isNodeDisabled(node) || !node.children.length) return;

    const next = new Set(this.expandedValues());
    if (next.has(node.value)) next.delete(node.value);
    else next.add(node.value);
    this.expandedValues.set(next);
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;

    const value = this.valueType() === 'object' ? undefined : '';
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, data: null, trigger: 'clear' });
  }

  /** 打开面板时把已选节点的所有父级展开。 */
  private expandParentsOfSelected(): void {
    const node = this.selectedNode();
    if (!node) return;
    const next = new Set(this.expandedValues());
    for (const ancestor of node.pathNodes.slice(0, -1)) next.add(ancestor.value);
    this.expandedValues.set(next);
  }
}
