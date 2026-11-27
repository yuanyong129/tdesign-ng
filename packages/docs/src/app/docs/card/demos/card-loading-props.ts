import { Component, signal } from '@angular/core';
import { TButton, TCard, TLoading } from '@tdesign-ng/components';

@Component({
  selector: 'demo-card-loading-props',
  imports: [TButton, TCard, TLoading],
  template: `
    <t-button variant="text" (click)="loading.set(!loading())">切换卡片加载</t-button>
    <t-card title="加载配置" footer="底部始终可见" [loading]="loading()"
      [loadingProps]="{ text: '读取中', size: 'large', delay: 500, inheritColor: true }">
      <t-button variant="text" (click)="count.update(increment)">内容计数 {{ count() }}</t-button>
    </t-card>
    <!-- 两个全屏实例用于验证只释放自己的滚动锁。示例默认关闭。 -->
    @if (firstFullscreen()) {
      <t-loading fullscreen text="第一层" />
    }
    @if (secondFullscreen()) {
      <t-loading fullscreen text="第二层" />
    }
  `,
})
export class DemoCardLoadingProps {
  readonly loading = signal(false);
  readonly count = signal(0);
  readonly increment = (value: number) => value + 1;
  readonly firstFullscreen = signal(false);
  readonly secondFullscreen = signal(false);
}
