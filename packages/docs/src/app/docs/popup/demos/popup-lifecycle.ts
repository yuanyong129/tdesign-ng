import { Component, signal, viewChild } from '@angular/core';
import { TButton, TPopup, type PopupStyleInput, type PopupVisibleChangeEvent, type PopupTrigger } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popup-lifecycle',
  imports: [TPopup, TButton],
  template: `
    <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
      <t-popup #controlled class="lifecycle-controlled" trigger="click" [visible]="visible()" [defaultVisible]="true" [disabled]="disabled()"
        [overlayStyle]="rootStyle()" [overlayInnerStyle]="innerStyle()" [destroyOnClose]="destroy()"
        overlayClassName="lifecycle-popup" [delay]="delay()" [placement]="placement()"
        (visibleChange)="accept($event)" (visibleChangeContext)="record($event)" (overlayClick)="overlayClicks.set(overlayClicks() + 1)"
        (scroll)="scrolls.set(scrolls() + 1)" (scrollToBottom)="bottoms.set(bottoms() + 1)">
        <t-button size="small">受控弹层</t-button>
        <div tPopupContent class="lifecycle-list">
          @for (item of items; track item) { <div style="height:32px">路径 {{ item }}</div> }
          <t-button size="small" variant="outline" type="button" class="lifecycle-inner" (click)="counter.set(counter() + 1)">计数 {{ counter() }}</t-button>
        </div>
      </t-popup>
      <t-popup #defaults class="lifecycle-default" [defaultVisible]="initial()" [trigger]="trigger()" content="仅首次读取 defaultVisible"
        [delay]="delay()" [disabled]="disabled()" overlayClassName="lifecycle-default-popup" (visibleChange)="defaultEvents.set(defaultEvents() + 1)">
        <t-button size="small" variant="outline" type="button" class="default-trigger">默认/非受控</t-button>
      </t-popup>
      <t-popup #focus class="lifecycle-focus" trigger="focus" overlayClassName="lifecycle-focus-popup" destroyOnClose>
        <input class="focus-trigger" aria-label="聚焦打开弹层" placeholder="聚焦后 Tab 进入面板" />
        <div tPopupContent><t-button size="small" variant="outline" class="focus-panel" type="button">面板焦点</t-button></div>
      </t-popup>
      <t-popup #empty class="lifecycle-empty" trigger="click" hideEmptyPopup [content]="emptyContent()" overlayClassName="lifecycle-empty-popup">
        <t-button size="small" variant="outline" type="button">异步空内容</t-button>
      </t-popup>
      @if (temporary()) {
        <t-popup class="lifecycle-temporary" trigger="hover" [delay]="[80,80]" content="销毁清理" defaultVisible overlayClassName="lifecycle-temporary-popup">
          <t-button size="small" variant="outline" type="button">可销毁弹层</t-button>
        </t-popup>
      }
      <t-button size="small" variant="outline" type="button" class="lifecycle-outside">外部焦点</t-button>
    </div>
    <p class="demo-hint">visible {{ visible() }}；提案 {{ proposals() }} 次，来源 {{ source() }}；内容点击 {{ overlayClicks() }} 次，滚动 {{ scrolls() }} 次，到底 {{ bottoms() }} 次。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <t-button size="small" (click)="visible.set(!visible())">程序切换</t-button>
      <t-button size="small" (click)="acceptChanges.set(!acceptChanges())">接收/拒绝提案</t-button>
      <t-button size="small" (click)="disabled.set(!disabled())">切换禁用</t-button>
      <t-button size="small" (click)="destroy.set(!destroy())">切换关闭销毁</t-button>
      <t-button size="small" (click)="defaults.show()">默认实例 show()</t-button>
      <t-button size="small" (click)="defaults.hide()">默认实例 hide()</t-button>
      <t-button size="small" (click)="temporary.set(!temporary())">创建/销毁实例</t-button>
    </div>
  `,
})
export class DemoPopupLifecycle {
  readonly controlled = viewChild.required<TPopup>('controlled');
  readonly defaults = viewChild.required<TPopup>('defaults');
  readonly focus = viewChild.required<TPopup>('focus');
  readonly empty = viewChild.required<TPopup>('empty');
  readonly emptyContent = signal<string | undefined>(undefined);
  readonly visible = signal(false);
  readonly initial = signal(true);
  readonly acceptChanges = signal(true);
  readonly disabled = signal(false);
  readonly destroy = signal(false);
  readonly temporary = signal(false);
  readonly delay = signal<number | number[]>(0);
  readonly trigger = signal<PopupTrigger>('click');
  readonly placement = signal<'top' | 'bottom-left'>('bottom-left');
  readonly rootStyle = signal<PopupStyleInput | undefined>({ 'border-radius': '8px', '--popup-demo': 'ready' });
  readonly innerStyle = signal<PopupStyleInput | undefined>((trigger) => ({ 'min-width.px': Math.max(180, trigger.getBoundingClientRect().width), 'max-height.px': 120, overflow: 'auto' }));
  readonly items = [1,2,3,4,5,6,7,8];
  readonly proposals = signal(0);
  readonly defaultEvents = signal(0);
  readonly overlayClicks = signal(0);
  readonly scrolls = signal(0);
  readonly bottoms = signal(0);
  readonly counter = signal(0);
  readonly source = signal('');
  accept(visible: boolean): void { if (this.acceptChanges()) this.visible.set(visible); }
  record(event: PopupVisibleChangeEvent): void { this.proposals.update((n) => n + 1); this.source.set(event.trigger ?? ''); }
}
