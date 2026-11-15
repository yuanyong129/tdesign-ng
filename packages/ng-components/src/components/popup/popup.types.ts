/** 弹窗位置，与 TDesign 的 `placement` 取值一致。 */
export const POPUP_PLACEMENTS = [
  'top',
  'left',
  'right',
  'bottom',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'left-top',
  'left-bottom',
  'right-top',
  'right-bottom',
] as const;

export type PopupPlacement = (typeof POPUP_PLACEMENTS)[number];

/** 触发方式。 */
export const POPUP_TRIGGERS = ['hover', 'click', 'focus', 'mousedown', 'context-menu'] as const;

export type PopupTrigger = (typeof POPUP_TRIGGERS)[number];

/** 面板展开状态变化时携带的上下文。 */
export interface PopupVisibleChangeContext {
  /** 触发这次变化的事件 */
  e?: MouseEvent | FocusEvent | KeyboardEvent;
  /** 触发来源 */
  trigger?: string;
}

/**
 * 把 TDesign 的 placement 映射成 popper 的 placement。
 * TDesign 用 `top-left` / `bottom-right` 这种写法，popper（以及上游 less）用 `top-start` / `bottom-end`。
 */
export function toPopperPlacement(placement: PopupPlacement): string {
  const vertical = placement.startsWith('top') || placement.startsWith('bottom');
  const [side, align] = placement.split('-');

  if (!align) return side;

  if (align === 'left' || align === 'top') return `${side}-start`;
  if (align === 'right' || align === 'bottom') return `${side}-end`;
  return side;
}

/** 垂直方向翻转（top ↔ bottom）。 */
export function flipPlacement(placement: PopupPlacement): PopupPlacement {
  const [side, align] = placement.split('-');
  const opposite: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  const next = opposite[side] ?? side;
  return (align ? `${next}-${align}` : next) as PopupPlacement;
}
