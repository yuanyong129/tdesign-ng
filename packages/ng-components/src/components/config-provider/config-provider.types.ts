/**
 * 二维码文案配置。
 *
 * 对应上游 `GlobalConfigProvider.qrcode`。
 */
export interface TQrCodeConfig {
  /** 过期状态文案。 */
  expiredText?: string;
  /** 刷新按钮文案。 */
  refreshText?: string;
  /** 已扫描状态文案。 */
  scannedText?: string;
}

/**
 * 全局配置。
 *
 * 上游 `GlobalConfigProvider` 覆盖 40 余个组件，这里先收口「当前有组件真正消费」的键，
 * 其余键保留 `[key: string]: unknown` 透传，待深度期逐个组件接入（见 roadmap D0/D3）。
 */
export interface TGlobalConfig {
  /** 二维码文案。 */
  qrcode?: TQrCodeConfig;
  /** 其余上游配置项，深度期逐个接入。 */
  [key: string]: unknown;
}
