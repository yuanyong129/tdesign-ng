import type { Content } from '../../_utils/content';
import type { InputOptions } from '../input/input-options';
import type { InputNumberAlign, InputNumberDecimalPlaces, InputNumberFormat, InputNumberSize, InputNumberStatus, InputNumberTheme, InputNumberValue, InputNumberChangeEvent } from '../input-number';
import type { TooltipPlacement, TooltipTheme } from '../tooltip';

/** 滑块布局方向。 */
export const SLIDER_LAYOUTS = ['horizontal', 'vertical'] as const;
export type SliderLayout = (typeof SLIDER_LAYOUTS)[number];

/** 滑块值：单值或区间（`[start, end]`）。 */
export type SliderValue = number | number[];

/** 数字编辑器支持的配置；数值、范围和步长由 Slider 管理。 */
export interface SliderInputNumberProps {
  align?: InputNumberAlign;
  autoWidth?: boolean;
  autofocus?: boolean;
  decimalPlaces?: InputNumberDecimalPlaces;
  disabled?: boolean;
  readonly?: boolean;
  format?: InputNumberFormat;
  inputProps?: InputOptions;
  label?: Content;
  suffix?: Content;
  tips?: Content;
  placeholder?: string;
  size?: InputNumberSize;
  status?: InputNumberStatus;
  theme?: InputNumberTheme;
  onChange?: (value: InputNumberValue | undefined, context: Omit<InputNumberChangeEvent, 'value'>) => void;
}

/** 提示配置；显示状态由滑块交互管理，显式 label 优先。 */
export interface SliderTooltipProps {
  content?: string;
  placement?: TooltipPlacement;
  theme?: TooltipTheme;
  showArrow?: boolean;
  delay?: number;
  duration?: number;
  disabled?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
}

/** 刻度标记：数字数组或 `{ 数值: 文案 }` 对象。 */
export type SliderMarks = number[] | Record<number, string>;

/** 归一化后的刻度标记。 */
export interface SliderMark {
  /** 刻度对应的数值。 */
  point: number;
  /** 相对轨道的百分比位置（0–100）。 */
  position: number;
  /** 刻度文案。 */
  label: string;
}
