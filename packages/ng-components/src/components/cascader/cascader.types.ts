/**
 * @zh 级联选项的值类型。
 * @en Value type of a cascader option.
 */
export type CascaderItemValue = string | number;

/**
 * @zh 级联选择的值：单选为一个值，多选为值数组。
 * @en Cascader value: a single value in single mode, an array in multiple mode.
 */
export type CascaderValue = CascaderItemValue | CascaderItemValue[];

/**
 * @zh 级联选项。
 * @en Cascader option.
 */
export interface CascaderOption {
  /**
   * @zh 选项文案。
   * @en Option label.
   */
  label?: string;

  /**
   * @zh 选项值。
   * @en Option value.
   */
  value?: CascaderItemValue;

  /**
   * @zh 子选项，存在时该选项为父节点。
   * @en Child options; the option becomes a parent when present.
   */
  children?: CascaderOption[];

  /**
   * @zh 是否禁用该选项。
   * @en Whether the option is disabled.
   */
  disabled?: boolean;

  /**
   * @zh 自定义字段（配合 `keys` 使用）。
   * @en Custom fields used together with `keys`.
   */
  [field: string]: unknown;
}

/**
 * @zh 自定义字段名，默认 label / value / children。
 * @en Custom field names; defaults to label / value / children.
 */
export interface CascaderKeys {
  label?: string;
  value?: string;
  children?: string;
}

/**
 * @zh 级联选择的变化来源。
 * @en Source of a cascader change.
 */
export type CascaderChangeSource = 'check' | 'clear' | 'uncheck';

/**
 * @zh 多选时的取值模式。
 * - `onlyLeaf`：只包含叶子节点
 * - `parentFirst`：父节点全选时取父节点，否则取叶子节点
 * - `all`：父节点与子节点都包含
 * @en Value mode for multiple selection.
 */
export type CascaderValueMode = 'onlyLeaf' | 'parentFirst' | 'all';

/**
 * @zh 级联树里的一个节点，由 `options` 展开得到。
 * @en A node in the cascader tree, expanded from `options`.
 */
export interface CascaderNode {
  /**
   * @zh 原始选项。
   * @en The original option.
   */
  option: CascaderOption;

  /**
   * @zh 节点值。
   * @en Node value.
   */
  value: CascaderItemValue;

  /**
   * @zh 节点文案。
   * @en Node label.
   */
  label: string;

  /**
   * @zh 层级，从 0 开始。
   * @en Level, starting from 0.
   */
  level: number;

  /**
   * @zh 从根到当前节点的路径。
   * @en Path from the root to this node.
   */
  path: CascaderOption[];

  /**
   * @zh 从根到当前节点的节点路径（含自身）。
   * @en Node path from the root to this node, including itself.
   */
  pathNodes: CascaderNode[];

  /**
   * @zh 父节点。
   * @en Parent node.
   */
  parent: CascaderNode | null;

  /**
   * @zh 子节点。
   * @en Child nodes.
   */
  children: CascaderNode[];
}

/**
 * @zh 级联选择变化事件。
 * @en Cascader change event.
 */
export interface CascaderChangeEvent {
  /**
   * @zh 变化后的值，清空时单选为 undefined、多选为 []。
   * @en Value after change; undefined for single and [] for multiple when cleared.
   */
  value: CascaderValue | undefined;

  /**
   * @zh 变化来源。
   * @en Source of the change.
   */
  source: CascaderChangeSource;

  /**
   * @zh 触发变化的选项（清空时为空）。
   * @en Option that triggered the change (empty when cleared).
   */
  option?: CascaderOption;
}

/**
 * @zh 级联面板的一列。
 * @en One column of the cascader panel.
 */
export interface CascaderMenu {
  /**
   * @zh 该列的节点。
   * @en Nodes of the column.
   */
  nodes: CascaderNode[];

  /**
   * @zh 该列对应的层级，从 0 开始。
   * @en Depth of the column, starting from 0.
   */
  level: number;
}
