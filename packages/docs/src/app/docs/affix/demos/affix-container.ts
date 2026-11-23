import { Component } from '@angular/core';
import { TButtonModule } from '@tdesign-ng/components';
import { TAffixModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-affix-container',
  imports: [TAffixModule, TButtonModule],
  template: `
    <div #box style="height: 260px; overflow-y: auto">
      <div style="height: 160px; padding-top: 16px">
        先向下滚动：按钮先吸附在容器顶部，继续滚到容器底部时会被 offsetBottom 夹住。
      </div>
      <t-affix [container]="box" [offsetBottom]="20">
        <t-button variant="outline">距容器底部 20px</t-button>
      </t-affix>
      <div style="height: 320px"></div>
    </div>
  `,
})
export class DemoAffixContainer {}
