import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';
import { TIcon } from '@tdesign-ng/icons';

@Component({
  selector: 'demo-button-icon',
  imports: [TButtonModule, TSpaceModule, TIcon],
  template: `
    <t-space [breakLine]="true" align="center">
      <t-button theme="primary"><t-icon name="add" tButtonIcon />新建</t-button>
      <t-button variant="outline">下载<t-icon name="download" tButtonSuffix /></t-button>
      <t-button shape="square" theme="primary"><t-icon name="search" tButtonIcon /></t-button>
    </t-space>
  `,
})
export class DemoButtonIcon {}
