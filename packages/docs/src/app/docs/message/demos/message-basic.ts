import { Component, inject } from '@angular/core';
import { TButtonModule, TMessageService, TSpaceModule, type MessageTheme } from '@tdesign-ng/components';

@Component({
  selector: 'demo-message-basic',
  imports: [TButtonModule, TSpaceModule],
  template: `
    <t-space [size]="16" [breakLine]="true">
      @for (theme of themes; track theme) {
        <t-button variant="outline" (click)="open(theme)">{{ theme }}</t-button>
      }
    </t-space>
    <p class="demo-hint">消息挂在 body 上，默认 3 秒后自动关闭。</p>
  `,
})
export class DemoMessageBasic {
  private readonly message = inject(TMessageService);

  protected readonly themes: MessageTheme[] = ['info', 'success', 'warning', 'error', 'question'];

  protected open(theme: MessageTheme): void {
    this.message.show(theme, `这是一条 ${theme} 消息`);
  }
}
