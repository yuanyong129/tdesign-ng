import { TreeSelectData, TreeSelectKeys, TreeSelectNode } from './tree-select.types';

/** 默认字段名。 */
export const TREE_SELECT_DEFAULT_KEYS: Required<TreeSelectKeys> = {
  label: 'label',
  value: 'value',
  children: 'children',
  disabled: 'disabled',
};

/** `data` 展开后的树，节点对象保持稳定，便于用引用判断选中与展开。 */
export interface TreeSelectTree {
  roots: TreeSelectNode[];
  nodes: TreeSelectNode[];
  byValue: Map<string | number, TreeSelectNode>;
  byData: Map<TreeSelectData, TreeSelectNode>;
}

/**
 * 把树选择的数据展开成带父路径的节点树。
 * Angular 侧没有 Vue 的 TreeStore，展开、选中、回显都基于这份索引计算。
 */
export function buildTreeSelectTree(
  data: TreeSelectData[],
  keys: Required<TreeSelectKeys>,
): TreeSelectTree {
  const nodes: TreeSelectNode[] = [];
  const byValue = new Map<string | number, TreeSelectNode>();
  const byData = new Map<TreeSelectData, TreeSelectNode>();

  const walk = (
    items: TreeSelectData[],
    parent: TreeSelectNode | null,
    level: number,
    parentPath: TreeSelectData[],
    parentPathNodes: TreeSelectNode[],
  ): TreeSelectNode[] =>
    items.map((item) => {
      const value = item[keys.value] as string | number;
      const node: TreeSelectNode = {
        data: item,
        value,
        label: String(item[keys.label] ?? ''),
        level,
        path: [...parentPath, item],
        pathNodes: [],
        parent,
        children: [],
        disabled: item[keys.disabled] === true,
      };
      node.pathNodes = [...parentPathNodes, node];
      nodes.push(node);
      byValue.set(value, node);
      byData.set(item, node);

      const children = item[keys.children] as TreeSelectData[] | undefined;
      node.children = children?.length ? walk(children, node, level + 1, node.path, node.pathNodes) : [];
      return node;
    });

  const roots = walk(data, null, 0, [], []);
  return { roots, nodes, byValue, byData };
}
