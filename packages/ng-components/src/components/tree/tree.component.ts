import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
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
} from '@angular/core';
import { TLoading } from '../loading';
import { TTreeEmptyTemplate, TTreeIconTemplate, TTreeLabelTemplate } from './tree-content.directives';
import {
  EMPTY_TREE_NODE_STATE,
  TREE_DEFAULT_KEYS,
  TreeNode,
  TreeNodeModel,
  TreeNodeState,
  TreeIndex,
  buildTree,
  collectCheckableLeaves,
  deriveCheckedKeys,
  isNodeChecked,
  isNodeDisabled,
} from './tree-model';
import type {
  TreeActiveEvent,
  TreeChangeEvent,
  TreeClickEvent,
  TreeExpandEvent,
  TreeExpandTrigger,
  TreeKeys,
  TreeOption,
  TreeScrollEvent,
  TreeSize,
  TreeValue,
  TreeValueMode,
} from './tree.types';

/** 渲染一行所需的全部派生数据。 */
interface TreeRow {
  node: TreeNode;
  model: TreeNodeModel;
  value: TreeValue;
  label: string;
  level: number;
  leaf: boolean;
  disabled: boolean;
  checkDisabled: boolean;
  expanded: boolean;
  checked: boolean;
  indeterminate: boolean;
  actived: boolean;
  loading: boolean;
  visible: boolean;
  classes: string;
  labelClasses: string;
  lineClasses: string | null;
  lineLevel: number | null;
  lineShadow: string | null;
  ariaChecked: 'true' | 'false' | 'mixed' | null;
  ariaExpanded: 'true' | 'false' | null;
  ariaSelected: 'true' | 'false' | null;
  tabindex: number;
}

/** 数字按 px 处理，字符串原样使用（对齐上游 `formatCSSUnit`）。 */
function formatCssUnit(value: string | number | undefined): string | null {
  if (value === undefined) return null;
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * @zh 树形控件：用树形数据展示层级结构，支持展开收起、勾选联动、懒加载与激活行。
 *
 * ```html
 * <t-tree [data]="data" [value]="value" [checkable]="true" (change)="value = $event.value" />
 * <t-tree [data]="data" [(expanded)]="expanded" [line]="true" [hover]="true" />
 * <t-tree [data]="lazyData" [load]="loadChildren" />
 * ```
 *
 * @en Tree: displays hierarchical data with expand, check linkage, lazy loading and active rows.
 */
@Component({
  selector: 't-tree',
  standalone: true,
  imports: [NgTemplateOutlet, TLoading],
  templateUrl: './tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'tree',
    '[class]': 'classes()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-multiselectable]': 'checkable() ? "true" : null',
    '[style.height]': 'heightStyle()',
    '[style.max-height]': 'maxHeightStyle()',
    '[style.overflow-y]': 'overflowStyle()',
    '(keydown)': 'handleKeydown($event)',
    '(scroll)': 'handleScroll($event)',
  },
})
export class TTree {
  /** @zh 是否显示激活态 @en Whether rows can be activated @defaultValue false */
  readonly activable = input(false, { transform: booleanAttribute });

  /** @zh 是否允许多个节点同时处于激活态 @en Whether multiple rows can be active at the same time @defaultValue false */
  readonly activeMultiple = input(false, { transform: booleanAttribute });

  /** @zh 激活的节点值，受控用法 @en Active values in controlled mode */
  readonly actived = input<TreeValue[] | undefined>(undefined);

  /** @zh 默认激活的节点值 @en Default active values @defaultValue [] */
  readonly defaultActived = input<TreeValue[]>([]);

  /** @zh 是否显示复选框 @en Whether to show checkboxes @defaultValue false */
  readonly checkable = input(false, { transform: booleanAttribute });

  /** @zh 是否禁用复选框的父子联动，为 true 时各节点互不影响 @en Whether checkboxes are unlinked; true means each node is independent @defaultValue false */
  readonly checkStrictly = input(false, { transform: booleanAttribute });

