import { Component } from '@angular/core';
import { TLoadingModule, TSpaceModule, type LoadingSize } from '@tdesign-ng/components';

@Component({
  selector: 'demo-loading-basic',
  imports: [TLoadingModule, TSpaceModule],
  template: `
    <t-space [size]="24" [breakLine]="true">
      <t-loading text="加载中…" />
      @for (size of sizes; track size) {
        <t-loading [size]="size" [text]="size" />
      }
    </t-space>
    <p class="demo-hint">行内加载用 [loading] 控制显隐，尺寸有 small / medium / large。</p>
  `,
})
export class DemoLoadingBasic {
  protected readonly sizes: LoadingSize[] = ['small', 'medium', 'large'];
}
