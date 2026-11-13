export const TEXTAREA_STATUSES = ['default', 'success', 'warning', 'error'] as const;
export type TextareaStatus = (typeof TEXTAREA_STATUSES)[number];

export type TextareaValue = string | number;

/** 自动撑高配置：`true` 表示不限制行数。 */
export interface TextareaAutosize {
  /** 最少展示的行数 */
  minRows?: number;
  /** 最多展示的行数，超出后出现滚动条 */
  maxRows?: number;
}

/** 值变化时携带的上下文，字段与上游 `onChange` 的第二个参数对齐。 */
export interface TextareaChangeEvent {
  /** 变化后的值 */
  value: TextareaValue;
  /** 原始事件 */
  event?: Event;
}