  /** @zh 树形数据 @en Tree data @defaultValue [] */
  readonly data = input<TreeOption[]>([]);

  /** @zh 是否禁用某个节点的复选框，可传布尔值或 `(node) => boolean` @en Disable a node checkbox; a boolean or `(node) => boolean` @defaultValue false */
  readonly disableCheck = input<boolean | ((node: TreeNodeModel) => boolean)>(false);

  /** @zh 是否禁用整棵树 @en Whether the whole tree is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 空数据时的提示文案 @en Text shown when there is no data @defaultValue 暂无数据 */
  readonly empty = input('暂无数据');

  /** @zh 是否默认展开全部节点 @en Whether to expand all nodes by default @defaultValue false */
  readonly expandAll = input(false, { transform: booleanAttribute });

  /** @zh 默认展开的层级，节点 `level < expandLevel` 时展开 @en Expand nodes whose level is below this value @defaultValue 0 */
  readonly expandLevel = input(0, { transform: numberAttribute });

  /** @zh 是否只允许同级的展开一个节点 @en Whether only one sibling stays expanded @defaultValue false */
  readonly expandMutex = input(false, { transform: booleanAttribute });

  /** @zh 点击节点时是否展开 @en Whether clicking a node expands it @defaultValue false */
  readonly expandOnClickNode = input(false, { transform: booleanAttribute });

  /** @zh 展开节点时是否一并展开其祖先 @en Whether expanding a node also expands its ancestors @defaultValue false */
  readonly expandParent = input(false, { transform: booleanAttribute });

  /** @zh 展开的节点值，受控用法 @en Expanded values in controlled mode */
  readonly expanded = input<TreeValue[] | undefined>(undefined);

  /** @zh 默认展开的节点值 @en Default expanded values @defaultValue [] */
  readonly defaultExpanded = input<TreeValue[]>([]);

  /** @zh 树的高度，超出后滚动 @en Height of the tree; content scrolls when it overflows */
  readonly height = input<string | number | undefined>(undefined);

  /** @zh 节点悬停时是否高亮 @en Whether the label is highlighted on hover @defaultValue false */
  readonly hover = input(false, { transform: booleanAttribute });

  /** @zh 是否显示展开图标 @en Whether to show the expand icon @defaultValue true */
  readonly icon = input(true, { transform: booleanAttribute });

  /** @zh 自定义字段名，默认 value / label / children / disabled @en Custom field names; defaults to value / label / children / disabled */
  readonly keys = input<TreeKeys>({});

  /** @zh 是否显示节点文案 @en Whether to show node labels @defaultValue true */
  readonly label = input(true, { transform: booleanAttribute });

  /** @zh 是否启用懒加载，`children: true` 的节点在展开时调用 `load` @en Whether lazy loading is enabled; nodes with `children: true` call `load` on expand @defaultValue true */
  readonly lazy = input(true, { transform: booleanAttribute });

  /** @zh 是否显示连接线 @en Whether to show the connecting lines @defaultValue false */
  readonly line = input(false, { transform: booleanAttribute });

  /** @zh 懒加载回调，返回子节点数组（可返回 Promise） @en Lazy load callback returning the children, optionally as a Promise */
  readonly load = input<
    ((node: TreeNodeModel) => TreeOption[] | Promise<TreeOption[]>) | undefined
  >(undefined);

  /** @zh 是否显示整棵树的加载态 @en Whether the whole tree is loading @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @zh 树的最大高度，超出后滚动 @en Maximum height of the tree; content scrolls when it overflows */
  readonly maxHeight = input<string | number | undefined>(undefined);

  /** @zh 树尺寸；样式表里没有 tree 的尺寸规则，当前只保留接口 @en Tree size; the stylesheet has no tree size rules, so this is API-only for now @defaultValue medium @values small,medium,large */
  readonly size = input<TreeSize>('medium');

  /** @zh 是否开启展开收起的过渡动画 @en Whether expand and collapse are animated @defaultValue true */
  readonly transition = input(true, { transform: booleanAttribute });

