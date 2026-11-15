import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule, TTooltipModule, type TooltipTheme } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tooltip-theme',
  imports: [TTooltipModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (theme of themes; track theme) {
        <t-tooltip [content]="theme" [theme]="theme">
          <t-button variant="outline">{{ theme }}</t-button>
        </t-tooltip>
      }
    </t-space>
  `,
})
export class DemoTooltipTheme {
  protected readonly themes: TooltipTheme[] = ['default', 'primary', 'success', 'warning', 'danger', 'light'];
}
