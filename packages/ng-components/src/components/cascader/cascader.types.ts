/**
 * @zh 级联选项的值类型。
 * @en Value type of a cascader option.
 */
export type CascaderValue = string | number;

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
  value?: CascaderValue;

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
 * @zh 级联选择变化事件。
 * @en Cascader change event.
 */
export interface CascaderChangeEvent {
  /**
   * @zh 变化后的值，清空时为 undefined。
   * @en Value after change; undefined when cleared.
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
   * @zh 该列的选项。
   * @en Options of the column.
   */
  options: CascaderOption[];

  /**
   * @zh 该列对应的层级，从 0 开始。
   * @en Depth of the column, starting from 0.
   */
  level: number;
}
