import { Component } from '@angular/core';
import { TSkeletonModule } from '@tdesign-ng/components';
import type { SkeletonRowCol } from '@tdesign-ng/components';

@Component({
  selector: 'demo-skeleton-row-col',
  imports: [TSkeletonModule],
  styles: [
    `
      .demo-skeleton-row-col__card {
        padding: 16px;
        border: 1px solid var(--td-component-stroke, #e7e7e7);
        border-radius: 6px;
      }

      .demo-skeleton-row-col__header {
        margin-bottom: 16px;
        font-weight: 500;
        color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      }
    `,
  ],
  template: `
    <div class="demo-skeleton-row-col__card">
      <div class="demo-skeleton-row-col__header">组合成网页效果</div>
      <t-skeleton [rowCol]="rowCol" animation="gradient" />
    </div>
    <p class="demo-hint">
      数字表示该行等分出的文本列数，对象表示单列，数组表示一行多列；列上可用的字段有
      type、width、height、size、margin、marginLeft、marginRight、content。
    </p>
  `,
})
export class DemoSkeletonRowCol {
  protected readonly rowCol: SkeletonRowCol = [
    [
      { type: 'rect', width: '33%', height: '180px' },
      { type: 'rect', width: '33%', height: '180px' },
      { type: 'rect', width: '33%', height: '180px' },
    ],
    [
      { type: 'circle', size: '50px' },
      { type: 'rect', margin: '20px 0', width: '80%', height: '30px' },
      { type: 'rect', marginLeft: '20px', width: '80px', height: '30px', content: '确定' },
    ],
    1,
    1,
    { type: 'text', width: '70%', margin: '0 0 16px 0' },
    { type: 'rect', width: '100%', height: '120px' },
  ];
}
