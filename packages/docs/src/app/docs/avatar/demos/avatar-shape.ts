import { Component } from '@angular/core';
import { TAvatarModule, TSpaceModule, type AvatarShape } from '@tdesign-ng/components';

@Component({
  selector: 'demo-avatar-shape',
  imports: [TAvatarModule, TSpaceModule],
  template: `
    <t-space [size]="16" align="center">
      @for (shape of shapes; track shape) {
        <t-avatar [shape]="shape" [size]="'large'" [content]="shape.slice(0, 1).toUpperCase()" />
      }
      <t-avatar image="favicon.svg" shape="round" [size]="'large'" />
      <t-avatar image="favicon.svg" shape="square" [size]="'large'" />
    </t-space>
    <p class="demo-hint">shape 支持 circle / round / square，三种形状都保持同一尺寸。</p>
  `,
})
export class DemoAvatarShape {
  protected readonly shapes: AvatarShape[] = ['circle', 'round', 'square'];
}
