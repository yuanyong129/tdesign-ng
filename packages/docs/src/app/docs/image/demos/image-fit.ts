import { Component } from '@angular/core';
import { TImageModule } from '@tdesign-ng/components';

/** 示例用内联 SVG 渐变图，避免依赖外部图片资源。 */
const IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23d54941'/%3E%3Cstop offset='1' stop-color='%23ed7b2f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='400' fill='url(%23g)'/%3E%3C/svg%3E";

@Component({
  selector: 'demo-image-fit',
  imports: [TImageModule],
  template: `
    <div style="display: flex; gap: 16px; flex-wrap: wrap">
      @for (fit of fits; track fit) {
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px">
          <t-image style="width: 120px; height: 120px" [src]="image" [fit]="fit" [alt]="fit" />
          <span>{{ fit }}</span>
        </div>
      }

      @for (position of positions; track position) {
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px">
          <t-image
            style="width: 120px; height: 120px"
            [src]="image"
            fit="none"
            [position]="position"
            [alt]="position"
          />
          <span>none / {{ position }}</span>
        </div>
      }
    </div>
  `,
})
export class DemoImageFit {
  protected readonly image = IMAGE;

  protected readonly fits = ['fill', 'contain', 'cover', 'scale-down', 'none'] as const;

  protected readonly positions = ['center', 'top', 'bottom', 'left', 'right'] as const;
}
