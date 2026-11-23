import { Component } from '@angular/core';
import { TBackTopModule } from '@tdesign-ng/components';

/**
 * 回到顶部按钮是 `position: fixed` 的，直接用会飘在视口右下角、盖住文档正文。
 * 这里用 `transform: translateZ(0)` 建一个包含块，让固定定位落在示例舞台内。
 */
@Component({
  selector: 'demo-back-top-base',
  imports: [TBackTopModule],
  styles: [
    '.tool-stage { position: relative; height: 240px; transform: translateZ(0); border: 1px dashed var(--td-component-border); border-radius: 6px; }',
  ],
  template: `
    <div class="tool-stage">
      <div #box style="height: 100%; overflow-y: auto">
        <div style="height: 640px; padding: 8px 12px">
          在容器内向下滚动超过 120px，右下角出现回到顶部按钮。
        </div>
      </div>
      <t-back-top [container]="box" [visibleHeight]="120" />
    </div>
  `,
})
export class DemoBackTopBase {}
