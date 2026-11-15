import { Component } from '@angular/core';
import { TButtonModule, TDrawerModule, TSpaceModule, type DrawerPlacement } from '@tdesign-ng/components';

@Component({
  selector: 'demo-drawer-placement',
  imports: [TDrawerModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (item of placements; track item) {
        <t-button variant="outline" (click)="open(item)">{{ item }}</t-button>
      }
    </t-space>
    <t-drawer [(visible)]="visible" [header]="currentHeader" [placement]="currentPlacement" size="320px">
      四个方向都能滑出，左右方向 size 是宽度，上下方向 size 是高度。
    </t-drawer>
  `,
})
export class DemoDrawerPlacement {
  protected readonly placements: DrawerPlacement[] = ['left', 'right', 'top', 'bottom'];

  protected visible = false;

  protected currentHeader = '';

  protected currentPlacement: DrawerPlacement = 'right';

  protected open(placement: DrawerPlacement): void {
    this.currentPlacement = placement;
    this.currentHeader = `placement: ${placement}`;
    this.visible = true;
  }
}
