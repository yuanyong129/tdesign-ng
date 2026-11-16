import { Component, inject, signal } from '@angular/core';
import { TButtonModule, TLoadingService, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-loading-fullscreen',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      <t-button theme="primary" (click)="showFullscreen()">全屏加载 1.5s</t-button>
      <t-button variant="outline" (click)="showDelayed()">延迟 500ms 出现</t-button>
    </t-space>
    <p class="demo-hint">服务式调用会挂到 body 上，并锁住背景滚动；{{ status() }}</p>
  `,
})
export class DemoLoadingFullscreen {
  private readonly loading = inject(TLoadingService);

  protected readonly status = signal('');

  protected showFullscreen(): void {
    this.status.set('正在加载…');
    const instance = this.loading.show({ text: '正在保存' });
    setTimeout(() => {
      instance.hide();
      this.status.set('已结束');
    }, 1500);
  }

  protected showDelayed(): void {
    this.status.set('等待延迟');
    const instance = this.loading.show({ text: '延迟出现', delay: 500 });
    setTimeout(() => {
      instance.hide();
      this.status.set('已结束');
    }, 1500);
  }
}
