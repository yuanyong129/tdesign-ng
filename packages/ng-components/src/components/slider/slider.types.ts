/** 滑块布局方向。 */
export const SLIDER_LAYOUTS = ['horizontal', 'vertical'] as const;
export type SliderLayout = (typeof SLIDER_LAYOUTS)[number];

/** 滑块值：单值或区间（`[start, end]`）。 */
export type SliderValue = number | number[];

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
