import { Component } from '@angular/core';
import { TButtonModule, TDialogModule, TSpaceModule, type DialogTheme } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dialog-theme',
  imports: [TDialogModule, TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (theme of themes; track theme) {
        <t-button variant="outline" (click)="open(theme)">{{ theme }}</t-button>
      }
    </t-space>
    <t-dialog
      [(visible)]="visible"
      [header]="currentHeader"
      [theme]="currentTheme"
      body="主题会改变头部图标的颜色。"
    />
  `,
})
export class DemoDialogTheme {
  protected readonly themes: DialogTheme[] = ['info', 'success', 'warning', 'danger'];

  protected visible = false;

  protected currentTheme: DialogTheme = 'info';

  protected currentHeader = '';

  protected open(theme: DialogTheme): void {
    this.currentTheme = theme;
    this.currentHeader = `${theme} 主题`;
    this.visible = true;
  }
}
