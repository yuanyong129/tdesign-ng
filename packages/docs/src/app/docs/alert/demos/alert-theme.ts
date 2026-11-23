import { Component } from '@angular/core';
import { TAlertModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-alert-theme',
  imports: [TAlertModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      @for (item of themes; track item.theme) {
        <t-alert [theme]="item.theme" [message]="item.message" />
      }
    </t-space>
    <p class="demo-hint">theme 可选 success、info、warning、error，默认 info，图标随主题变化。</p>
  `,
})
export class DemoAlertTheme {
  protected readonly themes = [
    { theme: 'success', message: '成功提示：数据已保存。' },
    { theme: 'info', message: '普通提示：这是一条需要知晓的信息。' },
    { theme: 'warning', message: '警示提示：磁盘空间即将用尽。' },
    { theme: 'error', message: '错误提示：请求失败，请稍后重试。' },
  ] as const;
}