  /** @zh 勾选值，受控用法；配合 valueChange 支持 `[(value)]` @en Checked values in controlled mode; supports `[(value)]` with valueChange */
  readonly value = input<TreeValue[] | undefined>(undefined);

  /** @zh 默认勾选值 @en Default checked values @defaultValue [] */
  readonly defaultValue = input<TreeValue[]>([]);

  /** @zh 勾选值的回传模式：onlyLeaf 只回传叶子，parentFirst 父级全选时回传父级，all 父子都回传 @en How checked values are derived @defaultValue onlyLeaf @values onlyLeaf,parentFirst,all */
  readonly valueMode = input<TreeValueMode>('onlyLeaf');

  /** @zh 勾选值变化时触发 @en Emitted when the checked values change */
  readonly valueChange = output<TreeValue[]>();

  /** @zh 展开值变化时触发 @en Emitted when the expanded values change */
  readonly expandedChange = output<TreeValue[]>();

  /** @zh 激活值变化时触发 @en Emitted when the active values change */
  readonly activedChange = output<TreeValue[]>();

  /** @zh 节点展开或收起时触发 @en Emitted when a node is expanded or collapsed */
  readonly expand = output<TreeExpandEvent>();

  /** @zh 节点勾选状态变化时触发 @en Emitted when a node is checked or unchecked */
  readonly change = output<TreeChangeEvent>();

  /** @zh 节点激活状态变化时触发 @en Emitted when a node is activated */
  readonly active = output<TreeActiveEvent>();

  /** @zh 节点被点击时触发 @en Emitted when a node is clicked */
  readonly click = output<TreeClickEvent>();

  /** @zh 树滚动时触发 @en Emitted when the tree scrolls */
  readonly scroll = output<TreeScrollEvent>();

  private readonly innerValue = signal<TreeValue[] | undefined>(undefined);
  private readonly innerExpanded = signal<TreeValue[] | undefined>(undefined);
  private readonly innerActived = signal<TreeValue[] | undefined>(undefined);
  private readonly loadingKeys = signal<Set<TreeValue>>(new Set());
  private readonly loadedChildren = signal<Map<TreeValue, TreeOption[]>>(new Map());
  /** 已经发起过懒加载的节点，失败后不再自动重试（对齐上游 `children === false` 的效果）。 */
  private readonly attemptedLoads = signal<Set<TreeValue>>(new Set());
  private readonly focusValue = signal<TreeValue | null>(null);

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly labelDirectives = contentChildren(TTreeLabelTemplate);
  private readonly iconDirectives = contentChildren(TTreeIconTemplate);
  private readonly emptyDirectives = contentChildren(TTreeEmptyTemplate);

  protected readonly labelTemplate = computed<TemplateRef<unknown> | null>(
    () => this.labelDirectives()[0]?.template ?? null,
  );
  protected readonly iconTemplate = computed<TemplateRef<unknown> | null>(
    () => this.iconDirectives()[0]?.template ?? null,
  );
  protected readonly emptyTemplate = computed<TemplateRef<unknown> | null>(
    () => this.emptyDirectives()[0]?.template ?? null,
  );

  private readonly fieldKeys = computed<Required<TreeKeys>>(() => ({
    value: this.keys().value ?? TREE_DEFAULT_KEYS.value,
    label: this.keys().label ?? TREE_DEFAULT_KEYS.label,
    children: this.keys().children ?? TREE_DEFAULT_KEYS.children,
    disabled: this.keys().disabled ?? TREE_DEFAULT_KEYS.disabled,
  }));

  /** `data` 展开后的结构索引；懒加载回填的子节点会合并进来。 */
  private readonly index = computed<TreeIndex>(() =>
    buildTree(this.data(), this.fieldKeys(), this.loadedChildren()),
  );

  private readonly valueKeys = computed<TreeValue[]>(
    () => this.value() ?? this.innerValue() ?? this.defaultValue(),
  );

  private readonly valueSet = computed<Set<TreeValue>>(() => new Set(this.valueKeys()));

