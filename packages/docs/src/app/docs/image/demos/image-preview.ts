import { Component, signal } from '@angular/core';
import { TImageModule, TImageViewerModule } from '@tdesign-ng/components';

/** 示例用内联 SVG 渐变图，避免依赖外部图片资源。 */
const IMAGES = [
  {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230052d6'/%3E%3Cstop offset='1' stop-color='%2300a870'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23g)'/%3E%3C/svg%3E",
    alt: '风景一',
  },
  {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23d54941'/%3E%3Cstop offset='1' stop-color='%23ed7b2f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='400' fill='url(%23g)'/%3E%3C/svg%3E",
    alt: '风景二',
  },
  {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='1' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23005a8a'/%3E%3Cstop offset='1' stop-color='%2341b6c3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23g)'/%3E%3C/svg%3E",
    alt: '风景三',
  },
];

@Component({
  selector: 'demo-image-preview',
  imports: [TImageModule, TImageViewerModule],
  template: `
    <div style="display: flex; gap: 16px; flex-wrap: wrap">
      @for (image of images; track image.src; let i = $index) {
        <t-image
          style="width: 160px; height: 120px"
          [src]="image.src"
          [alt]="image.alt"
          overlayTrigger="hover"
          [overlayContent]="overlay"
          (click)="openViewer(i)"
        />
      }
    </div>

    <ng-template #overlay>
      <div
        style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: rgba(0, 0, 0, 45%); color: #fff; font-size: 14px"
      >
        点击预览
      </div>
    </ng-template>

    <t-image-viewer
      [(visible)]="viewerVisible"
      [images]="sources"
      [index]="currentIndex()"
      (indexChange)="currentIndex.set($event.index)"
    />
  `,
})
export class DemoImagePreview {
  protected readonly images = IMAGES;

  protected readonly sources = IMAGES.map((image) => image.src);

  protected readonly currentIndex = signal(0);

  protected viewerVisible = false;

  protected openViewer(index: number): void {
    this.currentIndex.set(index);
    this.viewerVisible = true;
  }
}
