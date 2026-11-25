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

/** 与 TDesign `ClassName` 同形的类名入参。 */
export type PopupClassNames = string | string[] | Record<string, boolean> | null;

/**
 * 弹层透传选项：组件把上游的 `popupProps` 收敛成这个形状，再交给 `t-popup`。
 *
 * 只收录 `TPopup` 真正实现的字段——`attach` / `overlayStyle` / `overlayInnerStyle` /
 * `popperOptions` / `triggerElement` 暂不支持（`TPopup` 侧仍是 `[D2]` 欠账），
 * 与其收下一个被静默忽略的键，不如让 TypeScript 直接报错。
 *
 * 优先级：调用方显式写的 input **永远** 优先于 `popupProps` 里的同名键
 * （由各组件的 `popupOptions` computed 保证，见 `mergePopupOptions`）。
 */
export interface PopupOptions {
  placement?: PopupPlacement;
  trigger?: PopupTrigger;
  /** 悬浮延时，单位毫秒；传数组表示 [显示延时, 隐藏延时]。 */
  delay?: number | number[];
  disabled?: boolean;
  showArrow?: boolean;
  destroyOnClose?: boolean;
  hideEmptyPopup?: boolean;
  overlayClassName?: PopupClassNames;
  overlayInnerClassName?: PopupClassNames;
  zIndex?: number;
}

/**
 * 合并弹层选项：后面的覆盖前面的，`undefined` 不覆盖。
 *
 * 典型用法是组件里先展开 `popupProps()`，再用自己已解析好的显式输入覆盖：
 * `mergePopupOptions(this.popupProps(), { placement: this.placement() })`。
 */
export function mergePopupOptions(
  ...sources: Array<PopupOptions | undefined | null>
): PopupOptions {
  const result: PopupOptions = {};
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source) as Array<keyof PopupOptions>) {
      const value = source[key];
      if (value !== undefined) {
        (result as Record<string, unknown>)[key] = value;
      }
    }
  }
  return result;
}

/**
 * 合并类名：保留组件自身的语义类（如 `t-popconfirm`），再叠加用户通过
 * `popupProps.overlayClassName` 传入的类名。返回 `null` 表示不设类名。
 */
export function mergePopupClassNames(
  base: PopupClassNames,
  extra: PopupClassNames | undefined,
): PopupClassNames {
  const parts: Array<string | Record<string, boolean>> = [];
  const push = (value: PopupClassNames | undefined) => {
    if (!value) return;
    if (typeof value === 'string') parts.push(...value.split(/\s+/).filter(Boolean));
    else if (Array.isArray(value)) parts.push(...value.filter(Boolean));
    else parts.push(value);
  };
  push(base);
  push(extra);
  return parts.length ? (parts as PopupClassNames) : null;
}

