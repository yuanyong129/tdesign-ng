import { Component } from '@angular/core';
import { TButtonModule } from '@tdesign-ng/components';
import { TAffixModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-affix-base',
  imports: [TAffixModule, TButtonModule],
  template: `
    <div #box style="height: 240px; overflow-y: auto">
      <div style="height: 40px"></div>
      <t-affix [container]="box" [offsetTop]="10">
        <t-button theme="primary">固钉距离容器顶部 10px</t-button>
      </t-affix>
      <div style="height: 480px; padding-top: 16px">向下滚动，按钮会吸附在容器顶部。</div>
    </div>
  `,
})
export class DemoAffixBase {}
