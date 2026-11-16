import { Component } from '@angular/core';
import { TAvatarModule, TSpaceModule, type AvatarCascading } from '@tdesign-ng/components';

@Component({
  selector: 'demo-avatar-group',
  imports: [TAvatarModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <t-avatar-group [max]="3">
        @for (name of names; track name) {
          <t-avatar [content]="name" shape="circle" />
        }
      </t-avatar-group>

      <t-avatar-group [cascading]="'left-up'" [size]="'large'">
        @for (name of names.slice(0, 4); track name) {
          <t-avatar [content]="name" image="favicon.svg" />
        }
      </t-avatar-group>
    </t-space>
    <p class="demo-hint">max 超出部分折叠成 +N，cascading 控制层叠方向。</p>
  `,
})
export class DemoAvatarGroup {
  protected readonly names = ['A', 'B', 'C', 'D', 'E'];

  protected readonly cascading: AvatarCascading = 'left-up';
}
