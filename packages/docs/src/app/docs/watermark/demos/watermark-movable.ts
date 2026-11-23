import { Component } from '@angular/core';
import { TWatermarkModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-watermark-movable',
  imports: [TWatermarkModule],
  template: `
    <!-- movable 时水印会随机移动：间隔由 moveInterval 决定，此时 x / y / rotate 不生效 -->
    <t-watermark
      [width]="120"
      [height]="64"
      [movable]="true"
      [moveInterval]="3000"
      [alpha]="0.6"
      [watermarkContent]="{ text: 'TDesign', fontSize: 14, fontColor: 'rgba(0, 0, 0, 0.14)' }"
    >
      <div
        style="height: 240px; padding: 12px; border: 1px solid var(--td-component-stroke); border-radius: 6px"
      >
        水印每隔 3 秒换一个随机位置。
      </div>
    </t-watermark>
  `,
})
export class DemoWatermarkMovable {}
