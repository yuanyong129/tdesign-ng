import { Component } from '@angular/core';
import { TSpaceModule, TTagModule, type TagShape, type TagSize } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-shape',
  imports: [TTagModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-space [size]="12">
        @for (shape of shapes; track shape) {
          <t-tag theme="primary" variant="light" [shape]="shape">{{ shape }}</t-tag>
        }
      </t-space>
      <t-space [size]="12">
        @for (size of sizes; track size) {
          <t-tag theme="primary" [size]="size">{{ size }}</t-tag>
        }
      </t-space>
      <t-space [size]="12">
        <t-tag theme="primary" [maxWidth]="120" [title]="true">
          这是一段很长很长的标签文字，超出会被省略
        </t-tag>
      </t-space>
    </t-space>
    <p class="demo-hint">shape 控制圆角形态，maxWidth 超出后省略并保留 title 提示。</p>
  `,
})
export class DemoTagShape {
  protected readonly shapes: TagShape[] = ['square', 'round', 'mark'];

  protected readonly sizes: TagSize[] = ['small', 'medium', 'large'];
}
