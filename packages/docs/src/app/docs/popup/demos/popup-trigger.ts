import { Component } from '@angular/core';
import { TButtonModule, TPopupModule, TSpaceModule, type PopupTrigger } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popup-trigger',
  imports: [TPopupModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true" align="center">
      @for (item of triggers; track item.value) {
        <t-popup [content]="item.label + ' 触发'" [trigger]="item.value" [placement]="'bottom'">
          <t-button variant="outline">{{ item.label }}</t-button>
        </t-popup>
      }
    </t-space>
  `,
})
export class DemoPopupTrigger {
  protected readonly triggers: { value: PopupTrigger; label: string }[] = [
    { value: 'hover', label: 'hover' },
    { value: 'click', label: 'click' },
    { value: 'focus', label: 'focus' },
    { value: 'mousedown', label: 'mousedown' },
    { value: 'context-menu', label: '右键' },
  ];
}
