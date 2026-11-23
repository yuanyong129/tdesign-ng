import { Component } from '@angular/core';
import { TButtonModule, TImageViewerModule, TSpaceModule } from '@tdesign-ng/components';

/** 示例用内联 SVG 渐变图，避免依赖外部图片资源。 */
const IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230052d6'/%3E%3Cstop offset='1' stop-color='%2300a870'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23g)'/%3E%3C/svg%3E";

@Component({
  selector: 'demo-image-viewer-tools',
  imports: [TButtonModule, TImageViewerModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-space [size]="16" align="center">
        <t-button theme="primary" (click)="visible = true">打开预览</t-button>
        <span>缩放范围 {{ scale.min }} ~ {{ scale.max }}，步长 {{ scale.step }}</span>
      </t-space>

      <t-space [size]="24" align="center">
        <label style="display: inline-flex; align-items: center; gap: 6px">
          <input type="checkbox" [checked]="closeOnOverlay" (change)="closeOnOverlay = !closeOnOverlay" />
          点击遮罩关闭
        </label>
        <label style="display: inline-flex; align-items: center; gap: 6px">
          <input type="checkbox" [checked]="showOverlay" (change)="showOverlay = !showOverlay" />
          显示遮罩
        </label>
      </t-space>

          <!-- 默认触发器是 100% 填充父级的缩略图，这里给它一个 40px 的盒子。 -->
    <div style="width: 40px; height: 40px">
  <t-image-viewer
          [(visible)]="visible"
          [images]="images"
          [imageScale]="scale"
          [closeOnOverlay]="closeOnOverlay"
          [showOverlay]="showOverlay"
          title="工具条与缩放配置"
        />
    </div>
    </t-space>
  `,
})
export class DemoImageViewerTools {
  protected readonly images = [IMAGE];

  protected readonly scale = { max: 3, min: 0.5, step: 0.5, defaultScale: 1 };

  protected visible = false;

  protected closeOnOverlay = false;

  protected showOverlay = true;
}
