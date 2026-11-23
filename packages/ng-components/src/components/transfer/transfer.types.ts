import type { TemplateRef } from '@angular/core';

/** @zh 穿梭框的值类型 @en The value type of the transfer */
export type TransferValue = string | number;

/**
 * @zh 穿梭框数据项，除 `label`/`value`/`disabled` 外可携带任意业务字段
 * @en A transfer data item; arbitrary business fields are preserved
 */
export interface TransferItem {
  /** @zh 显示文本，缺省时展示 `value` @en Display label, falls back to `value` */
  label?: string;
  /** @zh 唯一值 @en Unique value */
  value: TransferValue;
  /** @zh 是否禁用该项 @en Whether this item is disabled */
  disabled?: boolean;
  [key: string]: any;
}

/** @zh 穿梭框方向，`both` 双向可用 @en Transfer direction, `both` allows both ways */
export type TransferDirection = 'left' | 'right' | 'both';

/** @zh 列表类型，`source` 为左侧源列表 @en List type, `source` is the left list */
export type TransferListType = 'source' | 'target';

/** @zh 右移后的排序策略 @en Sorting strategy after moving to the right */
export type TransferTargetSort = 'original' | 'push' | 'unshift';

/** @zh 按钮语义方向 @en Semantic direction of an operation button */
export type TransferOperationDirection = 'left' | 'right';

/** @zh 按侧区分的配置，传入数组时依次作用于 `[source, target]` @en Per-side option; an array maps to `[source, target]` */
export type TransferSideOption<T> = T | T[];

/** @zh 列表渲染项，内部由 `data` 与选中的值合成 @en Resolved list item built from `data` and the selected values */
export interface TransferListItem {
  /** @zh 原始数据项 @en Original data item */
  data: TransferItem;
  /** @zh 原始数据下标 @en Index inside the original data */
  index: number;
  /** @zh 显示文本 @en Display label */
  label: string;
  /** @zh 唯一值 @en Unique value */
  value: TransferValue;
  /** @zh 是否禁用 @en Whether the item is disabled */
  disabled: boolean;
}

/** @zh 列表插槽上下文 @en Context of a list slot template */
export interface TransferListContext {
  /** @zh 列表类型 @en List type */
  $implicit: TransferListType;
  /** @zh 列表类型 @en List type */
  type: TransferListType;
}

/** @zh 单项插槽上下文 @en Context of an item slot template */
export interface TransferItemContext {
  /** @zh 原始数据项 @en Original data item */
  $implicit: TransferItem;
  /** @zh 原始数据项 @en Original data item */
  data: TransferItem;
  /** @zh 原始数据下标 @en Index inside the original data */
  index: number;
  /** @zh 列表类型 @en List type */
  type: TransferListType;
}

/** @zh 列表区域的模板 @en Template for a list region */
export type TransferListTemplate = TemplateRef<TransferListContext>;

/** @zh 列表区域的内容，支持字符串或模板 @en Content of a list region, string or template */
export type TransferListContent = string | TransferListTemplate;

/** @zh 移动事件，`value`/`source`/`target` 为移动后的状态 @en Move event; `value`/`source`/`target` are post-move states */
export interface TransferChangeEvent {
  /** @zh 移动后的目标值 @en Target values after the move */
  value: TransferValue[];
  /** @zh 本次移动的值 @en Values moved by this action */
  movedKeys: TransferValue[];
  /** @zh 移动后的源列表数据 @en Source data after the move */
  source: TransferItem[];
  /** @zh 移动后的目标列表数据 @en Target data after the move */
  target: TransferItem[];
  /** @zh 与上游 `onChange` 第二个参数对齐 @en Aligned with the second argument of upstream `onChange` */
  data: {
    /** @zh 被移动到的列表 @en The list moved into */
    type: TransferListType;
    /** @zh 本次移动的值 @en Values moved by this action */
    movedValue: TransferValue[];
  };
}

/** @zh 勾选事件 @en Checked change event */
export interface TransferCheckedChangeEvent {
  /** @zh 两侧合并后的勾选值 @en Checked values of both sides */
  checked: TransferValue[];
  /** @zh 左侧勾选值 @en Checked values of the source list */
  sourceChecked: TransferValue[];
  /** @zh 右侧勾选值 @en Checked values of the target list */
  targetChecked: TransferValue[];
  /** @zh 触发变化的列表 @en The list that triggered the change */
  type: TransferListType;
}

/** @zh 搜索事件 @en Search event */
export interface TransferSearchEvent {
  /** @zh 搜索关键词 @en Search query */
  query: string;
  /** @zh 列表类型 @en List type */
  type: TransferListType;
  /** @zh 触发来源，回车或输入 @en Trigger source, enter or typing */
  trigger: 'input' | 'enter';
  /** @zh 原始事件 @en Original event */
  e: Event;
}

/** @zh 滚动事件 @en Scroll event */
export interface TransferScrollEvent {
  /** @zh 原始事件 @en Original event */
  e: Event;
  /** @zh 距离底部的距离 @en Distance to the bottom */
  bottomDistance: number;
  /** @zh 列表类型 @en List type */
  type: TransferListType;
}

/** @zh 自定义过滤函数，返回 `true` 表示保留 @en Custom filter; return `true` to keep the item */
export type TransferFilter = (query: string, item: TransferItem) => boolean;
