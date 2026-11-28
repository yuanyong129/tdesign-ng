import type { PopupAttachNode } from './popup.types';

/** 每个 Popup 只移动自己的 CDK host，绝不移动全局共享 OverlayContainer。 */
export class PopupAttachment {
  private container: HTMLElement | null = null;
  private originalParent: Node | null = null;
  constructor(private readonly document: Document) {}

  mount(host: HTMLElement, attach: PopupAttachNode): void {
    const focused = this.document.activeElement as HTMLElement | null;
    const restoreFocus = () => { if (focused && host.contains(focused) && focused.isConnected && this.document.activeElement !== focused) focused.focus({ preventScroll: true }); };
    this.originalParent ??= host.parentNode;
    const value = typeof attach === 'function' ? attach() : attach;
    let target: HTMLElement | null = null;
    if (typeof value === 'string') {
      try { target = this.document.querySelector<HTMLElement>(value); } catch { /* invalid selector falls back */ }
    } else if (value?.nodeType === 1) target = value;
    if (!target?.isConnected || target.ownerDocument !== this.document || host.contains(target) || target === this.container) target = null;
    if (!target || target === this.document.body || target === this.document.documentElement) {
      if (this.originalParent && host.parentNode !== this.originalParent) this.originalParent.appendChild(host);
      this.container?.remove(); this.container = null;
      restoreFocus();
      return;
    }
    if (!this.container) {
      this.container = this.document.createElement('div');
      this.container.className = 'cdk-overlay-container';
      this.container.setAttribute('data-t-popup-attachment', '');
      Object.assign(this.container.style, { position: 'fixed', left: '0', top: '0', right: 'auto', bottom: 'auto', pointerEvents: 'none', transformOrigin: '0 0' });
    }
    if (this.container.parentElement !== target) target.appendChild(this.container);
    if (host.parentElement !== this.container) this.container.appendChild(host);
    this.update();
    restoreFocus();
  }

  /** CDK 输出视口坐标；抵消挂载祖先的平移和正向轴对齐缩放，避免坐标偏移。 */
  update(): void {
    const container = this.container, view = this.document.defaultView;
    if (!container || !view) return;
    container.style.width = `${this.document.documentElement.clientWidth}px`;
    container.style.height = `${this.document.documentElement.clientHeight}px`;
    container.style.transform = 'none';
    const rect = container.getBoundingClientRect();
    const scaleX = rect.width / container.offsetWidth || 1;
    const scaleY = rect.height / container.offsetHeight || 1;
    container.style.transform = `matrix(${1 / scaleX},0,0,${1 / scaleY},${-rect.left / scaleX},${-rect.top / scaleY})`;
  }

  destroy(): void { this.container?.remove(); this.container = null; this.originalParent = null; }
}
