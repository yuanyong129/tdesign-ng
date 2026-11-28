import { InitialRender } from '../../_utils/initial-render';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { TPopup } from '../popup';
import { mergePopupClassNames, type PopupOptions } from '../popup';
import { TTag } from '../tag/tag.component';
import {
  TCascaderPanelBottom,
  TCascaderPanelTop,
  TCascaderValueDisplay,
} from './cascader-content.directives';
import {
  CASCADER_DEFAULT_KEYS,
  buildCascaderTree,
  pathLabel,
  searchLabel,
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
  hostDirectives: [InitialRender],
  standalone: true,
  imports: [NgTemplateOutlet, TPopup, TTag],
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
   * @zh 透传给弹层的选项（`delay` / `zIndex` / `overlayClassName` 等）；`placement` / `trigger` 由组件内部约定。
   * @en Options passed through to the popup layer.
   * @defaultValue undefined
   */
  readonly popupProps = input<PopupOptions | undefined>(undefined);

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
   * @zh 是否可搜索。打开后在输入框里输入关键字，面板切换成扁平的结果列表。
   * @en Whether the options can be searched; typing switches the panel to a flat result list.
   * @defaultValue false
   */
  readonly filterable = input(false, { transform: booleanAttribute });

  /**
   * @zh 自定义搜索函数，签名为 `(keyword, option) => boolean`（只支持同步返回）。
   * @en Custom search predicate `(keyword, option) => boolean` (sync only).
   */
  readonly filter = input<((filterWords: string, option: CascaderOption) => boolean) | undefined>(undefined);

  /**
   * @zh 选中后是否保留搜索关键字。
   * @en Whether the keyword is kept after selecting.
   * @defaultValue true
   */
  readonly reserveKeyword = input(true, { transform: booleanAttribute });

  /**
   * @zh 是否按需加载子节点；配合 `load` 使用，点击没有子节点的选项时触发加载。
   * @en Whether to load children on demand; works with `load` when clicking a childless option.
   * @defaultValue true
   */
  readonly lazy = input(true, { transform: booleanAttribute });

  /**
   * @zh 异步加载子节点，返回子节点数组。
   * @en Loads children asynchronously and returns them.
   */
  readonly load = input<((option: CascaderOption) => Promise<CascaderOption[]>) | undefined>(undefined);

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
  readonly change = output<CascaderChangeEvent>();

  protected readonly open = signal(false);

  /**
   * 弹层选项：`popupProps` 打底，组件自己的 `placement` / `trigger` / `disabled` 覆盖同名键。
   * `overlayClassName` 保留 `t-cascader__popup` 语义类，再叠加用户传入的类名。
   */
  protected readonly popupOptions = computed<PopupOptions>(() => {
    const passthrough = this.popupProps() ?? {};
    return {
      ...passthrough,
      placement: 'bottom-left',
      trigger: 'click',
      disabled: this.disabled(),
      overlayClassName: mergePopupClassNames('t-cascader__popup', passthrough.overlayClassName),
    };
  });
  private readonly innerValue = signal<CascaderValue | undefined>(undefined);
  private readonly expandedValues = signal<CascaderItemValue[]>([]);
  private readonly keyword = signal('');

  /** 懒加载得到的子节点：父节点 value → children。 */
  private readonly loadedChildren = signal<Map<CascaderItemValue, CascaderOption[]>>(new Map());
  private readonly loadingKeys = signal<Set<CascaderItemValue>>(new Set());
  private readonly loadedEmptyKeys = signal<Set<CascaderItemValue>>(new Set());

  private readonly valueDisplayDirectives = contentChildren(TCascaderValueDisplay);
  private readonly panelTopDirectives = contentChildren(TCascaderPanelTop);
  private readonly panelBottomDirectives = contentChildren(TCascaderPanelBottom);

  protected readonly valueDisplayTemplate = computed(
    () => this.valueDisplayDirectives()[0]?.template ?? null,
  );
  protected readonly panelTopTemplate = computed(() => this.panelTopDirectives()[0]?.template ?? null);
  protected readonly panelBottomTemplate = computed(() => this.panelBottomDirectives()[0]?.template ?? null);

  private readonly fieldKeys = computed<Required<CascaderKeys>>(() => ({
    ...CASCADER_DEFAULT_KEYS,
    ...this.keys(),
  }));

  /** 把懒加载拿到的子节点合并回 options，保持 options 本身不可变。 */
  private readonly materializedOptions = computed<CascaderOption[]>(() => {
    const loaded = this.loadedChildren();
    if (!loaded.size) return this.options();
    const keys = this.fieldKeys();

    const clone = (items: CascaderOption[]): CascaderOption[] =>
      items.map((option) => {
        const value = option[keys.value] as CascaderItemValue;
        const inline = option[keys.children] as CascaderOption[] | undefined;
        const extra = loaded.get(value);
        if (!extra && !inline?.length) return option;
        return { ...option, [keys.children]: clone([...(inline ?? []), ...(extra ?? [])]) };
      });

    return clone(this.options());
  });

  /** `options` 展开后的索引，选中 / 展开 / 回显都基于它。 */
  protected readonly tree = computed(() => buildCascaderTree(this.materializedOptions(), this.fieldKeys()));

  protected readonly isFilterable = computed(() => this.filterable() || !!this.filter());

  protected readonly isFiltering = computed(
    () => this.isFilterable() && this.open() && this.keyword().trim().length > 0,
  );

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

  private readonly expandedNodes = computed<CascaderNode[]>(() => {
    const tree = this.tree();
    return this.expandedValues()
      .map((value) => tree.byValue.get(value))
      .filter((node): node is CascaderNode => !!node);
  });

  /** 当前面板的列：第一列是根节点，之后每列是上一列展开项的子节点。 */
  protected readonly menus = computed<CascaderMenu[]>(() => {
    const tree = this.tree();
    const result: CascaderMenu[] = [];
    if (!tree.roots.length) return result;
    result.push({ nodes: tree.roots, level: 0 });

    const path = this.expandedNodes();
    for (let index = 0; index < path.length; index++) {
      const children = path[index].children;
      if (!children.length) break;
      result.push({ nodes: children, level: index + 1 });
    }
    return result;
  });

  /** 搜索命中的节点；父子不关联或 parentFirst 模式下父节点也参与匹配。 */
  protected readonly filteredNodes = computed<CascaderNode[]>(() => {
    if (!this.isFiltering()) return [];
    const keyword = this.keyword().trim();
    const lower = keyword.toLowerCase();
    const filterFn = this.filter();
    const allowParent = this.checkStrictly() || this.valueMode() === 'parentFirst';

    return this.tree().nodes.filter((node) => {
      if (node.children.length && !allowParent) return false;
      if (filterFn) return filterFn(keyword, node.option);
      return searchLabel(node).toLowerCase().includes(lower);
    });
  });

  protected readonly panelClasses = computed(() => {
    const hasContent = this.isFiltering() ? this.filteredNodes().length > 0 : this.menus().length > 0;
    return ['t-cascader__panel', hasContent && !this.loading() ? 't-cascader--normal' : '']
      .filter(Boolean)
      .join(' ');
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
    if (this.selectedTags().length || this.valueDisplayTemplate()) {
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

  /** 单选输入框的显示值：搜索时显示关键字，自定义回显时让出输入框。 */
  protected readonly singleInputValue = computed(() => {
    if (this.isFiltering()) return this.keyword();
    if (this.valueDisplayTemplate() && this.hasValue()) return '';
    return this.displayText();
  });

  protected readonly multipleInputValue = computed(() => (this.isFiltering() ? this.keyword() : ''));

  protected readonly singlePlaceholder = computed(() =>
    this.valueDisplayTemplate() && this.hasValue() && !this.isFiltering() ? '' : this.placeholder(),
  );

  protected readonly multiplePlaceholder = computed(() =>
    this.selectedTags().length && !this.isFiltering() ? '' : this.placeholder(),
  );

  /** 自定义回显模板的上下文。 */
  protected readonly valueDisplayContext = computed<Record<string, unknown>>(() => {
    const value = this.currentValue();
    const tree = this.tree();
    const selectedOptions = this.multipleValues()
      .map((item) => tree.byValue.get(item)?.option)
      .filter((option): option is CascaderOption => !!option);
    return {
      $implicit: value,
      value,
      displayValue: value,
      selectedOptions,
      onClose: (index: number) => this.removeSelectedAt(index),
    };
  });

  protected readonly labelClasses = 't-cascader__item-label t-cascader__item-label--ellipsis';

  protected isExpanded(node: CascaderNode): boolean {
    return this.isNodeExpandable(node) && this.expandedValues().includes(node.value);
  }

  /** 有子节点，或者是 lazy + load 下尚未加载的潜在父节点。 */
  protected isNodeExpandable(node: CascaderNode): boolean {
    if (node.children.length) return true;
    return (
      this.lazy() &&
      !!this.load() &&
      !this.isExplicitLeaf(node.option) &&
      !this.loadedEmptyKeys().has(node.value)
    );
  }

  protected isNodeLoading(node: CascaderNode): boolean {
    return this.loadingKeys().has(node.value);
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
    if (this.isNodeExpandable(node)) {
      classes.push('t-cascader__item--with-icon');
    } else {
      classes.push('t-cascader__item--leaf');
    }

    const expanded = this.isExpanded(node);
    if (expanded) classes.push('t-is-expanded');

    let selected: boolean;
    if (this.multiple()) {
      selected = this.isOptionChecked(node);
    } else if (this.isNodeExpandable(node) && !this.checkStrictly()) {
      // 单选时整条展开路径都高亮
      selected = expanded;
    } else {
      selected = this.isOptionChecked(node);
    }
    if (selected) classes.push('t-is-selected');

    if (this.isOptionDisabled(node)) classes.push('t-is-disabled');
    return classes.join(' ');
  }

  /** 搜索时按关键字把完整路径切成普通片段与高亮片段。 */
  protected labelParts(node: CascaderNode): { text: string; match: boolean }[] {
    const text = this.isFiltering() ? searchLabel(node) : node.label;
    const keyword = this.keyword().trim();
    if (!text || !this.isFiltering() || !keyword) return text ? [{ text, match: false }] : [];

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const parts: { text: string; match: boolean }[] = [];
    let index = 0;
    while (index < text.length) {
      const found = lowerText.indexOf(lowerKeyword, index);
      if (found < 0) {
        parts.push({ text: text.slice(index), match: false });
        break;
      }
      if (found > index) parts.push({ text: text.slice(index, found), match: false });
      parts.push({ text: text.slice(found, found + keyword.length), match: true });
      index = found + keyword.length;
    }
    return parts;
  }

  protected labelTitle(node: CascaderNode): string {
    return this.isFiltering() ? searchLabel(node) : node.label;
  }

  protected handleVisibleChange(visible: boolean): void {
    if (this.disabled()) return;
    this.open.set(visible);
    if (!visible) return;
    if (this.isFilterable()) this.keyword.set('');
    this.expandSelectedOnOpen();
  }

  protected handleInputClick(event: MouseEvent): void {
    if (!this.isFilterable()) return;
    // 阻止 TPopup 的触发器点击把面板关掉，自己控制展开
    event.stopPropagation();
    if (this.disabled()) return;
    if (!this.open()) {
      this.keyword.set('');
      this.open.set(true);
      this.expandSelectedOnOpen();
    }
  }

  protected handleInput(event: Event): void {
    if (!this.isFilterable() || this.disabled()) return;
    this.keyword.set((event.target as HTMLInputElement).value);
    if (!this.open()) {
      this.open.set(true);
      this.expandSelectedOnOpen();
    }
  }

  protected pickOption(node: CascaderNode): void {
    if (this.isOptionDisabled(node)) return;

    // 搜索结果是一条扁平列表，点击即选中 / 勾选，不再展开
    if (this.isFiltering()) {
      if (this.multiple()) {
        this.toggleCheck(node);
        return;
      }
      this.commitSingle(node);
      if (!this.checkStrictly()) this.closeAfterSelect();
      return;
    }

    const hasChildren = node.children.length > 0;

    if (hasChildren) {
      this.expandTo(node);
      if (this.multiple() || !this.checkStrictly()) return;
      this.commitSingle(node);
      return;
    }

    if (this.lazy() && this.load() && !this.isExplicitLeaf(node.option) && !this.loadedEmptyKeys().has(node.value)) {
      void this.loadChildren(node);
      return;
    }

    if (this.multiple()) {
      this.toggleCheck(node);
      return;
    }

    this.commitSingle(node);
    this.closeAfterSelect();
  }

  protected removeTag(tag: { value: CascaderItemValue }, event: MouseEvent): void {
    event.stopPropagation();
    this.removeValue(tag.value);
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

  protected checkboxClasses(node: CascaderNode): string {
    const classes = ['t-checkbox'];
    if (this.isOptionChecked(node)) classes.push('t-is-checked');
    if (this.isOptionIndeterminate(node)) classes.push('t-is-indeterminate');
    if (this.isOptionDisabled(node)) classes.push('t-is-disabled');
    return classes.join(' ');
  }

  protected handleCheckboxClick(node: CascaderNode, event: MouseEvent): void {
    // 勾选态完全由 value 决定：阻止原生 checkbox 切换，避免受控值没更新时视觉与数据不一致
    event.preventDefault();
    event.stopPropagation();
    this.toggleCheck(node);
  }

  private closeAfterSelect(): void {
    this.open.set(false);
    if (!this.reserveKeyword()) this.keyword.set('');
  }

  private expandSelectedOnOpen(): void {
    let node: CascaderNode | undefined;
    if (this.multiple()) {
      node = this.tree().byValue.get(this.multipleValues()[0]);
    } else {
      node = this.selectedNode() ?? undefined;
    }
    this.expandedValues.set(node ? this.pathValuesToShow(node) : []);
  }

  /** 选中父节点时展开它本身，选中叶子时展示它的父级列。 */
  private pathValuesToShow(node: CascaderNode): CascaderItemValue[] {
    const values = node.pathNodes.map((item) => item.value);
    return node.children.length ? values : values.slice(0, Math.max(values.length - 1, 0));
  }

  private expandTo(node: CascaderNode): void {
    this.expandedValues.set(node.pathNodes.map((item) => item.value));
  }

  private async loadChildren(node: CascaderNode): Promise<void> {
    const load = this.load();
    if (!load || this.loadingKeys().has(node.value)) return;

    this.addLoadingKey(node.value);
    try {
      const children = await load(node.option);
      if (!children?.length) {
        // load 返回空数组说明该节点其实是叶子：标记后直接按叶子节点处理，避免要点两次
        this.loadedEmptyKeys.update((set) => new Set(set).add(node.value));
        this.activateLeaf(node);
        return;
      }
      this.loadedChildren.update((map) => {
        const next = new Map(map);
        next.set(node.value, children);
        return next;
      });
      // 树会按新 options 重建，展开状态按 value 记录，重建后依然生效
      this.expandTo(node);
    } finally {
      this.loadingKeys.update((set) => {
        const next = new Set(set);
        next.delete(node.value);
        return next;
      });
    }
  }

  /** 懒加载过程中已知是叶子（option 上标了 isLeaf / leaf）时不触发 load。 */
  private isExplicitLeaf(option: CascaderOption): boolean {
    return option['isLeaf'] === true || option['leaf'] === true;
  }

  private activateLeaf(node: CascaderNode): void {
    if (this.multiple()) {
      this.toggleCheck(node);
      return;
    }
    this.commitSingle(node);
    this.closeAfterSelect();
  }

  private addLoadingKey(value: CascaderItemValue): void {
    this.loadingKeys.update((set) => new Set(set).add(value));
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

  private removeSelectedAt(index: number): void {
    const value = this.multipleValues()[index];
    if (value === undefined) return;
    this.removeValue(value);
  }

  private removeValue(value: CascaderItemValue): void {
    if (this.disabled()) return;

    const node = this.tree().byValue.get(value);
    let next: CascaderItemValue[];

    if (this.checkStrictly() || !node) {
      next = this.multipleValues().filter((item) => item !== value);
    } else {
      const leaves = new Set(this.checkedLeafSet());
      for (const leaf of this.tree().leaves.get(node) ?? []) leaves.delete(leaf.value);
      next = this.deriveValueFromLeaves(leaves);
    }
    this.commitMultiple(next, 'uncheck', node?.option);
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
