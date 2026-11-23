import { Component } from '@angular/core';
import { TColorPickerModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-color-picker-swatches',
  imports: [TColorPickerModule],
  styles: [
    `
      .demo-color-picker-recent {
        margin: 12px 0 0;
        color: var(--td-text-color-secondary);
        font-size: 14px;
      }
    `,
  ],
  template: `
    <t-color-picker
      format="HEX"
      [value]="color"
      [swatchColors]="swatches"
      [recentColors]="true"
      (change)="color = $event.value"
      (recentColorsChange)="recent = $event"
    />
    <p class="demo-color-picker-recent">
      当前颜色：{{ color }}，最近使用 {{ recent.length }} 个颜色
    </p>
  `,
})
export class DemoColorPickerSwatches {
  protected color = '#00A870';

  protected recent: string[] = [];

  protected readonly swatches = [
    '#0052D9',
    '#00A870',
    '#ED7B2F',
    '#E34D59',
    '#8B5CF6',
    '#0EA5E9',
    '#F59E0B',
    '#14B8A6',
  ];
}
