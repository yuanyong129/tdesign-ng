/**
 * @zh 树选择的数据项，`children` 为子节点。
 * @en Tree select data item; `children` holds child items.
 */
export type TreeSelectData = Record<string, any>;

/**
 * @zh 树选择的值：默认是数据项的 `value`，`valueType="object"` 时是数据项本身。
 * @en Tree select value: the item `value` by default, or the item itself when `valueType="object"`.
 */
export type TreeSelectValue = string | number | TreeSelectData;

/**
 * @zh 自定义字段名，默认 label / value / children / disabled。
 * @en Custom field names; defaults to label / value / children / disabled.
 */
export interface TreeSelectKeys {
  /** @zh 文案字段名 @en Field name of the label */
  label?: string;
  /** @zh 值字段名 @en Field name of the value */
  value?: string;
  /** @zh 子节点字段名 @en Field name of the children */
  children?: string;
  /** @zh 禁用字段名 @en Field name of the disabled flag */
  disabled?: string;
}

/**
 * @zh 树选择的变化来源。
 * @en Source of a tree select change.
 */
export type TreeSelectChangeTrigger = 'check' | 'clear' | 'uncheck';

/**
 * @zh 树选择的变化事件。
 * @en Tree select change event.
 */
export interface TreeSelectChangeEvent {
  /**
   * @zh 变化后的值，清空时为 undefined（`valueType="value"` 时为 ''）。
   * @en Value after change; undefined when cleared ('' when `valueType="value"`).
   */
  value: TreeSelectValue | undefined;

  /**
   * @zh 触发变化的数据项，清空时为 null。
   * @en The item that triggered the change; null when cleared.
   */
  data: TreeSelectData | null;

  /**
   * @zh 变化来源。
   * @en Source of the change.
   */
  trigger: TreeSelectChangeTrigger;
}

/**
 * @zh 树里的一个节点，由 `data` 展开得到。
 * @en A node in the tree, expanded from `data`.
 */
export interface TreeSelectNode {
  /** @zh 原始数据项 @en The original data item */
  data: TreeSelectData;
  /** @zh 节点值 @en Node value */
  value: string | number;
  /** @zh 节点文案 @en Node label */
  label: string;
  /** @zh 层级，从 0 开始 @en Level, starting from 0 */
  level: number;
  /** @zh 从根到当前节点的数据项路径 @en Data path from the root to this node */
  path: TreeSelectData[];
  /** @zh 从根到当前节点的节点路径（含自身） @en Node path from the root, including itself */
  pathNodes: TreeSelectNode[];
  /** @zh 父节点 @en Parent node */
  parent: TreeSelectNode | null;
  /** @zh 子节点 @en Child nodes */
  children: TreeSelectNode[];
  /** @zh 是否禁用 @en Whether the node is disabled */
  disabled: boolean;
}
