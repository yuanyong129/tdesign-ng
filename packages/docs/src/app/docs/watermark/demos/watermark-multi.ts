import { Component } from '@angular/core';
import { TWatermarkModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-watermark-multi',
  imports: [TWatermarkModule],
  template: `
    <!-- watermarkContent 传数组时按顺序竖向排布，行距由 lineSpace 控制 -->
    <t-watermark
      [width]="160"
      [height]="80"
      [x]="100"
      [y]="100"
      [lineSpace]="24"
      [watermarkContent]="[
        { text: 'TDesign', fontSize: 16, fontWeight: 'bold', fontColor: 'rgba(0, 0, 0, 0.14)' },
        { text: 'tdesign.tencent.com', fontSize: 12, fontColor: 'rgba(0, 0, 0, 0.1)' }
      ]"
    >
      <div
        style="height: 240px; padding: 12px; border: 1px solid var(--td-component-stroke); border-radius: 6px"
      >
        每个水印块里画两行文字。
      </div>
    </t-watermark>
  `,
})
export class DemoWatermarkMulti {}
