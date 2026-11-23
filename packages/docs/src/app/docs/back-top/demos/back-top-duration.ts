import { Component } from '@angular/core';
import { TBackTopModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-back-top-duration',
  imports: [TBackTopModule],
  styles: [
    '.tool-stage { position: relative; height: 240px; transform: translateZ(0); border: 1px dashed var(--td-component-border); border-radius: 6px; }',
  ],
  template: `
    <div class="tool-stage">
      <div #box style="height: 100%; overflow-y: auto">
        <div style="height: 900px; padding: 8px 12px">
          duration 设为 800ms，点击按钮后能明显看到缓出滚动。
        </div>
      </div>
      <t-back-top [container]="box" [visibleHeight]="0" [duration]="800" content="回顶部" />
    </div>
  `,
})
export class DemoBackTopDuration {}
