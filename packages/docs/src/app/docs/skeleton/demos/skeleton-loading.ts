import { Component, signal } from '@angular/core';
import { TButton, TSkeletonModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-skeleton-loading',
  imports: [TButton, TSkeletonModule],
  styles: [
    `
      .demo-skeleton-loading + .demo-skeleton-loading {
        margin-top: 24px;
      }

      .demo-skeleton-loading__text {
        margin: 0;
        line-height: 25px;
        color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      }
    `,
  ],
  template: `
    <p class="demo-hint">
      骨架屏通过 ng-content 包裹真实内容，loading 为 true 时展示骨架屏。
      <t-button size="small" variant="outline" (click)="loading.set(!loading())">
        {{ loading() ? '加载完成' : '重新加载' }}
      </t-button>
    </p>

    <div class="demo-skeleton-loading">
      <t-skeleton [loading]="loading()" animation="gradient">
        <p class="demo-skeleton-loading__text">
          骨架屏组件，是指当网络较慢时，在页面真实数据加载之前，给用户展示出页面的大致结构。
          一方面让用户对页面有一定的心理预期，另一方面可以改善长期停留在空白屏给用户带来的枯燥和不适感。
        </p>
      </t-skeleton>
    </div>

    <div class="demo-skeleton-loading">
      <t-skeleton [loading]="loading()" animation="gradient" [delay]="1500" theme="paragraph">
        <p class="demo-skeleton-loading__text">
          这一段设置了 delay 为 1500 毫秒：重新加载时会先展示真实内容，1.5 秒后才切换为骨架屏。
        </p>
      </t-skeleton>
    </div>
  `,
})
export class DemoSkeletonLoading {
  protected readonly loading = signal(true);
}
