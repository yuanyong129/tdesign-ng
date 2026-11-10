import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-button-ghost',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [breakLine]="true">
      <t-button [ghost]="true" variant="outline">幽灵按钮</t-button>
      <t-button [ghost]="true" variant="base" theme="primary">幽灵按钮</t-button>
    </t-space>
  `,
})
export class DemoButtonGhost {}