  /** 叶子节点被勾选的集合，父节点的勾选 / 半选都由它推导。 */
  private readonly checkedLeafSet = computed<Set<TreeValue>>(() => {
    if (this.checkStrictly()) return new Set(this.valueKeys());
    const index = this.index();
    const set = new Set<TreeValue>();
    for (const key of this.valueKeys()) {
      const node = index.byValue.get(key);
      if (!node) continue;
      const leaves = index.leaves.get(node) ?? [node];
      for (const leaf of leaves) {
        set.add(leaf.value);
      }
    }
    return set;
  });

  private readonly expandedKeys = computed<TreeValue[]>(() => {
    const expanded = this.expanded();
    if (expanded !== undefined) return expanded;
    const inner = this.innerExpanded();
    if (inner !== undefined) return inner;
    return this.initialExpandedKeys();
  });

  private readonly expandedSet = computed<Set<TreeValue>>(() => new Set(this.expandedKeys()));

  private readonly activedKeys = computed<TreeValue[]>(
    () => this.actived() ?? this.innerActived() ?? this.defaultActived(),
  );

  private readonly activeSet = computed<Set<TreeValue>>(() => new Set(this.activedKeys()));

  /** 每个节点的运行时状态，节点模型与行数据都从这里取。 */
  private readonly stateMap = computed<Map<TreeValue, TreeNodeState>>(() => {
    const index = this.index();
    const expanded = this.expandedSet();
    const actived = this.activeSet();
    const loading = this.loadingKeys();
    const checkedLeaves = this.checkedLeafSet();
    const checkStrictly = this.checkStrictly();
    const checkedValues = this.valueSet();

    const visible = new Set<TreeValue>();
    const walkVisible = (nodes: readonly TreeNode[]): void => {
      for (const node of nodes) {
        visible.add(node.value);
        if (expanded.has(node.value)) walkVisible(node.children);
      }
    };
    walkVisible(index.roots);

    const map = new Map<TreeValue, TreeNodeState>();
    for (const node of index.nodes) {
      const isLeaf = node.leaf;
      const isChecked = checkStrictly
        ? checkedValues.has(node.value)
        : isNodeChecked(node, index, checkedLeaves);
      let indeterminate = false;
      if (!checkStrictly && !isLeaf && this.checkable()) {
        const leaves = index.leaves.get(node) ?? [node];
        const checkedCount = leaves.filter((leaf) => checkedLeaves.has(leaf.value)).length;
        indeterminate = checkedCount > 0 && checkedCount < leaves.length;
      }
      map.set(node.value, {
        expanded: expanded.has(node.value) && !isLeaf,
        checked: isChecked,
        indeterminate,
        actived: actived.has(node.value),
        loading: loading.has(node.value),
        visible: visible.has(node.value),
      });
    }
    return map;
  });

  private readonly stateOf = (value: TreeValue): TreeNodeState =>
    this.stateMap().get(value) ?? EMPTY_TREE_NODE_STATE;

