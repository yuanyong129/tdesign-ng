import { TemplateRef } from '@angular/core';

/** 描述列表的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type DescriptionsContent = string | TemplateRef<unknown> | undefined;

/** 描述列表标签、内容单元格的内联样式，与上游 `Styles` 对齐，支持字符串或样式对象。 */
export type DescriptionsStyles = Record<string, string | number> | string | undefined;

/** 描述列表尺寸。 */
export const DESCRIPTIONS_SIZES = ['small', 'medium', 'large'] as const;
export type DescriptionsSize = (typeof DESCRIPTIONS_SIZES)[number];

/** 描述列表整体布局方向：`horizontal` 时按 `column` 分列平铺，`vertical` 时每项独占一行。 */
export const DESCRIPTIONS_LAYOUTS = ['horizontal', 'vertical'] as const;
export type DescriptionsLayout = (typeof DESCRIPTIONS_LAYOUTS)[number];

/** 描述列表项的标签与内容排列方向。 */
export const DESCRIPTIONS_ITEM_LAYOUTS = ['horizontal', 'vertical'] as const;
export type DescriptionsItemLayout = (typeof DESCRIPTIONS_ITEM_LAYOUTS)[number];

/** 表格布局方式，`fixed` 时列宽平均分配。 */
export const DESCRIPTIONS_TABLE_LAYOUTS = ['fixed', 'auto'] as const;
export type DescriptionsTableLayout = (typeof DESCRIPTIONS_TABLE_LAYOUTS)[number];

/** `items` 数组写法里的一项，与 `t-descriptions-item` 的输入一一对应。 */
export interface DescriptionItem {
  /** 标签。 */
  label?: DescriptionsContent;
  /** 内容。 */
  content?: DescriptionsContent;
  /** 占用的列数。 */
  span?: number;
}
