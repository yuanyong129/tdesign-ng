import type { TreeNodeModel } from './tree-model';

export type { TreeNodeModel } from './tree-model';

/**
 * @zh 树节点的值。
 * @en Value of a tree node.
 */
export type TreeValue = string | number;

/**
 * @zh 树形数据的字段名映射，默认 value / label / children / disabled。
 * @en Field name mapping of tree data; defaults to value / label / children / disabled.
 */
export interface TreeKeys {
  /** @zh 值字段名 @en Field name of the value */
  value?: string;
  /** @zh 文案字段名 @en Field name of the label */
  label?: string;
  /** @zh 子节点字段名 @en Field name of the children */
  children?: string;
  /** @zh 禁用字段名 @en Field name of the disabled flag */
  disabled?: string;
}

/**
 * @zh 树形数据项。`children` 为数组时是已加载的子节点，为 `true` 时表示懒加载待取回
 * （展开时调用 `load`），缺省时是叶子节点。
 * @en A tree data item. `children` as an array holds loaded children, `true` marks a lazy
 * node whose children are fetched by `load` on expand, and an absent value means a leaf.
 */
export interface TreeOption {
  /** @zh 节点值，缺省时组件自动生成一个 @en Node value; generated automatically when absent */
  value?: TreeValue;
  /** @zh 节点文案 @en Node label */
  label?: string;
  /** @zh 子节点；`true` 表示懒加载 @en Children; `true` means lazy load */
  children?: TreeOption[] | boolean;
  /** @zh 是否禁用 @en Whether the node is disabled */
  disabled?: boolean;
  /** @zh 节点级可勾选设置，覆盖组件级 `checkable` @en Per-node checkable override */
  checkable?: boolean;
  /** @zh 节点级可激活设置，覆盖组件级 `activable` @en Per-node activable override */
  activable?: boolean;
  /** @zh 其它业务字段 @en Any other business fields */
  [key: string]: unknown;
}

/** @zh 取值模式：onlyLeaf 只回传叶子，parentFirst 父级全选时回传父级，all 父子都回传 @en Value mode */
export const TREE_VALUE_MODES = ['onlyLeaf', 'parentFirst', 'all'] as const;

/** @zh 勾选值的回传模式 @en Mode of the checked values */
export type TreeValueMode = (typeof TREE_VALUE_MODES)[number];

/** @zh 树尺寸 @en Tree size */
export const TREE_SIZES = ['small', 'medium', 'large'] as const;

/** @zh 树尺寸 @en Tree size */
export type TreeSize = (typeof TREE_SIZES)[number];

/** @zh 展开动作的来源 @en Source of an expand action */
export type TreeExpandTrigger = 'node-click' | 'icon-click' | 'setItem';

/** @zh 勾选 / 激活动作的来源 @en Source of a check or active action */
export type TreeChangeTrigger = 'node-click' | 'setItem';

/**
 * @zh 展开事件。
 * @en Expand event.
 */
export interface TreeExpandEvent {
  /** @zh 变化后的展开值 @en Expanded values after the change */
  value: TreeValue[];
  /** @zh 触发事件的节点 @en The node that triggered the event */
  node: TreeNodeModel;
  /** @zh 原始鼠标事件，键盘或受控调用时为空 @en Original mouse event; empty for keyboard or controlled calls */
  e?: MouseEvent;
  /** @zh 触发来源 @en Source of the action */
  trigger: TreeExpandTrigger;
}

/**
 * @zh 勾选事件。
 * @en Check event.
 */
export interface TreeChangeEvent {
  /** @zh 变化后的勾选值 @en Checked values after the change */
  value: TreeValue[];
  /** @zh 触发事件的节点 @en The node that triggered the event */
  node: TreeNodeModel;
  /** @zh 原始鼠标事件 @en Original mouse event */
  e?: MouseEvent;
  /** @zh 触发来源 @en Source of the action */
  trigger: TreeChangeTrigger;
}

/**
 * @zh 激活（选中行）事件。
 * @en Active event.
 */
export interface TreeActiveEvent {
  /** @zh 变化后的激活值 @en Active values after the change */
  value: TreeValue[];
  /** @zh 触发事件的节点 @en The node that triggered the event */
  node: TreeNodeModel;
  /** @zh 原始鼠标事件 @en Original mouse event */
  e?: MouseEvent;
  /** @zh 触发来源 @en Source of the action */
  trigger: TreeChangeTrigger;
}

/**
 * @zh 节点点击事件。
 * @en Node click event.
 */
export interface TreeClickEvent {
  /** @zh 被点击的节点 @en The clicked node */
  node: TreeNodeModel;
  /** @zh 原始鼠标事件 @en Original mouse event */
  e: MouseEvent;
}

/**
 * @zh 懒加载事件，`load` 回调返回子节点后触发。
 * @en Lazy load event, emitted after the `load` callback resolves its children.
 */
export interface TreeLoadEvent {
  /** @zh 被加载的节点 @en The loaded node */
  node: TreeNodeModel;
  /** @zh 回填的子节点 @en Children returned by the callback */
  data?: TreeOption[];
}

/**
 * @zh 滚动事件。
 * @en Scroll event.
 */
export interface TreeScrollEvent {
  /** @zh 原始滚动事件 @en Original scroll event */
  e: Event;
}
