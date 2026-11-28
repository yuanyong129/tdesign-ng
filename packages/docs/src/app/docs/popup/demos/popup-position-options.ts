import { Component, signal, viewChild } from '@angular/core';
import { TPopup, TButton, type PopupPopperOptions, type PopupPlacement } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popup-position-options',
  imports: [TPopup, TButton],
  template: `
    <div style="min-height:100px;display:flex;align-items:center;justify-content:center">
      <t-popup #popup class="position-options-popup" [placement]="placement()" [popperOptions]="options()" trigger="click"
        overlayClassName="position-options-panel" [overlayInnerStyle]="{ width: '180px' }" [showArrow]="false">
        <button type="button" class="position-options-trigger">定位配置触发器</button>
        <div tPopupContent><button type="button" class="position-options-counter" (click)="count.set(count() + 1)">保留原计数 {{ count() }}</button></div>
      </t-popup>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <t-button size="small" (click)="useOffset()">偏移 [20, 12]</t-button>
      <t-button size="small" (click)="useFlip()">允许翻转</t-button>
      <t-button size="small" (click)="useOverflow()">关闭翻转并保护视口</t-button>
      <t-button size="small" (click)="options.set(undefined)">恢复默认</t-button>
      <t-button size="small" (click)="popup.update()">更新定位</t-button>
    </div>
    <p class="demo-hint">移动浏览器窗口或滚动到边缘后观察方向和边距；配置变化保留原浮层与计数。</p>
  `,
})
export class DemoPopupPositionOptions {
  readonly popup = viewChild.required<TPopup>('popup');
  readonly placement = signal<PopupPlacement>('bottom-left');
  readonly count = signal(0);
  readonly options = signal<PopupPopperOptions | undefined>({ modifiers: [{ name: 'offset', options: { offset: [20, 12] } }] });
  useOffset(): void { this.options.set({ modifiers: [{ name: 'offset', options: { offset: [20, 12] } }] }); }
  useFlip(): void { this.options.set({ placement: 'bottom-start', modifiers: [{ name: 'flip', options: { fallbackPlacements: ['top-start', 'right-start'] } }] }); }
  useOverflow(): void { this.options.set({ modifiers: [{ name: 'flip', enabled: false }, { name: 'preventOverflow', options: { padding: 16 } }] }); }
}
