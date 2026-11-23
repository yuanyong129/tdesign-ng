import { Component } from '@angular/core';
import { TCheckTagModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-check-tag-basic',
  imports: [TCheckTagModule, TSpaceModule],
  template: `
    <t-space [size]="12">
      <t-check-tag [(checked)]="checked">双向绑定</t-check-tag>
      <t-check-tag [defaultChecked]="true">默认选中</t-check-tag>
      <t-check-tag (checkedChange)="lastChecked = $event">事件回调</t-check-tag>
    </t-space>
    <p class="demo-hint">双向绑定 {{ checked }}，最近一次切换 {{ lastChecked }}。</p>
  `,
})
export class DemoCheckTagBasic {
  protected checked = false;

  protected lastChecked = false;
}
