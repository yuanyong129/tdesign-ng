import { Component } from '@angular/core';
import { TSpaceModule, TTagModule, type TagVariant } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-variant',
  imports: [TTagModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      @for (variant of variants; track variant) {
        <t-space [size]="12">
          <span class="demo-label">{{ variant }}</span>
          @for (theme of themes; track theme) {
            <t-tag [variant]="variant" [theme]="theme">{{ theme }}</t-tag>
          }
        </t-space>
      }
    </t-space>
    <p class="demo-hint">variant 控制填充方式：dark / light / outline / light-outline。</p>
  `,
})
export class DemoTagVariant {
  protected readonly variants: TagVariant[] = ['dark', 'light', 'outline', 'light-outline'];

  protected readonly themes = ['default', 'primary', 'warning', 'danger', 'success'] as const;
}
