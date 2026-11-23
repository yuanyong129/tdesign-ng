import { Component } from '@angular/core';
import { TSkeletonModule } from '@tdesign-ng/components';
import type { SkeletonTheme } from '@tdesign-ng/components';

@Component({
  selector: 'demo-skeleton-theme',
  imports: [TSkeletonModule],
  styles: [
    `
      .demo-skeleton-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .demo-skeleton-grid__card {
        flex: 1 1 240px;
        min-width: 220px;
        padding: 16px;
        border: 1px solid var(--td-component-stroke, #e7e7e7);
        border-radius: 6px;
      }

      .demo-skeleton-grid__header {
        margin-bottom: 16px;
        font-weight: 500;
        color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      }
    `,
  ],
  template: `
    <div class="demo-skeleton-grid">
      @for (theme of themes; track theme.value) {
        <div class="demo-skeleton-grid__card">
          <div class="demo-skeleton-grid__header">{{ theme.label }}</div>
          <t-skeleton [theme]="theme.value" animation="gradient" />
        </div>
      }
    </div>
  `,
})
export class DemoSkeletonTheme {
  protected readonly themes: Array<{ label: string; value: SkeletonTheme }> = [
    { label: '文本', value: 'text' },
    { label: '头像', value: 'avatar' },
    { label: '段落', value: 'paragraph' },
    { label: '头像描述', value: 'avatar-text' },
    { label: '选项卡', value: 'tab' },
    { label: '文章', value: 'article' },
  ];
}
