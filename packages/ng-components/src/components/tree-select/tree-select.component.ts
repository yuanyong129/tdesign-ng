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
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
} from '@angular/core';
import { TPopup } from '../popup';
import { TTag } from '../tag/tag.component';
import { TTreeSelectPanelBottom, TTreeSelectPanelTop } from './tree-select-content.directives';
import { TREE_SELECT_DEFAULT_KEYS, buildTreeSelectTree } from './tree-select-tree';
import {
  TreeSelectChangeEvent,
  TreeSelectData,
  TreeSelectKeys,
  TreeSelectNode,
  TreeSelectSingleValue,
  TreeSelectTreeProps,
  TreeSelectValue,
} from './tree-select.types';

const SIZE_SUFFIX: Record<'small' | 'medium' | 'large', string> = {
  small: 's',
  medium: 'm',
  large: 'l',
};

/** 搜索命中的节点集合。 */
interface FilterState {
  matched: Set<string | number>;
  withMatchedDescendant: Set<string | number>;
}

/**
 * @zh 树选择：用树形结构的数据做单选或多选。
 *
 * ```html
 * <t-tree-select [data]="data" [value]="value" (change)="value = $event.value" />
 * <t-tree-select [data]="data" [multiple]="true" [treeProps]="{ checkStrictly: true }" />
 * ```
 *
 * @en Tree select: single or multiple selection from tree data.
 */
