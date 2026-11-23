import { Component } from '@angular/core';
import { TButtonModule, TImageViewerModule, TSpaceModule } from '@tdesign-ng/components';

/** 示例用内联 SVG 渐变图，避免依赖外部图片资源。 */
const IMAGES = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230052d6'/%3E%3Cstop offset='1' stop-color='%2300a870'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23g)'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23d54941'/%3E%3Cstop offset='1' stop-color='%23ed7b2f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='400' fill='url(%23g)'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='1' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23005a8a'/%3E%3Cstop offset='1' stop-color='%2341b6c3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23g)'/%3E%3C/svg%3E",
];

@Component({
  selector: 'demo-image-viewer-base',
  imports: [TButtonModule, TImageViewerModule, TSpaceModule],
  template: `
    <t-space [size]="16" align="center">
      <t-button theme="primary" (click)="visible = true">打开预览</t-button>
      <t-button (click)="visible = false">关闭预览</t-button>
      <span>当前第 {{ index + 1 }} 张，共 {{ images.length }} 张</span>
      <span>关闭来源：{{ lastTrigger }}</span>
    </t-space>

        <!-- 默认触发器是 100% 填充父级的缩略图，这里给它一个 40px 的盒子。 -->
    <div style="width: 40px; height: 40px">
  <t-image-viewer
        [(visible)]="visible"
        [images]="images"
        [index]="index"
        (indexChange)="index = $event.index"
        (close)="lastTrigger = $event.trigger"
      />
    </div>
  `,
})
export class DemoImageViewerBase {
  protected readonly images = IMAGES;

  protected index = 0;

  protected visible = false;

  protected lastTrigger = '未关闭';
}
