export type FeedbackAttachNode = string | HTMLElement | null | undefined | (() => string | HTMLElement | null | undefined);
/** CSS property names may use camelCase, kebab-case or custom properties. Lengths need CSS units. */
export type FeedbackStyle = Record<string, string | number | null | undefined>;

interface FeedbackContainer {
  target: HTMLElement;
  key: string;
  element: HTMLElement;
  references: number;
}

/** Containers belong to one service, and leases release the exact record they acquired. */
export class FeedbackContainers {
  private readonly records = new Set<FeedbackContainer>();

  constructor(private readonly document: Document, private readonly kind: 'message' | 'notification') {}

  acquire(attach: FeedbackAttachNode, placement: string, zIndex: number, position: Record<string, string>) {
    const target = this.resolve(attach);
    const key = JSON.stringify([placement, zIndex, position]);
    let record = [...this.records].find(item => item.target === target && item.key === key
      && item.element.parentElement === target && item.element.isConnected);
    if (!record) {
      const element = this.document.createElement('div');
      element.className = this.kind === 'message' ? 't-message__list' : `t-notification__show--${placement}`;
      element.dataset['placement'] = placement;
      element.dataset['tFeedbackContainer'] = this.kind;
      Object.assign(element.style, position);
      element.style.zIndex = String(zIndex);
      if (placement.startsWith('bottom')) {
        element.style.display = 'flex';
        element.style.flexDirection = 'column-reverse';
      }
      target.appendChild(element);
      record = { target, key, element, references: 0 };
      this.records.add(record);
    }
    record.references++;
    const acquired = record;
    let released = false;
    return { element: record.element, release: () => {
      if (released) return;
      released = true;
      if (--acquired.references !== 0) return;
      acquired.element.remove();
      this.records.delete(acquired);
    } };
  }

  private resolve(attach: FeedbackAttachNode): HTMLElement {
    try {
      const value = typeof attach === 'function' ? attach() : attach;
      const target = typeof value === 'string' ? this.document.querySelector<HTMLElement>(value) : value;
      if (target?.nodeType === 1 && target.isConnected && target.ownerDocument === this.document
        && target !== this.document.documentElement && !target.closest('[data-t-feedback-container]')) return target;
    } catch { /* Invalid selectors or resolvers fall back to body. */ }
    return this.document.body;
  }
}

export function applyFeedbackStyle(element: HTMLElement, style: FeedbackStyle | string | undefined): void {
  if (typeof style === 'string') { element.style.cssText = style; return; }
  for (const [property, value] of Object.entries(style ?? {})) {
    if (value === null || value === undefined || typeof value === 'number' && !Number.isFinite(value)) continue;
    const name = property.startsWith('--') ? property : property.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
    element.style.setProperty(name, String(value));
  }
}
