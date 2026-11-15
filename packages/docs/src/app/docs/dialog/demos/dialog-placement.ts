import { Component } from '@angular/core';
import { TButtonModule, TDialogModule, TSpaceModule, type DialogPlacement } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dialog-placement',
  imports: [TDialogModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (item of placements; track item) {
        <t-button variant="outline" (click)="open(item)">{{ item }}</t-button>
      }
    </t-space>
    <t-dialog
      [(visible)]="visible"
      [header]="currentHeader"
      [placement]="currentPlacement"
      width="520px"
      body="placement 控制垂直位置，width 控制宽度。"
    />
  `,
})
export class DemoDialogPlacement {
  protected readonly placements: DialogPlacement[] = ['top', 'center'];

  protected visible = false;

  protected currentHeader = '';

  protected currentPlacement: DialogPlacement = 'top';

  protected open(placement: DialogPlacement): void {
    this.currentPlacement = placement;
    this.currentHeader = `placement: ${placement}`;
    this.visible = true;
  }
}