  /** 渲染行：全部节点都会生成，靠 `--visible` / `--hidden` 切换显隐以复用样式表里的过渡。 */
  protected readonly rows = computed<TreeRow[]>(() => {
    const index = this.index();
    const states = this.stateMap();
    const iconVisible = this.icon();
    const checkable = this.checkable();
    const line = this.line();
    const activable = this.activable();
    const rows: TreeRow[] = [];

    for (const node of index.nodes) {
      const state = states.get(node.value) ?? EMPTY_TREE_NODE_STATE;
      const nodeActivable = node.activable ?? activable;
      const disabled = isNodeDisabled(node, this.disabled());
      const checkDisabled = this.isCheckDisabled(node, state, disabled);
      const active = nodeActivable && state.actived;

      const classes = ['t-tree__item'];
      if (state.expanded) classes.push('t-tree__item--open');
      if (active) classes.push('t-is-active');
      if (disabled) classes.push('t-is-disabled');
      classes.push(state.visible ? 't-tree__item--visible' : 't-tree__item--hidden');

      const labelClasses = ['t-tree__label'];
      if (active) labelClasses.push('t-is-active');
      if (checkable) {
        labelClasses.unshift('t-checkbox');
        if (state.checked) labelClasses.push('t-is-checked');
        if (state.indeterminate) labelClasses.push('t-is-indeterminate');
        if (checkDisabled) labelClasses.push('t-is-disabled');
      }

      const model = new TreeNodeModel(index, node, state, this.stateOf);
      const lineClasses = line && node.parent ? this.lineClasses(node, iconVisible) : null;

      rows.push({
        node,
        model,
        value: node.value,
        label: node.label,
        level: node.level,
        leaf: node.leaf,
        disabled,
        checkDisabled,
        expanded: state.expanded,
        checked: state.checked,
        indeterminate: state.indeterminate,
        actived: state.actived,
        loading: state.loading,
        visible: state.visible,
        classes: classes.join(' '),
        labelClasses: labelClasses.join(' '),
        lineClasses,
        lineLevel: node.level || null,
        lineShadow: lineClasses ? this.lineShadow(node) : null,
        ariaChecked: checkable
          ? state.indeterminate
            ? 'mixed'
            : state.checked
              ? 'true'
              : 'false'
          : null,
        ariaExpanded: node.leaf ? null : state.expanded ? 'true' : 'false',
        ariaSelected: nodeActivable ? (state.actived ? 'true' : 'false') : null,
        tabindex: -1,
      });
    }
    return rows;
  });

  protected readonly classes = computed(() => {
    const classes = ['t-tree'];
    if (this.disabled()) classes.push('t-is-disabled');
    if (this.hover()) classes.push('t-tree--hoverable');
    if (this.transition()) classes.push('t-tree--transition');
    if (this.expandOnClickNode()) classes.push('t-tree--block-node');
    return classes.join(' ');
  });

  protected readonly heightStyle = computed(() => formatCssUnit(this.height()));

  protected readonly maxHeightStyle = computed(() => formatCssUnit(this.maxHeight()));

  protected readonly overflowStyle = computed(() =>
    this.height() !== undefined || this.maxHeight() !== undefined ? 'auto' : null,
  );

  constructor() {
    // 受控展开可能一开始就包含懒节点（例如服务端下发的默认展开），这里补一次加载。
    effect(() => {
      const expanded = this.expandedSet();
      const index = this.index();
      const attempted = this.attemptedLoads();
      if (!this.lazy() || !this.load()) return;
      for (const node of index.nodes) {
        if (!node.lazy || !expanded.has(node.value) || attempted.has(node.value)) continue;
        void this.loadNode(node);
      }
    });
  }

  /** 默认展开：`expandAll` 展开全部非叶节点，否则展开 `level < expandLevel` 的节点。 */
  private initialExpandedKeys(): TreeValue[] {
    const defaults = new Set(this.defaultExpanded());
    const expandAll = this.expandAll();
    const expandLevel = this.expandLevel();
    if (!expandAll && expandLevel <= 0) return [...defaults];
    for (const node of this.index().nodes) {
      if (node.leaf) continue;
      if (expandAll || node.level < expandLevel) defaults.add(node.value);
    }
    return [...defaults];
  }

  private lineClasses(node: TreeNode, iconVisible: boolean): string {
    const classes = ['t-tree__line'];
    if (node.leaf || !iconVisible) classes.push('t-tree__line--leaf');
    if (node.index === 0 && iconVisible) classes.push('t-tree__line--first');
    return classes.join(' ');
  }

  /** 祖先的竖线用负偏移的 box-shadow 画出来，算法对齐上游 `useRenderLine`。 */
  private lineShadow(node: TreeNode): string | null {
    const ancestors = [...node.pathNodes].reverse().slice(1);
    ancestors.pop();
    const shadows: string[] = [];
    ancestors.forEach((ancestor, index) => {
      const siblings = ancestor.parent ? ancestor.parent.children : this.index().roots;
      if (ancestor.index < siblings.length - 1) {
        shadows.push(`calc(-${index + 1} * var(--space)) 0 var(--color)`);
      }
    });
    return shadows.length ? shadows.join(',') : null;
  }

