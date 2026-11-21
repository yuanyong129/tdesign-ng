import { CascaderKeys, CascaderNode, CascaderOption } from './cascader.types';

/** 默认字段名。 */
export const CASCADER_DEFAULT_KEYS: Required<CascaderKeys> = {
  label: 'label',
  value: 'value',
  children: 'children',
};

/** `options` 展开后的树，节点复用同一个对象，便于用引用做展开 / 选中判断。 */
export interface CascaderTree {
  roots: CascaderNode[];
  nodes: CascaderNode[];
  byValue: Map<string | number, CascaderNode>;
  /** 节点 → 该节点下所有叶子节点（叶子自身返回自己）。 */
  leaves: Map<CascaderNode, CascaderNode[]>;
}

/**
 * 把级联选项展开成带父路径的节点树。
 * Angular 侧没有 Vue 的 TreeStore，选中 / 展开都基于这份索引计算。
 */
export function buildCascaderTree(
  options: CascaderOption[],
  keys: Required<CascaderKeys>,
): CascaderTree {
  const nodes: CascaderNode[] = [];
  const byValue = new Map<string | number, CascaderNode>();
  const leaves = new Map<CascaderNode, CascaderNode[]>();

  const walk = (
    items: CascaderOption[],
    parent: CascaderNode | null,
    level: number,
    parentPath: CascaderOption[],
    parentPathNodes: CascaderNode[],
  ): CascaderNode[] =>
    items.map((option) => {
      const value = option[keys.value] as string | number;
      const node: CascaderNode = {
        option,
        value,
        label: String(option[keys.label] ?? ''),
        level,
        path: [...parentPath, option],
        pathNodes: [],
        parent,
        children: [],
      };
      node.pathNodes = [...parentPathNodes, node];
      nodes.push(node);
      byValue.set(value, node);

      const children = option[keys.children] as CascaderOption[] | undefined;
      node.children = children?.length
        ? walk(children, node, level + 1, node.path, node.pathNodes)
        : [];

      if (node.children.length) {
        leaves.set(node, node.children.flatMap((child) => leaves.get(child) ?? []));
      } else {
        leaves.set(node, [node]);
      }
      return node;
    });

  const roots = walk(options, null, 0, [], []);
  return { roots, nodes, byValue, leaves };
}

/** 回显用完整路径：`广东省 / 深圳市 / 南山区`。 */
export function pathLabel(node: CascaderNode): string {
  return node.pathNodes.map((item) => item.label).join(' / ');
}

/** 搜索列表用完整路径：`广东省/深圳市/南山区`（与上游 filter 的拼接一致）。 */
export function searchLabel(node: CascaderNode): string {
  return node.pathNodes.map((item) => item.label).join('/');
}