@Component({
  selector: 't-tree-select',
  standalone: true,
  imports: [NgTemplateOutlet, TPopup, TTag],
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
   * @zh 选中值，受控用法。多选时为值数组。
   * @en Selected value in controlled mode; an array in multiple mode.
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
   * @zh 是否多选。
   * @en Whether multiple selection is allowed.
   * @defaultValue false
   */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * @zh 多选上限，0 表示不限制。
   * @en Maximum number of checked nodes; 0 means unlimited.
   * @defaultValue 0
   */
  readonly max = input(0, { transform: numberAttribute });

  /**
   * @zh 多选时最多显示几个标签，其余用 +N 折叠；0 表示全部显示。
   * @en Maximum number of tags to show before collapsing into +N; 0 shows all.
   * @defaultValue 0
   */
  readonly minCollapsedNum = input(0, { transform: numberAttribute });

  /**
   * @zh 透传给内部树的配置，当前支持 checkStrictly / valueMode / expandAll。
   * @en Tree props passed through; checkStrictly / valueMode / expandAll are supported.
   */
  readonly treeProps = input<TreeSelectTreeProps | undefined>(undefined);

  /**
   * @zh 是否可搜索。打开后在输入框里输入关键字，树只保留命中节点及其父级。
   * @en Whether the tree can be searched; only matched nodes and their ancestors are kept.
   * @defaultValue false
   */
  readonly filterable = input(false, { transform: booleanAttribute });

  /**
   * @zh 自定义搜索函数，签名为 `(keyword, data) => boolean`（只支持同步返回）。
   * @en Custom search predicate `(keyword, data) => boolean` (sync only).
   */
  readonly filter = input<((filterWords: string, data: TreeSelectData) => boolean) | undefined>(undefined);

  /**
   * @zh 受控的搜索关键字。
   * @en Controlled search keyword.
   */
  readonly inputValue = input<string | undefined>(undefined);

  /**
   * @zh 默认搜索关键字。
   * @en Default search keyword.
   * @defaultValue undefined
   */
  readonly defaultInputValue = input<string | undefined>(undefined);

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

  /** @zh 搜索关键字变化 @en Emitted when the search keyword changes */
  readonly search = output<string>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<TreeSelectValue | undefined>(undefined);
  private readonly innerKeyword = signal<string | undefined>(undefined);
  private readonly expandedValues = signal<Set<string | number>>(new Set());

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  /** 宿主宽度：弹层至少和触发器同宽（对齐上游 SelectInput 的 matchWidth）。 */
  protected readonly hostWidth = signal(0);

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

  /** `data` 展开后的索引，展开 / 选中 / 多选推导都基于它。 */
  protected readonly tree = computed(() => buildTreeSelectTree(this.data(), this.fieldKeys()));

  protected readonly isFilterable = computed(() => this.filterable() || !!this.filter());

  protected readonly keyword = computed(() => {
    const controlled = this.inputValue();
    if (controlled !== undefined) return controlled;
    const inner = this.innerKeyword();
    if (inner !== undefined) return inner;
    return this.defaultInputValue() ?? '';
  });

  protected readonly isFiltering = computed(
    () => this.isFilterable() && this.open() && this.keyword().trim().length > 0,
  );

  protected readonly checkStrictly = computed(() => this.treeProps()?.checkStrictly === true);

  protected readonly valueMode = computed(() => this.treeProps()?.valueMode ?? 'onlyLeaf');

  protected readonly currentValue = computed<TreeSelectValue | undefined>(() => {
    if (this.value() !== undefined) return this.value();
    if (this.innerValue() !== undefined) return this.innerValue();
    return this.defaultValue();
  });

  /** 多选值统一成数组。 */
  protected readonly multipleValues = computed<TreeSelectSingleValue[]>(() => {
    const value = this.currentValue();
    if (Array.isArray(value)) return value;
    return value === undefined || value === null || value === '' ? [] : [value];
  });

  /** 多选值对应的节点 key（valueType=object 时取数据项的 value 字段）。 */
  protected readonly selectedKeys = computed<Array<string | number>>(() =>
    this.multipleValues()
      .map((value) => this.valueKeyOf(value))
      .filter((key): key is string | number => key !== undefined),
  );

  /** 单选值对应的节点。 */
  protected readonly selectedNode = computed<TreeSelectNode | null>(() => {
    if (this.multiple()) return null;
    const key = this.valueKeyOf(this.currentValue());
    if (key === undefined || key === null || key === '') return null;
    return this.tree().byValue.get(key) ?? null;
  });

  protected readonly hasValue = computed(() => {
    if (this.multiple()) return this.selectedKeys().length > 0;
    const value = this.currentValue();
    return value !== undefined && value !== null && value !== '' && !Array.isArray(value);
  });

  protected readonly displayText = computed(() => {
    if (this.multiple()) return '';
    const node = this.selectedNode();
    if (node) return node.label;
    if (!this.hasValue()) return '';
    const value = this.currentValue();
    const key = this.valueKeyOf(value);
    return key === undefined ? '' : String(key);
  });

  /** 多选时输入框里的标签。 */
  protected readonly selectedTags = computed(() => {
    const tree = this.tree();
    return this.selectedKeys().map((key) => ({
      key,
      label: tree.byValue.get(key)?.label ?? String(key),
    }));
  });

  protected readonly visibleTags = computed(() => {
    const num = this.minCollapsedNum();
    return num > 0 ? this.selectedTags().slice(0, num) : this.selectedTags();
  });

  protected readonly overflowCount = computed(() =>
    Math.max(this.selectedTags().length - this.visibleTags().length, 0),
  );

  /** 多选：当前勾选的节点 key 集合（父子不关联模式）。 */
  private readonly checkedNodeSet = computed(() => new Set(this.selectedKeys()));

  /** 多选：当前勾选的叶子节点集合，父子关联模式下由它推导勾选态与值。 */
  private readonly checkedLeafSet = computed(() => {
    const tree = this.tree();
    const set = new Set<string | number>();
    for (const key of this.selectedKeys()) {
      const node = tree.byValue.get(key);
      if (!node) continue;
      for (const leaf of tree.leaves.get(node) ?? []) set.add(leaf.value);
    }
    return set;
  });

  /** 搜索命中的节点，以及「有命中后代」的祖先节点。 */
  private readonly filterState = computed<FilterState | null>(() => {
    if (!this.isFiltering()) return null;
    const keyword = this.keyword().trim();
    const filter = this.filter();
    const matched = new Set<string | number>();
    const withMatchedDescendant = new Set<string | number>();

    const test = (node: TreeSelectNode): boolean =>
      filter ? filter(keyword, node.data) : node.label.toLowerCase().includes(keyword.toLowerCase());

    const walk = (node: TreeSelectNode): boolean => {
      const self = test(node);
      if (self) matched.add(node.value);
      let childMatched = false;
      for (const child of node.children) {
        if (walk(child)) childMatched = true;
      }
      if (childMatched) withMatchedDescendant.add(node.value);
      return self || childMatched;
    };

    for (const root of this.tree().roots) walk(root);
    return { matched, withMatchedDescendant };
  });

  /** 当前可见的节点：普通模式按展开状态、搜索模式只保留命中节点与祖先。 */
  protected readonly flatNodes = computed<TreeSelectNode[]>(() => {
    const result: TreeSelectNode[] = [];
    const state = this.filterState();

    if (state) {
      const walk = (nodes: TreeSelectNode[]): void => {
        for (const node of nodes) {
          const matched = state.matched.has(node.value);
          const hasMatchedChild = state.withMatchedDescendant.has(node.value);
          if (!matched && !hasMatchedChild) continue;
          result.push(node);
          if (hasMatchedChild) walk(node.children);
        }
      };
      walk(this.tree().roots);
      return result;
    }

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
    if (this.multiple()) classes.push('t-select-input--multiple');
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

  protected readonly tagInputClasses = computed(() => {
    const classes = ['t-tag-input'];
    if (this.selectedTags().length) classes.push('t-tag-input--with-tag');
    else classes.push('t-is-empty');
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
    [
      't-tree',
      't-tree--hoverable',
      't-tree--transition',
      this.multiple() ? 't-tree--checkable' : '',
      this.disabled() ? 't-is-disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly placeholderText = computed(() => {
    if (this.multiple()) {
      return this.selectedTags().length || this.isFiltering() ? '' : this.placeholder();
    }
    const label = this.selectedNode()?.label;
    return this.open() && label ? label : this.placeholder();
  });

  protected readonly inputDisplayValue = computed(() => {
    if (this.isFiltering()) return this.keyword();
    return this.multiple() ? '' : this.displayText();
  });

  constructor() {
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;
        this.hostWidth.set(Math.round(width));
      });
      observer.observe(this.hostRef.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    }

    // expandAll 打开时展开所有父节点；数据变化后重新展开
    effect(() => {
      const expandAll = this.treeProps()?.expandAll === true;
      const tree = this.tree();
      if (!expandAll) return;
      untracked(() => {
        const next = new Set<string | number>();
        for (const node of tree.nodes) {
          if (node.children.length) next.add(node.value);
        }
        this.expandedValues.set(next);
      });
    });
  }

  protected isExpanded(node: TreeSelectNode): boolean {
    if (this.isFiltering() && this.filterState()?.withMatchedDescendant.has(node.value)) return true;
    return this.expandedValues().has(node.value);
  }

  protected isActive(node: TreeSelectNode): boolean {
    return !this.multiple() && this.selectedNode() === node;
  }

  protected isChecked(node: TreeSelectNode): boolean {
    if (!this.multiple()) return false;
    if (this.checkStrictly()) return this.checkedNodeSet().has(node.value);

    const leaves = this.tree().leaves.get(node) ?? [];
    const set = this.checkedLeafSet();
    return leaves.length > 0 && leaves.every((leaf) => set.has(leaf.value));
  }

  protected isIndeterminate(node: TreeSelectNode): boolean {
    if (!this.multiple() || this.checkStrictly() || !node.children.length) return false;
    const leaves = this.tree().leaves.get(node) ?? [];
    if (!leaves.length) return false;
    const set = this.checkedLeafSet();
    const checked = leaves.filter((leaf) => set.has(leaf.value)).length;
    return checked > 0 && checked < leaves.length;
  }

  protected isNodeDisabled(node: TreeSelectNode): boolean {
    return this.disabled() || node.disabled;
  }

  /** 搜索结果里只用于展示路径的祖先节点（不可勾选）。 */
  protected isFilterLocked(node: TreeSelectNode): boolean {
    const state = this.filterState();
    return !!state && !state.matched.has(node.value) && state.withMatchedDescendant.has(node.value);
  }

  protected isCheckboxDisabled(node: TreeSelectNode): boolean {
    if (this.isNodeDisabled(node) || this.isFilterLocked(node)) return true;
    const max = this.max();
    if (!this.multiple() || max <= 0 || this.isChecked(node)) return false;

    if (this.checkStrictly()) return this.selectedKeys().length >= max;
    const leaves = this.tree().leaves.get(node) ?? [node];
    const current = this.checkedLeafSet();
    const added = leaves.filter((leaf) => !current.has(leaf.value)).length;
    return current.size + added > max;
  }

  protected itemClasses(node: TreeSelectNode): string {
    const classes = ['t-tree__item'];
    if (this.isExpanded(node)) classes.push('t-tree__item--open');
    if (this.isActive(node)) classes.push('t-is-active');
    if (this.isNodeDisabled(node)) classes.push('t-is-disabled');

    const state = this.filterState();
    if (state) {
      if (state.matched.has(node.value)) classes.push('t-tree__item--matched');
      else if (state.withMatchedDescendant.has(node.value)) classes.push('t-tree__item--locked');
    }

    classes.push('t-tree__item--visible');
    return classes.join(' ');
  }

  protected labelClasses(node: TreeSelectNode): string {
    return ['t-tree__label', this.isActive(node) ? 't-is-active' : ''].filter(Boolean).join(' ');
  }

  protected checkboxLabelClasses(node: TreeSelectNode): string {
    return [
      't-checkbox',
      't-tree__label',
      this.isChecked(node) ? 't-is-checked' : '',
      this.isIndeterminate(node) ? 't-is-indeterminate' : '',
      this.isCheckboxDisabled(node) ? 't-is-disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected handleVisibleChange(visible: boolean): void {
    if (this.disabled()) return;
    this.open.set(visible);
    this.visibleChange.emit(visible);
    if (!visible) return;
    if (this.inputValue() === undefined) this.innerKeyword.set('');
    this.expandParentsOfSelected();
  }

  protected handleInputClick(event: MouseEvent): void {
    if (!this.isFilterable()) return;
    // 阻止 TPopup 的触发器点击把面板关掉，自己控制展开
    event.stopPropagation();
    if (this.disabled() || this.open()) return;
    if (this.inputValue() === undefined) this.innerKeyword.set('');
    this.open.set(true);
    this.visibleChange.emit(true);
    this.expandParentsOfSelected();
  }

  protected handleInput(event: Event): void {
    if (!this.isFilterable() || this.disabled()) return;
    const value = (event.target as HTMLInputElement).value;
    if (this.inputValue() === undefined) this.innerKeyword.set(value);
    this.search.emit(value);
    if (!this.open()) {
      this.open.set(true);
      this.visibleChange.emit(true);
      this.expandParentsOfSelected();
    }
  }

  protected selectNode(node: TreeSelectNode, event: Event): void {
    event.stopPropagation();
    if (this.multiple() || this.isNodeDisabled(node)) return;

    const value: TreeSelectValue = this.valueType() === 'object' ? node.data : node.value;
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, data: node.data, trigger: 'check' });
    this.open.set(false);
    this.visibleChange.emit(false);
  }

  protected handleCheckboxClick(node: TreeSelectNode, event: MouseEvent): void {
    // 勾选态完全由 value 决定：阻止原生 checkbox 切换，避免受控值没更新时视觉与数据不一致
    event.preventDefault();
    event.stopPropagation();
    this.toggleCheck(node);
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

    const value: TreeSelectValue | undefined = this.multiple()
      ? []
      : this.valueType() === 'object'
        ? undefined
        : '';
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, data: null, trigger: 'clear' });
  }

  protected removeTag(tag: { key: string | number }, event: MouseEvent): void {
    event.stopPropagation();
    this.removeValue(tag.key);
  }

  /** 打开面板时把已选节点的所有父级展开。 */
  private expandParentsOfSelected(): void {
    const tree = this.tree();
    const next = new Set(this.expandedValues());
    const nodes = this.multiple()
      ? this.selectedKeys()
          .map((key) => tree.byValue.get(key))
          .filter((node): node is TreeSelectNode => !!node)
      : this.selectedNode()
        ? [this.selectedNode() as TreeSelectNode]
        : [];

    for (const node of nodes) {
      for (const ancestor of node.pathNodes.slice(0, -1)) next.add(ancestor.value);
    }
    this.expandedValues.set(next);
  }

  private toggleCheck(node: TreeSelectNode): void {
    if (this.isCheckboxDisabled(node)) return;

    if (this.checkStrictly()) {
      const keys = [...this.selectedKeys()];
      const index = keys.indexOf(node.value);
      if (index >= 0) keys.splice(index, 1);
      else keys.push(node.value);
      this.commitMultiple(keys, index >= 0 ? 'uncheck' : 'check', node);
      return;
    }

    const leaves = new Set(this.checkedLeafSet());
    const nodeLeaves = this.tree().leaves.get(node) ?? [node];
    const checked = nodeLeaves.every((leaf) => leaves.has(leaf.value));

    if (!checked) {
      const max = this.max();
      const added = nodeLeaves.filter((leaf) => !leaves.has(leaf.value)).length;
      if (max > 0 && leaves.size + added > max) return;
      for (const leaf of nodeLeaves) leaves.add(leaf.value);
    } else {
      for (const leaf of nodeLeaves) leaves.delete(leaf.value);
    }

    this.commitMultiple(
      this.deriveKeysFromLeaves(leaves),
      checked ? 'uncheck' : 'check',
      node,
    );
  }

  private commitMultiple(
    keys: Array<string | number>,
    trigger: TreeSelectChangeEvent['trigger'],
    node?: TreeSelectNode,
  ): void {
    const uniqueKeys = [...new Set(keys)];
    const value = this.toEmittedValues(uniqueKeys);
    if (this.value() === undefined) this.innerValue.set(value);
    this.change.emit({ value, data: node?.data ?? null, trigger });
  }

  private toEmittedValues(keys: Array<string | number>): TreeSelectSingleValue[] {
    if (this.valueType() === 'object') {
      const tree = this.tree();
      return keys.map((key) => tree.byValue.get(key)?.data ?? key);
    }
    return keys;
  }

  private removeValue(key: string | number): void {
    if (this.disabled()) return;

    const node = this.tree().byValue.get(key);
    let nextKeys: Array<string | number>;

    if (this.checkStrictly() || !node) {
      nextKeys = this.selectedKeys().filter((item) => item !== key);
    } else {
      const leaves = new Set(this.checkedLeafSet());
      for (const leaf of this.tree().leaves.get(node) ?? []) leaves.delete(leaf.value);
      nextKeys = this.deriveKeysFromLeaves(leaves);
    }
    this.commitMultiple(nextKeys, 'uncheck', node);
  }

  /** 由叶子勾选集合按 valueMode 推导对外暴露的 key。 */
  private deriveKeysFromLeaves(leaves: Set<string | number>): Array<string | number> {
    const tree = this.tree();
    const mode = this.valueMode();
    const result: Array<string | number> = [];

    const walk = (node: TreeSelectNode): void => {
      if (!node.children.length) {
        if (leaves.has(node.value)) result.push(node.value);
        return;
      }
      const nodeLeaves = tree.leaves.get(node) ?? [];
      const fully = nodeLeaves.length > 0 && nodeLeaves.every((leaf) => leaves.has(leaf.value));
      if (fully && mode === 'parentFirst') {
        result.push(node.value);
        return;
      }
      if (fully && mode === 'all') {
        this.collectSubtree(node, result);
        return;
      }
      for (const child of node.children) walk(child);
    };

    for (const root of tree.roots) walk(root);
    return result;
  }

  private collectSubtree(node: TreeSelectNode, out: Array<string | number>): void {
    out.push(node.value);
    for (const child of node.children) this.collectSubtree(child, out);
  }

  /** valueType=object 时把数据项换算回节点 key。 */
  private valueKeyOf(value: TreeSelectValue | undefined): string | number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (Array.isArray(value)) return undefined;
    if (typeof value === 'object') {
      return value[this.fieldKeys().value] as string | number | undefined;
    }
    return value;
  }
}
