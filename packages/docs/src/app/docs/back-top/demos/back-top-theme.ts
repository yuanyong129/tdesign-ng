import { Component } from '@angular/core';
import { TBackTopModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-back-top-theme',
  imports: [TBackTopModule],
  styles: [
    '.tool-stage { position: relative; height: 240px; transform: translateZ(0); border: 1px dashed var(--td-component-border); border-radius: 6px; }',
  ],
  template: `
    <div class="tool-stage">
      <div #box style="height: 100%; overflow-y: auto">
        <div style="height: 640px; padding: 8px 12px">
          三个按钮常显（visibleHeight 为 0），这里只对比主题、形状与尺寸。
        </div>
      </div>
      <t-back-top [container]="box" [visibleHeight]="0" theme="light" shape="square" />
      <t-back-top
        [container]="box"
        [visibleHeight]="0"
        theme="primary"
        shape="circle"
        [offset]="['112px', '96px']"
      />
      <t-back-top
        [container]="box"
        [visibleHeight]="0"
        theme="dark"
        shape="square"
        size="small"
        [offset]="['200px', '96px']"
      />
    </div>
  `,
})
export class DemoBackTopTheme {}
