import { Component } from '@angular/core';
import { TWatermarkModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-watermark-base',
  imports: [TWatermarkModule],
  template: `
    <!-- width / height 是单个水印块的尺寸，x / y 是块之间的间距，watermarkContent 是被绘制的文字 -->
    <t-watermark
      [width]="120"
      [height]="64"
      [x]="80"
      [y]="80"
      [watermarkContent]="{ text: 'TDesign', fontSize: 14, fontColor: 'rgba(0, 0, 0, 0.12)' }"
    >
      <div
        style="height: 240px; padding: 12px; border: 1px solid var(--td-component-stroke); border-radius: 6px"
      >
        水印覆盖在下方的投影内容之上，默认平铺（isRepeat）。
      </div>
    </t-watermark>
  `,
})
export class DemoWatermarkBase {}
