/** 卡片模式下单个卡片占容器的比例，与上游一致。 */
export const SWIPER_CARD_ITEM_WIDTH = 0.415;

/** 计算卡片模式下某一项的「展开索引」，让首尾相邻项从可视区换边。 */
export function disposeCardIndex(index: number, current: number, length: number): number {
  if (length <= 2) return index;
  if (current === 0 && index === length - 1) return -1;
  if (current === length - 1 && index === 0) return length;
  if (index < current - 1 && current - index >= length / 2) return length + 1;
  if (index > current + 1 && index - current >= length / 2) return -2;
  return index;
}

/** 卡片模式下某一项的横向位移。 */
export function cardTranslateX(
  index: number,
  current: number,
  width: number,
  cardScale: number,
): number {
  const inStage = Math.abs(index - current) <= 1;
  if (inStage) {
    return (width * ((index - current) * (1 - SWIPER_CARD_ITEM_WIDTH * cardScale) - SWIPER_CARD_ITEM_WIDTH + 1)) / 2;
  }
  if (index < current) {
    return (-SWIPER_CARD_ITEM_WIDTH * (1 + cardScale) * width) / 2;
  }
  return ((2 + SWIPER_CARD_ITEM_WIDTH * (cardScale - 1)) * width) / 2;
}

/** 卡片模式下某一项的 z-index。 */
export function cardZIndex(index: number, current: number): number {
  if (index === current) return 2;
  return Math.abs(index - current) <= 1 ? 1 : 0;
}

/** 把索引收敛到 0..length-1。 */
export function normalizeSwiperIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}
