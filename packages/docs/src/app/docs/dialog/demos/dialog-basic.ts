import { Component } from '@angular/core';
import { TButtonModule, TDialogModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dialog-basic',
  imports: [TDialogModule, TButtonModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-button theme="primary" (click)="visible = true">打开对话框</t-button>
      <t-dialog
        [(visible)]="visible"
        header="基础对话框"
        body="这是对话框的内容，点击遮罩、按 Esc 或点关闭按钮都可以关闭。"
        (confirm)="handleConfirm()"
      />
      <p class="demo-hint">当前状态：{{ visible ? '已打开' : '已关闭' }}</p>
    </t-space>
  `,
})
export class DemoDialogBasic {
  protected visible = false;

  protected handleConfirm(): void {
    this.visible = false;
  }
}