  private isCheckDisabled(node: TreeNode, state: TreeNodeState, disabled: boolean): boolean {
    if (disabled) return true;
    const disableCheck = this.disableCheck();
    if (disableCheck === true) return true;
    if (typeof disableCheck === 'function') {
      return disableCheck(new TreeNodeModel(this.index(), node, state, this.stateOf));
    }
    return false;
  }

  private modelOf(node: TreeNode, override?: Partial<TreeNodeState>): TreeNodeModel {
    const state = { ...(this.stateMap().get(node.value) ?? EMPTY_TREE_NODE_STATE), ...override };
    return new TreeNodeModel(this.index(), node, state, this.stateOf);
  }

  private isActivable(node: TreeNode): boolean {
    return node.activable ?? this.activable();
  }

  private isCheckable(node: TreeNode): boolean {
    return node.checkable ?? this.checkable();
  }

  protected handleRowClick(row: TreeRow, event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const iconClick = !!target?.closest('.t-tree__icon');
    const iconVisible = this.icon();

    let shouldExpand = false;
    if (!row.leaf) {
      if (iconClick && iconVisible) shouldExpand = true;
      else if (!iconClick && this.expandOnClickNode()) shouldExpand = true;
    }

    if (shouldExpand) {
      this.toggleExpand(row, event, iconClick ? 'icon-click' : 'node-click');
      if (iconClick) return;
    }

    if (!iconClick && !row.disabled && this.isActivable(row.node)) {
      this.toggleActive(row, event);
    }

    this.click.emit({ node: row.model, e: event });
  }

  protected handleCheckboxClick(row: TreeRow, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleCheck(row, event);
  }

  private toggleExpand(
    row: TreeRow,
    event?: MouseEvent,
    trigger: TreeExpandTrigger = 'setItem',
  ): void {
    if (row.leaf) return;
    const set = new Set(this.expandedKeys());
    const expanded = !set.has(row.value);

    if (expanded) {
      if (this.expandMutex()) {
        const siblings = row.node.parent ? row.node.parent.children : this.index().roots;
        for (const sibling of siblings) {
          if (sibling.value !== row.value) set.delete(sibling.value);
        }
      }
      set.add(row.value);
      if (this.expandParent()) {
        for (const ancestor of row.node.pathNodes.slice(0, -1)) {
          set.add(ancestor.value);
        }
      }
    } else {
      set.delete(row.value);
    }

    const value = [...set];
    if (this.expanded() === undefined) this.innerExpanded.set(value);
    this.expandedChange.emit(value);
    this.expand.emit({
      value,
      node: row.model,
      e: event,
      trigger,
    });
    if (expanded && row.node.lazy) void this.loadNode(row.node);
  }

  private toggleActive(row: TreeRow, event?: MouseEvent): void {
    const set = new Set(this.activedKeys());
    const actived = !set.has(row.value);
    if (actived) {
      if (!this.activeMultiple()) set.clear();
      set.add(row.value);
    } else {
      set.delete(row.value);
    }

    const value = [...set];
    if (this.actived() === undefined) this.innerActived.set(value);
    this.activedChange.emit(value);
    this.active.emit({
      value,
      node: this.modelOf(row.node, { actived }),
      e: event,
      trigger: event ? 'node-click' : 'setItem',
    });
  }

  private toggleCheck(row: TreeRow, event?: MouseEvent): void {
    if (!this.isCheckable(row.node) || row.checkDisabled) return;

    if (this.checkStrictly()) {
      const set = new Set(this.valueKeys());
      if (set.has(row.value)) set.delete(row.value);
      else set.add(row.value);
      this.commitValue([...set], row.node, event);
      return;
    }

    const leaves = collectCheckableLeaves(row.node);
    const checkedLeaves = new Set(this.checkedLeafSet());
    const allChecked = leaves.length > 0 && leaves.every((leaf) => checkedLeaves.has(leaf.value));
    for (const leaf of leaves) {
      if (allChecked) checkedLeaves.delete(leaf.value);
      else checkedLeaves.add(leaf.value);
    }
    this.commitValue(
      deriveCheckedKeys(this.index(), checkedLeaves, this.valueMode(), this.disabled()),
      row.node,
      event,
    );
  }

