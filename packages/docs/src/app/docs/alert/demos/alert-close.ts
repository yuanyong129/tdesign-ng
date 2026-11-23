import { Component, signal } from '@angular/core';
import { TAlertModule, TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-alert-close',
  imports: [TAlertModule, TButtonModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      @if (visible()) {
        <t-alert
          theme="info"
          message="点击关闭按钮后提示会淡出并隐藏，(closed) 在动画结束后触发。"
          [close]="true"
          (close)="onClose()"
          (closed)="onClosed()"
        />
      }
      <t-alert theme="warning" message="close 传入字符串时，它会被当作关闭按钮的文案。" close="知道了" />
      <t-alert
        theme="success"
        message="closeBtn 优先于 close：这里渲染的是默认关闭图标。"
        close="这段文案不会显示"
        [closeBtn]="true"
      />
    </t-space>
    <t-space [size]="12" align="center">
      <t-button variant="outline" (click)="reset()">重新显示第一条</t-button>
      <span class="demo-hint">(close) 触发 {{ closeCount() }} 次，(closed) 触发 {{ closedCount() }} 次。</span>
    </t-space>
  `,
})
export class DemoAlertClose {
  protected readonly visible = signal(true);
  protected readonly closeCount = signal(0);
  protected readonly closedCount = signal(0);

  protected onClose(): void {
    this.closeCount.update((count) => count + 1);
  }

  protected onClosed(): void {
    this.closedCount.update((count) => count + 1);
    this.visible.set(false);
  }

  protected reset(): void {
    this.visible.set(true);
  }
}
