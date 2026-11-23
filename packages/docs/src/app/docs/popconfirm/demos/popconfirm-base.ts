import { Component, signal } from '@angular/core';
import { TButtonModule, TPopconfirmModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popconfirm-base',
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
      <t-popconfirm content="确认删除该项吗？删除后不可恢复。" (confirm)="handleConfirm()" (cancel)="handleCancel()">
        <span><t-button theme="danger" variant="outline">删除</t-button></span>
      </t-popconfirm>
      <span class="demo-hint">操作结果：{{ message() }}</span>
    </div>
  `,
})
export class DemoPopconfirmBase {
  protected readonly message = signal('暂无');

  protected handleConfirm(): void {
    this.message.set('已确认');
  }

  protected handleCancel(): void {
    this.message.set('已取消');
  }
}
