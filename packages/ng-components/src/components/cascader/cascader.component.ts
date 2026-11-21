import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { TPopup } from '../popup';
import { TTag } from '../tag/tag.component';
import {
  CASCADER_DEFAULT_KEYS,
  buildCascaderTree,
  pathLabel,
} from './cascader-tree';
import {
  CascaderChangeEvent,
  CascaderChangeSource,
  CascaderItemValue,
  CascaderKeys,
  CascaderMenu,
  CascaderNode,
  CascaderOption,
  CascaderValue,
  CascaderValueMode,
} from './cascader.types';

const SIZE_SUFFIX: Record<'small' | 'medium' | 'large', string> = {
  small: 's',
  medium: 'm',
  large: 'l',
};

/**
 * @zh 级联选择器，用于在树形结构的数据中逐级选择。
 * @en Cascader used to select values level by level from tree data.
 */
@Component({
  selector: 't-cascader',
  standalone: true,
  imports: [TPopup, TTag],
  templateUrl: './cascader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TCascader {
  /**
   * @zh 级联选项数据。
   * @en Cascader options.
   * @defaultValue []
   */
  readonly options = input<CascaderOption[]>([]);

  /**
   * @zh 选中值，受控用法。多选时为值数组。
   * @en Selected value in controlled mode; an array in multiple mode.
   */
  readonly value = input<CascaderValue | undefined>(undefined);

  /**
   * @zh 默认选中值，非受控用法。
   * @en Default selected value in uncontrolled mode.
   */
  readonly defaultValue = input<CascaderValue | undefined>(undefined);

  /**
   * @zh 自定义字段名，默认 label / value / children。
   * @en Custom field names; defaults to label / value / children.
   */
  readonly keys = input<CascaderKeys>({});

  /**
   * @zh 面板展开时是否显示完整路径（父级 / 子级），为 false 时只显示最后一级。
   * @en Whether to show the full path in the input; false shows the last level only.
   * @defaultValue true
   */
  readonly showAllLevels = input(true, { transform: booleanAttribute });

  /**
   * @zh 是否可清空。
   * @en Whether the value can be cleared.
   * @defaultValue false
   */
  readonly clearable = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否禁用。
   * @en Whether the cascader is disabled.
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
   * @zh 无选项时的提示文案。
   * @en Text shown when there are no options.
   * @defaultValue '暂无数据'
   */
  readonly empty = input('暂无数据');

  /**
   * @zh 是否多选。
   * @en Whether multiple selection is allowed.
   * @defaultValue false
   */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * @zh 父子节点是否不关联：为 true 时勾选父节点不再连带子节点。
   * @en Whether parent and child nodes are unlinked while checking.
   * @defaultValue false
   */
  readonly checkStrictly = input(false, { transform: booleanAttribute });

  /**
   * @zh 多选时的取值模式。
   * - `onlyLeaf`：只包含叶子节点；`parentFirst`：父节点全选时取父节点；`all`：父子节点都包含。
   * @en Value mode in multiple mode.
   * @defaultValue 'onlyLeaf'
   * @values onlyLeaf, parentFirst, all
   */
  readonly valueMode = input<CascaderValueMode>('onlyLeaf');

  /**
   * @zh 多选上限，0 表示不限制。
   * @en Maximum number of checked nodes; 0 means unlimited.
   * @defaultValue 0
   */
  readonly max = input(0, { transform: numberAttribute });

  /**
   * @zh 选中值变化时触发。
   * @en Emitted when the selected value changes.
   */
  readonly change = output<CascaderChangeEvent>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<CascaderValue | undefined>(undefined);
  private readonly expandedPath = signal<CascaderNode[]>([]);

  private readonly fieldKeys = computed<Required<CascaderKeys>>(() => ({
    ...CASCADER_DEFAULT_KEYS,
    ...this.keys(),
  }));

  /** `options` 展开后的索引，选中 / 展开 / 回显都基于它。 */
  protected readonly tree = computed(() => buildCascaderTree(this.options(), this.fieldKeys()));

  protected readonly currentValue = computed(
    () => this.value() ?? this.innerValue() ?? this.defaultValue(),
  );

  /** 多选值统一成数组，方便计算勾选态。 */
  protected readonly multipleValues = computed<CascaderItemValue[]>(() => {
    const value = this.currentValue();
    if (Array.isArray(value)) return value;
    return value === undefined || value === null || value === '' ? [] : [value];
  });

  /** 当前单选值对应的节点。 */
  protected readonly selectedNode = computed<CascaderNode | null>(() => {
    if (this.multiple()) return null;
    const value = this.currentValue();
    if (Array.isArray(value) || value === undefined || value === null || value === '') return null;
    return this.tree().byValue.get(value) ?? null;
  });

  protected readonly selectedPath = computed<CascaderNode[]>(() => this.selectedNode()?.pathNodes ?? []);

  protected readonly hasValue = computed(() => {
    if (this.multiple()) return this.multipleValues().length > 0;
    const value = this.currentValue();
    return value !== undefined && value !== null && value !== '' && !Array.isArray(value);
  });

  protected readonly displayText = computed(() => {
    if (this.multiple()) return '';
    const node = this.selectedNode();
    if (node) return this.showAllLevels() ? pathLabel(node) : node.label;
    const value = this.currentValue();
    return value === undefined || value === null || Array.isArray(value) ? '' : String(value);
  });

  /** 多选时输入框里的标签。 */
  protected readonly selectedTags = computed(() => {
    const tree = this.tree();
    return this.multipleValues().map((value) => {
      const node = tree.byValue.get(value);
      return {
        value,
        label: node ? (this.showAllLevels() ? pathLabel(node) : node.label) : String(value),
      };
    });
  });

  /** 多选：当前勾选的节点集合（父子不关联模式）。 */
  private readonly checkedNodeSet = computed(() => new Set(this.multipleValues()));

  /** 多选：当前勾选的叶子节点集合，父子关联模式下由它推导勾选态与值。 */
  private readonly checkedLeafSet = computed(() => {
    const tree = this.tree();
    const set = new Set<CascaderItemValue>();
    for (const value of this.multipleValues()) {
      const node = tree.byValue.get(value);
      if (!node) continue;
      for (const leaf of tree.leaves.get(node) ?? []) set.add(leaf.value);
    }
    return set;
  });

  /** 当前面板的列：第一列是根节点，之后每列是上一列展开项的子节点。 */
  protected readonly menus = computed<CascaderMenu[]>(() => {
    const tree = this.tree();
    const result: CascaderMenu[] = [];
    if (!tree.roots.length) return result;
    result.push({ nodes: tree.roots, level: 0 });

    const path = this.expandedPath();
    for (let index = 0; index < path.length; index++) {
      const children = path[index].children;
      if (!children.length) break;
      result.push({ nodes: children, level: index + 1 });
    }
    return result;
  });

  protected readonly inputClasses = computed(() => {
    const classes = ['t-input', 't-input--prefix', 't-input--suffix'];
    if (this.size() !== 'medium') classes.push(`t-size-${SIZE_SUFFIX[this.size()]}`);
    if (this.open()) classes.push('t-input--focused', 't-is-focused');
    if (this.disabled()) classes.push('t-is-disabled');
    return classes.join(' ');
  });

  protected readonly wrapperClasses = computed(() => {
    const classes = ['t-select-input', 't-cascader', `t-cascader--${this.multiple() ? 'multiple' : 'single'}`];
    if (this.multiple()) classes.push('t-select-input--multiple');
    if (this.open()) classes.push('t-select-input--popup-visible');
    if (!this.hasValue()) classes.push('t-select-input--empty');
    return classes.join(' ');
  });

  protected readonly tagInputClasses = computed(() => {
    const classes = ['t-tag-input'];
    if (this.selectedTags().length) {
      classes.push('t-tag-input--with-tag');
    } else {
      classes.push('t-is-empty');
    }
    return classes.join(' ');
  });

  protected readonly arrowClasses = computed(() => {
    const classes = ['t-fake-arrow', 't-cascader__icon'];
    if (this.open()) classes.push('t-fake-arrow--active');
    if (this.disabled()) classes.push('t-is-disabled');
    return classes.join(' ');
  });

  protected readonly panelClasses = computed(() =>
    ['t-cascader__panel', this.menus().length ? 't-cascader--normal' : ''].filter(Boolean).join(' '),
  );

  protected readonly labelClasses = 't-cascader__item-label t-cascader__item-label--ellipsis';

  protected isExpanded(node: CascaderNode): boolean {
    return node.children.length > 0 && this.expandedPath().includes(node);
  }

  protected isOptionChecked(node: CascaderNode): boolean {
    if (!this.multiple()) {
      return !Array.isArray(this.currentValue()) && this.currentValue() === node.value;
    }
    if (this.checkStrictly()) return this.checkedNodeSet().has(node.value);

    const leaves = this.tree().leaves.get(node) ?? [];
    const set = this.checkedLeafSet();
    return leaves.length > 0 && leaves.every((leaf) => set.has(leaf.value));
  }

  protected isOptionIndeterminate(node: CascaderNode): boolean {
    if (!this.multiple() || this.checkStrictly() || !node.children.length) return false;
    const leaves = this.tree().leaves.get(node) ?? [];
    if (!leaves.length) return false;
    const set = this.checkedLeafSet();
    const checked = leaves.filter((leaf) => set.has(leaf.value)).length;
    return checked > 0 && checked < leaves.length;
  }

  protected isOptionDisabled(node: CascaderNode): boolean {
    if (this.disabled() || node.option.disabled) return true;
    const max = this.max();
    if (!this.multiple() || max <= 0 || this.isOptionChecked(node)) return false;

    if (this.checkStrictly()) return this.multipleValues().length >= max;
    const leaves = this.tree().leaves.get(node) ?? [node];
    const current = this.checkedLeafSet();
    const added = leaves.filter((leaf) => !current.has(leaf.value)).length;
    return current.size + added > max;
  }

  protected itemClasses(node: CascaderNode): string {
    const classes = ['t-cascader__item', `t-size-${SIZE_SUFFIX[this.size()]}`];
    if (node.children.length) {
      classes.push('t-cascader__item--with-icon');
    } else {
      classes.push('t-cascader__item--leaf');
    }

    const expanded = this.isExpanded(node);
    if (expanded) classes.push('t-is-expanded');

    let selected: boolean;
    if (this.multiple()) {
      selected = this.isOptionChecked(node);
    } else if (node.children.length && !this.checkStrictly()) {
      // 单选时整条展开路径都高亮
      selected = expanded;
    } else {
      selected = this.isOptionChecked(node);
    }
    if (selected) classes.push('t-is-selected');

    if (this.isOptionDisabled(node)) classes.push('t-is-disabled');
    return classes.join(' ');
  }

  protected handleVisibleChange(visible: boolean): void {
    if (this.disabled()) return;
    this.open.set(visible);
    if (!visible) return;
    this.expandSelectedOnOpen();
  }

  protected pickOption(node: CascaderNode): void {
    if (this.isOptionDisabled(node)) return;
    const hasChildren = node.children.length > 0;

    if (this.multiple()) {
      // 父节点点击只展开，勾选由复选框负责
      if (hasChildren) this.expandTo(node);
      else this.toggleCheck(node);
      return;
    }

    if (hasChildren) {
      this.expandTo(node);
      if (!this.checkStrictly()) return;
    }

    this.commitSingle(node);
    // checkStrictly 单选时保留面板，方便继续浏览
    if (!this.checkStrictly()) this.open.set(false);
  }

  protected handleCheckboxClick(node: CascaderNode, event: MouseEvent): void {
    // 勾选态完全由 value 决定：阻止原生 checkbox 切换，避免受控值没更新时视觉与数据不一致
    event.preventDefault();
    event.stopPropagation();
    this.toggleCheck(node);
  }

  protected checkboxClasses(node: CascaderNode): string {
    const classes = ['t-checkbox'];
    if (this.isOptionChecked(node)) classes.push('t-is-checked');
    if (this.isOptionIndeterminate(node)) classes.push('t-is-indeterminate');
    if (this.isOptionDisabled(node)) classes.push('t-is-disabled');
    return classes.join(' ');
  }

  protected removeTag(tag: { value: CascaderItemValue }, event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;

    const node = this.tree().byValue.get(tag.value);
    let next: CascaderItemValue[];

    if (this.checkStrictly() || !node) {
      next = this.multipleValues().filter((value) => value !== tag.value);
    } else {
      const leaves = new Set(this.checkedLeafSet());
      for (const leaf of this.tree().leaves.get(node) ?? []) leaves.delete(leaf.value);
      next = this.deriveValueFromLeaves(leaves);
    }
    this.commitMultiple(next, 'uncheck', node?.option);
  }

  protected handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    const value = this.multiple() ? [] : undefined;
    if (this.value() === undefined) this.innerValue.set(value);
    // 与上游一致：清空后收起面板
    this.open.set(false);
    this.change.emit({ value, source: 'clear' });
  }

  private expandSelectedOnOpen(): void {
    if (this.multiple()) {
      const first = this.tree().byValue.get(this.multipleValues()[0]);
      this.expandedPath.set(first ? this.pathToShowChildren(first) : []);
      return;
    }
    const node = this.selectedNode();
    this.expandedPath.set(node ? this.pathToShowChildren(node) : []);
  }

  /** 选中父节点时展开它本身，选中叶子时展示它的父级列。 */
  private pathToShowChildren(node: CascaderNode): CascaderNode[] {
    const path = node.pathNodes;
    return node.children.length ? path : path.slice(0, Math.max(path.length - 1, 0));
  }

  private expandTo(node: CascaderNode): void {
    this.expandedPath.set(node.pathNodes);
  }

  private commitSingle(node: CascaderNode): void {
    if (this.value() === undefined) this.innerValue.set(node.value);
    this.change.emit({ value: node.value, source: 'check', option: node.option });
  }

  private commitMultiple(
    values: CascaderItemValue[],
    source: CascaderChangeSource,
    option?: CascaderOption,
  ): void {
    const next = [...new Set(values)];
    if (this.value() === undefined) this.innerValue.set(next);
    this.change.emit({ value: next, source, option });
  }

  private toggleCheck(node: CascaderNode): void {
    if (this.isOptionDisabled(node)) return;

    const tree = this.tree();

    if (this.checkStrictly()) {
      const set = new Set(this.multipleValues());
      const checked = set.has(node.value);
      if (checked) set.delete(node.value);
      else set.add(node.value);
      this.commitMultiple([...set], checked ? 'uncheck' : 'check', node.option);
      return;
    }

    const leaves = new Set(this.checkedLeafSet());
    const nodeLeaves = tree.leaves.get(node) ?? [node];
    const checked = nodeLeaves.every((leaf) => leaves.has(leaf.value));

    if (!checked) {
      const max = this.max();
      const added = nodeLeaves.filter((leaf) => !leaves.has(leaf.value)).length;
      if (max > 0 && leaves.size + added > max) return;
      for (const leaf of nodeLeaves) leaves.add(leaf.value);
    } else {
      for (const leaf of nodeLeaves) leaves.delete(leaf.value);
    }

    this.commitMultiple(this.deriveValueFromLeaves(leaves), checked ? 'uncheck' : 'check', node.option);
  }

  /** 由叶子勾选集合按 valueMode 推导对外暴露的值。 */
  private deriveValueFromLeaves(leaves: Set<CascaderItemValue>): CascaderItemValue[] {
    const tree = this.tree();
    const mode = this.valueMode();
    const result: CascaderItemValue[] = [];

    const walk = (node: CascaderNode): void => {
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

  private collectSubtree(node: CascaderNode, out: CascaderItemValue[]): void {
    out.push(node.value);
    for (const child of node.children) this.collectSubtree(child, out);
  }
}
