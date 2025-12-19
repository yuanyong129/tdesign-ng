/**
 * 通用类型定义
 */

// 尺寸类型
export type SizeType = 'small' | 'medium' | 'large';

// 状态类型
export type StatusType = 'success' | 'warning' | 'danger' | 'info';

// 对齐方式
export type AlignType = 'left' | 'center' | 'right';

// 方向类型
export type DirectionType = 'horizontal' | 'vertical';

// 位置类型
export type PositionType = 'top' | 'bottom' | 'left' | 'right';

// 颜色类型
export type ColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default';

// 组件通用属性
export interface ComponentCommonProps {
  className?: string;
  style?: Record<string, any>;
  disabled?: boolean;
}

// 鼠标事件类型
export type MouseEventHandler<T = Element> = (event: MouseEvent & { target: T }) => void;

export type KeyboardEventHandler<T = Element> = (event: KeyboardEvent & { target: T }) => void;

export type FocusEventHandler<T = Element> = (event: FocusEvent & { target: T }) => void;
