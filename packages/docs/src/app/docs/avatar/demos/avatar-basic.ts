import { Component } from '@angular/core';
import { TAvatarModule, TSpaceModule, type AvatarSize } from '@tdesign-ng/components';

@Component({
  selector: 'demo-avatar-basic',
  imports: [TAvatarModule, TSpaceModule],
  template: `
    <t-space [size]="16" align="center">
      @for (size of sizes; track size) {
        <t-avatar [size]="size" content="T" />
      }
      <t-avatar image="favicon.svg" alt="TDesign" />
      <t-avatar content="张" [size]="'40px'" />
    </t-space>
    <p class="demo-hint">size 支持 small / medium / large，也可以直接传具体尺寸。</p>
  `,
})
export class DemoAvatarBasic {
  protected readonly sizes: AvatarSize[] = ['small', 'medium', 'large'];
}