  private commitValue(value: TreeValue[], node: TreeNode, event?: MouseEvent): void {
    const keys = [...new Set(value)];
    if (this.value() === undefined) this.innerValue.set(keys);
    this.valueChange.emit(keys);
    this.change.emit({
      value: keys,
      node: this.modelOf(node),
      e: event,
      trigger: event ? 'node-click' : 'setItem',
    });
  }

  private async loadNode(node: TreeNode): Promise<void> {
    const loader = this.load();
    if (!loader || this.attemptedLoads().has(node.value)) return;
    this.attemptedLoads.update((keys) => {
      const next = new Set(keys);
      next.add(node.value);
      return next;
    });
    this.loadingKeys.update((keys) => {
      const next = new Set(keys);
      next.add(node.value);
      return next;
    });

    try {
      const children = await loader(this.modelOf(node, { loading: true }));
      const list = Array.isArray(children) ? children : [];
      this.loadedChildren.update((map) => {
        const next = new Map(map);
        next.set(node.value, list);
        return next;
      });
      if (list.length === 0) {
        const set = new Set(this.expandedKeys());
        set.delete(node.value);
        if (this.expanded() === undefined) this.innerExpanded.set([...set]);
      }
    } catch {
      // 加载失败时保持未加载状态，再次展开不会重复请求（attemptedLoads 已记录）。
    } finally {
      this.loadingKeys.update((keys) => {
        const next = new Set(keys);
        next.delete(node.value);
        return next;
      });
    }
  }

  protected handleScroll(event: Event): void {
    this.scroll.emit({ e: event });
  }

  protected handleKeydown(event: KeyboardEvent): void {
    const rows = this.rows().filter((row) => row.visible);
    if (!rows.length) return;
    const current = rows.findIndex((row) => row.value === this.focusValue());

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusRow(rows, current + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.focusRow(rows, current < 0 ? rows.length - 1 : current - 1);
        return;
      case 'Home':
        event.preventDefault();
        this.focusRow(rows, 0);
        return;
      case 'End':
        event.preventDefault();
        this.focusRow(rows, rows.length - 1);
        return;
      case 'ArrowRight': {
        if (current < 0) return;
        event.preventDefault();
        const row = rows[current];
        if (row.leaf) return;
        if (!row.expanded) {
          this.toggleExpand(row, undefined, 'setItem');
          return;
        }
        this.focusRow(rows, current + 1);
        return;
      }
      case 'ArrowLeft': {
        if (current < 0) return;
        event.preventDefault();
        const row = rows[current];
        if (!row.leaf && row.expanded) {
          this.toggleExpand(row, undefined, 'setItem');
          return;
        }
        if (row.node.parent) {
          const parentIndex = rows.findIndex((item) => item.value === row.node.parent?.value);
          this.focusRow(rows, parentIndex);
        }
        return;
      }
      case 'Enter': {
        if (current < 0) return;
        event.preventDefault();
        const row = rows[current];
        if (!row.leaf) this.toggleExpand(row, undefined, 'setItem');
        else if (this.isActivable(row.node)) this.toggleActive(row);
        return;
      }
      default:
        return;
    }
  }

  private focusRow(rows: readonly TreeRow[], index: number): void {
    if (!rows.length) return;
    const target = rows[Math.max(0, Math.min(index, rows.length - 1))];
    const items = Array.from(
      this.hostRef.nativeElement.querySelectorAll<HTMLElement>('.t-tree__item--visible'),
    );
    const item = items[rows.indexOf(target)];
    if (item) {
      item.focus();
      this.focusValue.set(target.value);
    }
  }

  protected handleRowFocus(row: TreeRow): void {
    this.focusValue.set(row.value);
  }
}
