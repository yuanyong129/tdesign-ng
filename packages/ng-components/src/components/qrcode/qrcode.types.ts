/** 二维码纠错级别。 */
export const QR_LEVELS = ['L', 'M', 'Q', 'H'] as const;

/** 二维码纠错级别。 */
export type QRLevel = (typeof QR_LEVELS)[number];

/** 二维码状态。 */
export const QR_STATUSES = ['active', 'expired', 'loading', 'scanned'] as const;

/** 二维码状态。 */
export type QRStatus = (typeof QR_STATUSES)[number];

/** 二维码渲染方式。 */
export const QR_TYPES = ['canvas', 'svg'] as const;

/** 二维码渲染方式。 */
export type QRType = (typeof QR_TYPES)[number];

/** 图标尺寸（宽高相同或分别指定）。 */
export interface QRIconSize {
  width?: number;
  height?: number;
}

/** 状态渲染模板的上下文。 */
export interface QRStatusRenderInfo {
  status: QRStatus;
  onRefresh?: () => void;
}

/** `statusRender` 模板的 `*ngTemplateOutlet` 上下文。 */
export interface QRStatusRenderContext {
  $implicit: QRStatusRenderInfo;
}

/** 静态属性传入的图标尺寸可能是字符串，统一归一化。 */
export function toQRIconSize(value: unknown): number | QRIconSize {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 40 : parsed;
  }
  if (value && typeof value === 'object') {
    return value as QRIconSize;
  }
  return 40;
}
