import type { TreeKeys, TreeOption, TreeValue, TreeValueMode } from './tree.types';

/** 默认字段名。 */
export const TREE_DEFAULT_KEYS: Required<TreeKeys> = {
  value: 'value',
  label: 'label',
  children: 'children',
  disabled: 'disabled',
};

/** `data` 展开后的一棵树，节点对象保持稳定，渲染与事件都以它为准。 */
export interface TreeIndex {
  roots: TreeNode[];
  /** 先序展开的全部节点，顺序即渲染顺序。 */
  nodes: TreeNode[];
  byValue: Map<TreeValue, TreeNode>;
  byData: Map<TreeOption, TreeNode>;
  /** 节点 → 该节点下所有叶子（叶子返回自己；未加载的懒节点视为叶子）。 */
  leaves: Map<TreeNode, TreeNode[]>;
}

/** 树节点结构（不含展开、勾选等运行时状态）。 */
export interface TreeNode {
  data: TreeOption;
  value: TreeValue;
  label: string;
  level: number;
  /** 在兄弟节点中的下标。 */
  index: number;
  parent: TreeNode | null;
  children: TreeNode[];
  path: TreeOption[];
  pathNodes: TreeNode[];
  disabled: boolean;
  checkable: boolean | undefined;
  activable: boolean | undefined;
  /** `children === true`：子节点待懒加载。 */
  lazy: boolean;
  leaf: boolean;
}

/** 节点的运行时状态。 */
export interface TreeNodeState {
  expanded: boolean;
  checked: boolean;
  indeterminate: boolean;
  actived: boolean;
  loading: boolean;
  visible: boolean;
}

/** 默认状态，用于找不到节点时兜底。 */
export const EMPTY_TREE_NODE_STATE: TreeNodeState = {
  expanded: false,
  checked: false,
  indeterminate: false,
  actived: false,
  loading: false,
  visible: false,
};

/** 组件根据派生状态新建的节点模型（对齐上游 `TreeNodeModel` 的只读字段）。 */
export class TreeNodeModel {
  readonly data: TreeOption;
  readonly value: TreeValue;
  readonly label: string;
  readonly level: number;
  readonly disabled: boolean;
  readonly expanded: boolean;
  readonly checked: boolean;
  readonly indeterminate: boolean;
  readonly actived: boolean;
  readonly loading: boolean;
  readonly visible: boolean;

  private readonly index: TreeIndex;
  private readonly node: TreeNode;
  private readonly stateOf: (value: TreeValue) => TreeNodeState;

  constructor(
    index: TreeIndex,
    node: TreeNode,
    state: TreeNodeState,
    stateOf: (value: TreeValue) => TreeNodeState,
  ) {
    this.index = index;
    this.node = node;
    this.stateOf = stateOf;
    this.data = node.data;
    this.value = node.value;
    this.label = node.label;
    this.level = node.level;
    this.disabled = node.disabled;
    this.expanded = state.expanded;
    this.checked = state.checked;
    this.indeterminate = state.indeterminate;
    this.actived = state.actived;
    this.loading = state.loading;
    this.visible = state.visible;
  }

  /** 子节点；未加载的懒节点返回 `false`（对齐上游）。 */
  getChildren(deep = false): TreeNodeModel[] | false {
    if (this.node.lazy) return false;
    if (!this.node.children.length) return false;
    const source = deep ? this.walk(this.node).slice(1) : this.node.children;
    return source.map((node) => this.modelOf(node));
  }

  getIndex(): number {
    return this.node.index;
  }

  getLevel(): number {
    return this.node.level;
  }

  getParent(): TreeNodeModel | null {
    return this.node.parent ? this.modelOf(this.node.parent) : null;
  }

  /** 祖先节点，离自己最近的排在前面。 */
  getParents(): TreeNodeModel[] {
    const parents: TreeNodeModel[] = [];
    let current = this.node.parent;
    while (current) {
      parents.push(this.modelOf(current));
      current = current.parent;
    }
    return parents;
  }

  /** 从根到自己的节点路径。 */
  getPath(): TreeNodeModel[] {
    return this.node.pathNodes.map((node) => this.modelOf(node));
  }

  getRoot(): TreeNodeModel | null {
    const root = this.node.pathNodes[0];
    return root ? this.modelOf(root) : null;
  }

  /** 兄弟节点（含自己）。 */
  getSiblings(): TreeNodeModel[] {
    const siblings = this.node.parent ? this.node.parent.children : this.index.roots;
    return siblings.map((node) => this.modelOf(node));
  }

  isFirst(): boolean {
    return this.node.index === 0;
  }

  isLast(): boolean {
    const siblings = this.node.parent ? this.node.parent.children : this.index.roots;
    return this.node.index === siblings.length - 1;
  }

  isLeaf(): boolean {
    return this.node.leaf;
  }

  private modelOf(node: TreeNode): TreeNodeModel {
    return new TreeNodeModel(this.index, node, this.stateOf(node.value), this.stateOf);
  }

