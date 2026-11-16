import { Component } from '@angular/core';
import { TSpaceModule, TTagModule, type TagVariant } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-color',
  imports: [TTagModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      @for (variant of variants; track variant) {
        <t-space [size]="12">
          @for (color of colors; track color) {
            <t-tag [color]="color" [variant]="variant">{{ color }}</t-tag>
          }
        </t-space>
      }
    </t-space>
    <p class="demo-hint">自定义颜色会按亮度自动选择黑字或白字。</p>
  `,
})
export class DemoTagColor {
  protected readonly variants: TagVariant[] = ['dark', 'light', 'outline'];

  protected readonly colors = ['#0052d9', '#00a870', '#e37318', '#f6f6f6'];
}
