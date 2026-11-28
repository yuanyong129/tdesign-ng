import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { PopupPlacement, PopupPopperOptions, PopupPopperPlacement, flipPlacement, toPopperPlacement } from './popup.types';

function fromPopperPlacement(placement: PopupPopperPlacement): PopupPlacement {
  const [side, align] = placement.split('-');
  if (!align) return side as PopupPlacement;
  return `${side}-${side === 'top' || side === 'bottom' ? align === 'start' ? 'left' : 'right' : align === 'start' ? 'top' : 'bottom'}` as PopupPlacement;
}

/**
 * 把 TDesign 的 placement 翻译成 CDK 的锚点组合。
 *
 * TDesign / popper 的语义是「弹层在触发器的哪一侧」：
 * - `top`：弹层在触发器上方 → 面板的下边贴触发器的上边（overlayY: bottom）；
 * - `bottom-start`：弹层在下方且左对齐 → 面板上边贴触发器下边，两者左边对齐。
 */
function connectPosition(placement: PopupPlacement): ConnectedPosition {
  const [side, align] = placement.split('-');
  const position: ConnectedPosition = { originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center' };

  switch (side) {
    case 'top':
      position.originY = 'top';
      position.overlayY = 'bottom';
      break;
    case 'bottom':
      position.originY = 'bottom';
      position.overlayY = 'top';
      break;
    case 'left':
      position.originX = 'start';
      position.overlayX = 'end';
      break;
    case 'right':
      position.originX = 'end';
      position.overlayX = 'start';
      break;
    default:
      break;
  }

  if (side === 'top' || side === 'bottom') {
    if (align === 'left') {
      position.originX = 'start';
      position.overlayX = 'start';
    } else if (align === 'right') {
      position.originX = 'end';
      position.overlayX = 'end';
    }
  } else if (align === 'top') {
    position.originY = 'top';
    position.overlayY = 'top';
  } else if (align === 'bottom') {
    position.originY = 'bottom';
    position.overlayY = 'bottom';
  }

  return position;
}

/** 面板实际贴在触发器哪一侧，转回 popper 的 placement 字符串（含 -start / -end）。 */
function popperPlacementOf(placement: PopupPlacement): string {
  const [side, align] = placement.split('-');
  if (!align) return side;
  return `${side}-${align === 'left' || align === 'top' ? 'start' : 'end'}`;
}

export interface PopupConnector {
  strategy: FlexibleConnectedPositionStrategy;
  initialPlacement: string;
  /** 订阅实际生效的位置；CDK 在空间不足时会自动翻到备用位置。 */
  watch(listener: (popperPlacement: string) => void): void;
}

/**
 * 找到真正有盒子的定位锚点。
 *
 * 触发器的第一个子元素可能是 `display: contents` 的组件宿主（如 `<t-button>`），
 * 它的 `getBoundingClientRect()` 永远是 0，需要继续往下找到真正渲染出来的元素。
 */
export function resolveAnchor(element: HTMLElement): HTMLElement {
  let current: HTMLElement | null = element;
  while (current) {
    const rect = current.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) return current;
    current = current.firstElementChild as HTMLElement | null;
  }
  return element;
}

/**
 * 让弹层跟随触发器定位。
 *
 * 除了首选位置，还会给一个镜像位置作为备用（下方放不下时翻到上方），
 * 并把最终生效的 placement 上报给调用方，用于写 `data-popper-placement`。
 */
export function connectPopup(overlay: Overlay, host: HTMLElement, placement: PopupPlacement, options?: PopupPopperOptions): PopupConnector {
  const modifiers = [...(options?.modifiers ?? [])].reverse();
  // 与 Popper 同名 modifier 覆盖规则一致，最后一个配置生效。
  const offset = modifiers.find((item) => item.name === 'offset');
  const flip = modifiers.find((item) => item.name === 'flip');
  const overflow = modifiers.find((item) => item.name === 'preventOverflow');
  const preferred = options?.placement ? fromPopperPlacement(options.placement) : placement;
  const fallbacks = flip?.enabled === false ? [] : flip?.options?.fallbackPlacements?.map(fromPopperPlacement) ?? [flipPlacement(preferred)];
  const candidates = [...new Set([preferred, ...fallbacks])];
  const finite = (value: number | undefined, fallback = 0) => value !== undefined && Number.isFinite(value) ? value : fallback;
  const [skid, distance] = offset?.enabled === false ? [0, 0] : offset?.options?.offset?.map((value) => finite(value)) ?? [0, 0];
  const pairs = candidates.map((item) => {
    const position = connectPosition(item), side = item.split('-')[0];
    position.offsetX = side === 'left' ? -distance : side === 'right' ? distance : skid;
    position.offsetY = side === 'top' ? -distance : side === 'bottom' ? distance : skid;
    return position;
  });

  const strategy = overlay
    .position()
    .flexibleConnectedTo(host)
    .withPositions(pairs)
    .withPush(!!overflow && overflow.enabled !== false)
    .withViewportMargin(Math.max(0, finite(overflow?.options?.padding, 4)));
  if (options) strategy.withFlexibleDimensions(false);

  return {
    strategy,
    initialPlacement: toPopperPlacement(preferred),
    watch(listener) {
      strategy.positionChanges.subscribe((change) => {
        const index = pairs.findIndex(
          (pair) =>
            pair.originX === change.connectionPair.originX &&
            pair.originY === change.connectionPair.originY &&
            pair.overlayX === change.connectionPair.overlayX &&
            pair.overlayY === change.connectionPair.overlayY,
        );
        listener(popperPlacementOf(candidates[index >= 0 ? index : 0]));
      });
    },
  };
}
