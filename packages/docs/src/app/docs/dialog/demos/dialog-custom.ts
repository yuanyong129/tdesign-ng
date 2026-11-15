import { Component } from '@angular/core';
import { TButtonModule, TDialogModule, TInputModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dialog-custom',
  imports: [TDialogModule, TButtonModule, TInputModule],
  template: `
    <t-button theme="primary" (click)="visible = true">自定义内容</t-button>
    <t-dialog [(visible)]="visible" header="编辑名称" [closeBtn]="false">
      <t-input [(value)]="name" placeholder="请输入名称" />
      <div tDialogFooter>
        <t-button variant="text" (click)="visible = false">稍后再说</t-button>
        <t-button theme="primary" (click)="save()">保存</t-button>
      </div>
    </t-dialog>
  `,
})
export class DemoDialogCustom {
  protected visible = false;

  protected name = '';

  protected save(): void {
    this.visible = false;
  }
}
