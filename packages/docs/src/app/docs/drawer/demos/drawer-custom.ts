import { Component } from '@angular/core';
import { TButtonModule, TDrawerModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-drawer-custom',
  imports: [TDrawerModule, TButtonModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-button theme="primary" (click)="visible = true">自定义底部</t-button>
      <t-drawer [(visible)]="visible" header="编辑详情" size="420px" [footer]="true">
        <p>抽屉内容可以任意投影，底部按钮也能完全自定义。</p>
        <div tDrawerFooter>
          <t-button variant="text" (click)="visible = false">关闭</t-button>
          <t-button theme="primary" (click)="visible = false">提交</t-button>
        </div>
      </t-drawer>
    </t-space>
  `,
})
export class DemoDrawerCustom {
  protected visible = false;
}
