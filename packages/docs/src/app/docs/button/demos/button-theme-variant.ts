import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-theme-variant',
  imports: [TButtonModule, TSpaceModule],
  template: `
    @for (theme of themes; track theme) {
      <t-space [breakLine]="true">
        <t-button variant="base" [theme]="theme">{{ theme }}</t-button>
        <t-button variant="outline" [theme]="theme">{{ theme }}</t-button>
        <t-button variant="dashed" [theme]="theme">{{ theme }}</t-button>
        <t-button variant="text" [theme]="theme">{{ theme }}</t-button>
      </t-space>
    }
  `,
})
export class DemoButtonThemeVariant {
  protected readonly themes = ['default', 'primary', 'danger', 'warning', 'success'] as const;
}
