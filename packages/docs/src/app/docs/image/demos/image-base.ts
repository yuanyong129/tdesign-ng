import { Component } from '@angular/core';
import { TImageModule } from '@tdesign-ng/components';

/** 示例用内联 SVG 渐变图，避免依赖外部图片资源。 */
const LANDSCAPE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230052d6'/%3E%3Cstop offset='1' stop-color='%2300a870'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23g)'/%3E%3C/svg%3E";

const PORTRAIT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23d54941'/%3E%3Cstop offset='1' stop-color='%23ed7b2f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='400' fill='url(%23g)'/%3E%3C/svg%3E";

@Component({
  selector: 'demo-image-base',
  imports: [TImageModule],
  template: `
    <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
      <t-image style="width: 160px; height: 160px" [src]="landscape" alt="风景" />
      <t-image style="width: 160px; height: 160px" shape="round" [src]="landscape" alt="圆角图片" />
      <t-image style="width: 160px; height: 160px" shape="circle" [src]="portrait" alt="圆形图片" />
      <t-image style="width: 160px; height: 160px" gallery [src]="landscape" alt="相册效果" />

      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px">
        <t-image style="width: 160px; height: 160px" [src]="broken" alt="加载失败" [fallback]="landscape" />
        <span>加载失败时使用 fallback</span>
      </div>
    </div>
  `,
})
export class DemoImageBase {
  protected readonly landscape = LANDSCAPE;

  protected readonly portrait = PORTRAIT;

  protected readonly broken = 'not-exists.png';
}
