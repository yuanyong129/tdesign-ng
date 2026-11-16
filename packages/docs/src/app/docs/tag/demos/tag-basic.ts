import { Component } from '@angular/core';
import { TSpaceModule, TTagModule, type TagTheme } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-basic',
  imports: [TTagModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (theme of themes; track theme) {
        <t-tag [theme]="theme">{{ theme }}</t-tag>
      }
    </t-space>
    <p class="demo-hint">默认变体是 dark，主题决定底色。</p>
  `,
})
export class DemoTagBasic {
  protected readonly themes: TagTheme[] = ['default', 'primary', 'warning', 'danger', 'success'];
}
