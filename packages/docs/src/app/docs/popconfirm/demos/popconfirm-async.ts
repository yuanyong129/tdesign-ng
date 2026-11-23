import { Component, signal } from '@angular/core';
import { TButtonModule, TPopconfirmModule } from '@tdesign-ng/components';
import type { PopconfirmVisibleChangeEvent } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popconfirm-async',
  imports: [TPopconfirmModule, TButtonModule],
  styles: [
    `
      .demo-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `,
  ],
  template: `
    <div class="demo-row">
      <t-popconfirm
        content="提交后不可撤销，确认提交吗？"
        [visible]="visible()"
        [confirmBtn]="{ loading: loading() }"
        (visibleChange)="handleVisibleChange($event)"
        (confirm)="handleConfirm()"
      >
        <span><t-button theme="primary">提交</t-button></span>
      </t-popconfirm>
      <span class="demo-hint">已提交 {{ submitted() }} 次</span>
    </div>
  `,
})
export class DemoPopconfirmAsync {
  protected readonly visible = signal(false);
  protected readonly loading = signal(false);
  protected readonly submitted = signal(0);

  protected handleVisibleChange(event: PopconfirmVisibleChangeEvent): void {
    // 受控用法：可见性由外部 signal 决定。
    this.visible.set(event.visible);
  }

  protected handleConfirm(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.visible.set(false);
      this.submitted.update((count) => count + 1);
    }, 1000);
  }
}
