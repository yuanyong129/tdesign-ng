import { Component } from '@angular/core';
import { TButtonModule, TDrawerModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-drawer-basic',
  imports: [TDrawerModule, TButtonModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-button theme="primary" (click)="visible = true">打开抽屉</t-button>
      <t-drawer
        [(visible)]="visible"
        header="基础抽屉"
        body="抽屉默认从右侧滑出，宽度由 size 控制。"
        (confirm)="visible = false"
      />
      <p class="demo-hint">当前状态：{{ visible ? '已打开' : '已关闭' }}</p>
    </t-space>
  `,
})
export class DemoDrawerBasic {
  protected visible = false;
}
