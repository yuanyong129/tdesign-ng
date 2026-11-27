import { Component, signal } from '@angular/core';
import { TStickyTool } from '@tdesign-ng/components';
import type { StickyToolItem } from '@tdesign-ng/components';

@Component({
  selector: 'demo-sticky-tool-popup-props',
  imports: [TStickyTool],
  styles: ['.tool-stage { position: relative; height: 240px; transform: translateZ(0); }'],
  template: `
    <div class="tool-stage">
      <t-sticky-tool [list]="items" [popupProps]="{ trigger: 'hover', showArrow: false,
        delay: [0, 100], overlayClassName: 'sticky-shared-panel', overlayInnerClassName: 'sticky-shared-inner', zIndex: 2100 }"
        (itemClick)="clicks.update(increment)" />
    </div>
    <p>点击次数：{{ clicks() }}；第一项覆盖整组弹层位置与箭头，第二项禁止弹出。</p>
  `,
})
export class DemoStickyToolPopupProps {
  readonly clicks = signal(0);
  readonly increment = (value: number) => value + 1;
  readonly items: StickyToolItem[] = [
    { icon: '★', label: '点击弹出', popup: '自定义弹层', trigger: 'click', popupProps: {
      placement: 'top', showArrow: true, destroyOnClose: true,
      overlayClassName: 'sticky-item-panel', overlayInnerClassName: 'sticky-item-inner',
    } },
    { icon: '×', label: '禁止弹出', popup: '不应显示的弹层', trigger: 'click', popupProps: { disabled: true } },
  ];
}
