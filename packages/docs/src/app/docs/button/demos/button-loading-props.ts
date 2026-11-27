import { Component, signal } from '@angular/core';
import { TButton } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-loading-props',
  imports: [TButton],
  template: `
    <t-button [loading]="loading()" [loadingProps]="{ size: 'small', text: '提交中', inheritColor: true }"
      (click)="clicks.update(increment)">提交</t-button>
    <t-button variant="outline" [loading]="loading()" [loadingProps]="{ delay: 500, size: 'large', inheritColor: false }">
      延迟显示图标
    </t-button>
    <t-button variant="text" (click)="loading.set(!loading())">切换加载</t-button>
    <p aria-live="polite">提交回调 {{ clicks() }} 次；图标延迟期间按钮仍禁止提交。</p>
  `,
})
export class DemoButtonLoadingProps {
  readonly loading = signal(false);
  readonly clicks = signal(0);
  readonly increment = (value: number) => value + 1;
}