  private walk(node: TreeNode): TreeNode[] {
    const result: TreeNode[] = [node];
    for (const child of node.children) {
      result.push(...this.walk(child));
    }
    return result;
  }
}

/**
 * 把树数据展开成带父路径的节点树。
 * `loadedChildren` 保存懒加载回填的子节点，命中后覆盖 `children === true`。
 */
export function buildTree(
  data: readonly TreeOption[],
  keys: Required<TreeKeys>,
  loadedChildren?: ReadonlyMap<TreeValue, TreeOption[]>,
): TreeIndex {
  const nodes: TreeNode[] = [];
  const byValue = new Map<TreeValue, TreeNode>();
  const byData = new Map<TreeOption, TreeNode>();
  const leaves = new Map<TreeNode, TreeNode[]>();
  let generated = 0;

  const walk = (
    items: readonly TreeOption[],
    parent: TreeNode | null,
    level: number,
    parentPath: TreeOption[],
    parentPathNodes: TreeNode[],
  ): TreeNode[] =>
    items.map((item, index) => {
      const rawValue = item[keys.value];
      const value: TreeValue =
        typeof rawValue === 'string' || typeof rawValue === 'number'
          ? rawValue
          : `__td_tree_node_${generated++}`;
      const rawChildren = item[keys.children];
      const loaded = loadedChildren?.get(value);
      const childItems: readonly TreeOption[] = Array.isArray(rawChildren)
        ? rawChildren
        : Array.isArray(loaded)
          ? loaded
          : [];
      const lazy = rawChildren === true && !Array.isArray(loaded);

      const node: TreeNode = {
        data: item,
        value,
        label: String(item[keys.label] ?? ''),
        level,
        index,
        parent,
        children: [],
        path: [...parentPath, item],
        pathNodes: [],
        disabled: item[keys.disabled] === true,
        checkable: typeof item.checkable === 'boolean' ? item.checkable : undefined,
        activable: typeof item.activable === 'boolean' ? item.activable : undefined,
        lazy,
        leaf: false,
      };
      node.pathNodes = [...parentPathNodes, node];
      node.children = walk(childItems, node, level + 1, node.path, node.pathNodes);
      node.leaf = node.children.length === 0 && !lazy;

      nodes.push(node);
      byValue.set(value, node);
      byData.set(item, node);
      leaves.set(
        node,
        node.children.length ? node.children.flatMap((child) => leaves.get(child) ?? []) : [node],
      );
      return node;
    });

  return {
    roots: walk(data, null, 0, [], []),
    nodes,
    byValue,
    byData,
    leaves,
  };
}

/** 节点是否被禁用（数据项的 `disabled` 会向下继承，与上游 `isDisabledState` 一致）。 */
export function isNodeDisabled(node: TreeNode, treeDisabled = false): boolean {
  if (treeDisabled) return true;
  let current: TreeNode | null = node;
  while (current) {
    if (current.disabled) return true;
    current = current.parent;
  }
  return false;
}

/**
 * 收集勾选该节点时需要一起改动的叶子，遇到禁用节点整枝跳过
 * （对齐上游 `spreadChildrenChecked` 的 `isAction` 行为）。
 */
export function collectCheckableLeaves(node: TreeNode): TreeNode[] {
  if (node.disabled) return [];
  if (node.leaf) return [node];
  const result: TreeNode[] = [];
  for (const child of node.children) {
    if (child.disabled) continue;
    result.push(...collectCheckableLeaves(child));
  }
  return result;
}

/** 节点是否处于全选状态：它下面所有叶子都被勾选。 */
export function isNodeChecked(
  node: TreeNode,
  index: TreeIndex,
  checkedLeaves: ReadonlySet<TreeValue>,
): boolean {
  const leaves = index.leaves.get(node) ?? [node];
  return leaves.length > 0 && leaves.every((leaf) => checkedLeaves.has(leaf.value));
}

/**
 * 由叶子勾选集合反推对外的 `value`，规则对齐上游 `TreeStore.getChecked`：
 * `onlyLeaf` 只回传叶子；`parentFirst` 回传「父级未全选」的最高一层；`all` 回传所有勾选节点。
 */
export function deriveCheckedKeys(
  index: TreeIndex,
  checkedLeaves: ReadonlySet<TreeValue>,
  mode: TreeValueMode,
  treeDisabled = false,
): TreeValue[] {
  const keys: TreeValue[] = [];
  for (const node of index.nodes) {
    if (!isNodeChecked(node, index, checkedLeaves)) continue;
    if (mode === 'onlyLeaf') {
      if (node.leaf) keys.push(node.value);
      continue;
    }
    if (mode === 'parentFirst') {
      if (
        isNodeDisabled(node, treeDisabled) ||
        !node.parent ||
        !isNodeChecked(node.parent, index, checkedLeaves)
      ) {
        keys.push(node.value);
      }
      continue;
    }
    keys.push(node.value);
  }
  return keys;
}
