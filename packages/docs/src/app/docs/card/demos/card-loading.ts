import { Component } from '@angular/core';
import { TCardModule, TSwitchModule } from '@tdesign-ng/components';
import type { SwitchValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-card-loading',
  imports: [TCardModule, TSwitchModule],
  template: `
    <t-card
      style="width: 380px"
      [loading]="loading"
      title="卡片标题"
      description="打开开关后，在卡片主体上显示加载遮罩。"
    >
      卡片内容保持可见，加载遮罩由 Loading 组件覆盖在主体上。
    </t-card>

    <p class="demo-hint">
      <t-switch [value]="loading" (valueChange)="onLoadingChange($event)" />
      加载态：{{ loading ? '开' : '关' }}
    </p>
  `,
})
export class DemoCardLoading {
  protected loading = true;

  protected onLoadingChange(value: SwitchValue): void {
    this.loading = !!value;
  }
}
